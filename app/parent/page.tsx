"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {createClient} from "@supabase/supabase-js";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
export default function ParentPortal(){
 const[students,setStudents]=useState<any[]>([]);const[selected,setSelected]=useState<string|null>(null);const[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const{data:{user}}=await supabase.auth.getUser();if(!user){location.href="/login";return;}
  const{data:links}=await supabase.from("parent_student_links").select("student_id,relationship").eq("parent_id",user.id);const ids=(links??[]).map((x:any)=>x.student_id);
  if(!ids.length){setLoading(false);return;}
  const{data:profiles}=await supabase.from("profiles").select("id,full_name,email,status").in("id",ids);
  const result=await Promise.all((profiles??[]).map(async(s:any)=>{const rel=(links??[]).find((x:any)=>x.student_id===s.id)?.relationship??"Student";
   const[en,att,prog,cert,as]=await Promise.all([
    supabase.from("enrollments").select("id",{count:"exact",head:true}).eq("student_id",s.id),
    supabase.from("attendance").select("id,status",{count:"exact"}).eq("student_id",s.id),
    supabase.from("lesson_progress").select("id",{count:"exact",head:true}).eq("student_id",s.id).eq("completed",true),
    supabase.from("certificates").select("id,certificate_number,issued_at,course_id",{count:"exact"}).eq("student_id",s.id),
    supabase.from("assignments").select("id,title,max_score,due_at,courses(title),submissions(score,feedback,submitted_at)").order("due_at")
   ]);
   const attendance=att.data??[];const present=attendance.filter((r:any)=>String(r.status).toLowerCase()==="present").length;
   return {...s,relationship:rel,courses:en.count??0,attendance:attendance.length,present,completed:prog.count??0,certificates:cert.count??0,assignments:as.data??[],grades:(as.data??[]).filter((a:any)=>a.submissions?.[0]?.score!=null)};
  }));setStudents(result);setSelected(result[0]?.id??null);setLoading(false);
 })()},[]);
 const current=students.find(s=>s.id===selected);
 return <main className="app-shell"><div className="ambient"/><div className="container">
  <nav className="nav"><Link href="/dashboard" className="brand">Skill<span>Arc</span></Link><Link href="/dashboard" className="btn">Dashboard</Link></nav>
  <section className="page-head"><div className="eyebrow">Parent Portal · Read only</div><h1>Student progress.</h1><p>Monitor only the student accounts explicitly linked to you. Parent access cannot edit academic records.</p></section>
  {loading?<div className="card">Loading linked students...</div>:!students.length?<div className="card"><h3>No linked students</h3><p>Your institute administrator must link a student to this parent account.</p></div>:<>
   {students.length>1&&<div className="grid" style={{marginBottom:24}}>{students.map(s=><button key={s.id} className="card" onClick={()=>setSelected(s.id)} style={{textAlign:"left",border:selected===s.id?"1px solid #6d8cff":undefined,cursor:"pointer"}}><div className="tag">{s.relationship}</div><h3>{s.full_name??"Student"}</h3><p>{s.email}</p></button>)}</div>}
   {current&&<><div className="stat-grid"><div className="stat"><b>{current.courses}</b><span>Courses</span></div><div className="stat"><b>{current.present}/{current.attendance}</b><span>Attendance</span></div><div className="stat"><b>{current.completed}</b><span>Lessons complete</span></div><div className="stat"><b>{current.certificates}</b><span>Certificates</span></div></div>
    <div className="grid" style={{marginTop:24}}><section className="card"><div className="tag">Academic</div><h3>Assignments & grades</h3>{current.grades.length?<div className="stack">{current.grades.map((a:any)=><div className="lesson" key={a.id}><b>{a.title}</b><span>{a.courses?.title??"Course"} · {a.submissions?.[0]?.score}/{a.max_score}</span>{a.submissions?.[0]?.feedback&&<small>{a.submissions[0].feedback}</small>}</div>)}</div>:<p>No graded assignments yet.</p>}</section>
    <section className="card"><div className="tag">Certificates</div><h3>Achievements</h3><p>{current.certificates ? "Certificate records are available to view." : "No certificates issued yet."}</p><div className="notice">Certificate records are read-only.</div></section></div>
    <div className="card" style={{marginTop:24}}><div className="tag">Privacy</div><h3>Read-only parent access</h3><p>You can view linked student progress, attendance, assignments, grades and certificates. You cannot modify academic records or access unrelated students.</p></div>
   </>}
  </>}
 </div></main>
}