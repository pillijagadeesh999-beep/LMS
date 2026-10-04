"use client";
import {useEffect,useState} from "react";import Link from "next/link";import {createClient} from "@supabase/supabase-js";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
export default function Business(){
 const[account,setAccount]=useState<any>(null);const[jobs,setJobs]=useState<any[]>([]);const[applications,setApplications]=useState<any[]>([]);const[loading,setLoading]=useState(true);const[form,setForm]=useState({title:"",description:"",location:"",employment_type:"Full-time",skills:""});
 async function load(){const{data:{user}}=await supabase.auth.getUser();if(!user){location.href="/login";return;}
  const{data:ba}=await supabase.from("business_accounts").select("id,organization_id,company_name,contact_name,contact_email").eq("contact_email",user.email).maybeSingle();
  if(!ba){setAccount(null);setLoading(false);return;} setAccount(ba);
  const{data:j}=await supabase.from("job_postings").select("*").eq("organization_id",ba.organization_id).order("created_at",{ascending:false});setJobs(j??[]);
  if(j?.length){const ids=j.map((x:any)=>x.id);const{data:a}=await supabase.from("job_applications").select("id,job_id,candidate_id,status,cover_note,created_at").in("job_id",ids).order("created_at",{ascending:false});setApplications(a??[]);}
  setLoading(false);
 }
 useEffect(()=>{load()},[]);
 async function createJob(){const{data:{user}}=await supabase.auth.getUser();if(!user||!account)return;
  const{error}=await supabase.from("job_postings").insert({organization_id:account.organization_id,posted_by:user.id,title:form.title,description:form.description,location:form.location,employment_type:form.employment_type,skills:form.skills.split(",").map(s=>s.trim()).filter(Boolean),status:"open"});
  if(!error){setForm({title:"",description:"",location:"",employment_type:"Full-time",skills:""});load();}
 }
 if(loading)return <main className="app-shell"><div className="container"><div className="card" style={{marginTop:70}}>Loading Business Hub...</div></div></main>;
 return <main className="app-shell"><div className="ambient"/><div className="container"><nav className="nav"><Link href="/dashboard" className="brand">Skill<span>Arc</span></Link><Link href="/dashboard" className="btn">Dashboard</Link></nav>
 <section className="page-head"><div className="eyebrow">Business · Talent</div><h1>{account?account.company_name:"Business Hub"}</h1><p>Build your company presence, publish opportunities and manage candidates.</p></section>
 {!account?<div className="card"><h3>Business account setup needed</h3><p>Your business login must be linked to a SkillArc business account before recruiting tools can be used.</p></div>:<>
 <div className="stat-grid"><div className="stat"><b>{jobs.length}</b><span>Job posts</span></div><div className="stat"><b>{applications.length}</b><span>Applications</span></div><div className="stat"><b>{jobs.filter((j:any)=>j.status==="open").length}</b><span>Open roles</span></div><div className="stat"><b>{applications.filter((a:any)=>a.status==="shortlisted").length}</b><span>Shortlisted</span></div></div>
 <div className="grid" style={{marginTop:24}}><section className="card"><div className="tag">Recruiting</div><h3>Post a job</h3><input placeholder="Job title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><textarea placeholder="Job description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><input placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/><select value={form.employment_type} onChange={e=>setForm({...form,employment_type:e.target.value})}><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option></select><input placeholder="Skills, comma separated" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/><button className="btn primary" onClick={createJob} disabled={!form.title||!form.description}>Publish job</button></section>
 <section className="card"><div className="tag">Your openings</div><h3>Jobs</h3>{jobs.length?<div className="stack">{jobs.map((j:any)=><div className="lesson" key={j.id}><b>{j.title}</b><span>{j.location||"Remote"} · {j.employment_type} · {j.status}</span><small>{(j.skills??[]).join(" · ")}</small></div>)}</div>:<p>No job posts yet.</p>}</section></div>
 <section className="card" style={{marginTop:24}}><div className="tag">Pipeline</div><h3>Candidate applications</h3>{applications.length?<div className="table-wrap"><table><thead><tr><th>Candidate</th><th>Job</th><th>Status</th><th>Applied</th></tr></thead><tbody>{applications.map((a:any)=><tr key={a.id}><td>{a.candidate_id.slice(0,8)}…</td><td>{jobs.find((j:any)=>j.id===a.job_id)?.title??"Job"}</td><td><span className="tag">{a.status}</span></td><td>{new Date(a.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>:<p>No applications yet.</p>}</section>
 </>}</div></main>
}