"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {createClient} from "@supabase/supabase-js";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
export default function ParentPortal(){
 const [students,setStudents]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const{data:{user}}=await supabase.auth.getUser();if(!user){location.href="/login";return;}
  const {data:links}=await supabase.from("parent_student_links").select("student_id,relationship").eq("parent_id",user.id);
  const ids=(links??[]).map((x:any)=>x.student_id);
  if(!ids.length){setStudents([]);setLoading(false);return;}
  const {data:profiles}=await supabase.from("profiles").select("id,full_name,email,status").in("id",ids);
  const enriched=await Promise.all((profiles??[]).map(async(s:any)=>{
   const [en,att,prog,cert]=await Promise.all([
    supabase.from("enrollments").select("id",{count:"exact",head:true}).eq("student_id",s.id),
    supabase.from("attendance").select("id",{count:"exact",head:true}).eq("student_id",s.id),
    supabase.from("lesson_progress").select("id",{count:"exact",head:true}).eq("student_id",s.id).eq("completed",true),
    supabase.from("certificates").select("id",{count:"exact",head:true}).eq("student_id",s.id)
   ]);
   return {...s,courses:en.count??0,attendance:att.count??0,completed:prog.count??0,certificates:cert.count??0};
  })); setStudents(enriched);setLoading(false);
 })()},[]);
 return <main className="app-shell"><div className="ambient"/><div className="container">
  <nav className="nav"><Link href="/dashboard" className="brand">Skill<span>Arc</span></Link><Link href="/dashboard" className="btn">Dashboard</Link></nav>
  <section className="page-head"><div className="eyebrow">Parent Portal · Read only</div><h1>Student progress.</h1><p>Only students explicitly linked to your parent account are shown. This portal does not provide editing access.</p></section>
  {loading?<div className="card">Loading linked students...</div>:!students.length?<div className="card"><h3>No linked students</h3><p>Your institute administrator must link a student to this parent account.</p></div>:
   <div className="grid">{students.map(s=><article className="card" key={s.id}><div className="tag">Linked student</div><h2>{s.full_name??"Student"}</h2><p>{s.email}</p><div className="stat-grid"><div className="stat"><b>{s.courses}</b><span>Courses</span></div><div className="stat"><b>{s.attendance}</b><span>Attendance</span></div><div className="stat"><b>{s.completed}</b><span>Lessons complete</span></div><div className="stat"><b>{s.certificates}</b><span>Certificates</span></div></div><div style={{marginTop:18}} className="notice">Read-only access · Grades, attendance, assignments and certificates are protected by database policies.</div></article>)}</div>}
 </div></main>
}