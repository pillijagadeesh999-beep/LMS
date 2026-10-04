"use client";
import {useEffect,useState} from "react";import Link from "next/link";import {createClient} from "@supabase/supabase-js";
const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
export default function SuperAdmin(){
 const[loading,setLoading]=useState(true);const[allowed,setAllowed]=useState(false);const[orgs,setOrgs]=useState<any[]>([]);const[users,setUsers]=useState(0);const[audit,setAudit]=useState<any[]>([]);
 useEffect(()=>{(async()=>{const{data:{user}}=await supabase.auth.getUser();if(!user){location.href="/login";return;}const{data:p}=await supabase.from("profiles").select("role").eq("id",user.id).single();if(p?.role!=="super_admin"){setLoading(false);return;}setAllowed(true);
  const[o,u,l]=await Promise.all([supabase.from("organizations").select("id,name,type,status,created_at").order("created_at",{ascending:false}),supabase.from("profiles").select("id",{count:"exact",head:true}),supabase.from("audit_logs").select("id,action,entity_type,created_at").order("created_at",{ascending:false}).limit(8)]);
  setOrgs(o.data??[]);setUsers(u.count??0);setAudit(l.data??[]);setLoading(false);
 })()},[]);
 if(loading)return <main className="app-shell"><div className="container"><div className="card" style={{marginTop:70}}>Loading Platform Center...</div></div></main>;
 if(!allowed)return <main className="container"><div className="card" style={{marginTop:70}}><h2>Super Admin access required</h2><p>This workspace is restricted to platform super administrators.</p></div></main>;
 const institutes=orgs.filter(o=>o.type==="institute").length,businesses=orgs.filter(o=>o.type==="business").length,active=orgs.filter(o=>o.status==="active").length;
 return <main className="app-shell"><div className="ambient"/><div className="container"><nav className="nav"><Link href="/dashboard" className="brand">Skill<span>Arc</span></Link><Link href="/admin" className="btn">Admin Center</Link></nav>
 <section className="page-head"><div className="eyebrow">Platform governance</div><h1>Super Admin Center.</h1><p>One view across SkillArc organizations, users and platform activity.</p></section>
 <div className="stat-grid"><div className="stat"><b>{orgs.length}</b><span>Organizations</span></div><div className="stat"><b>{institutes}</b><span>Institutes</span></div><div className="stat"><b>{businesses}</b><span>Businesses</span></div><div className="stat"><b>{users}</b><span>Total users</span></div></div>
 <div className="grid" style={{marginTop:24}}><section className="card"><div className="tag">Organizations</div><h3>Platform tenants</h3><p>{active} active organizations · {orgs.length-active} inactive or suspended.</p>{orgs.length?<div className="stack">{orgs.slice(0,8).map(o=><div className="lesson" key={o.id}><b>{o.name}</b><span>{o.type} · {o.status}</span></div>)}</div>:<p>No organizations yet.</p>}</section>
 <section className="card"><div className="tag">Security</div><h3>Audit activity</h3>{audit.length?<div className="stack">{audit.map(a=><div className="lesson" key={a.id}><b>{a.action}</b><span>{a.entity_type} · {new Date(a.created_at).toLocaleString()}</span></div>)}</div>:<p>No audit activity recorded yet.</p>}</section></div>
 <div className="actions" style={{marginTop:24}}><Link className="btn primary" href="/admin">Identity & roles</Link><Link className="btn" href="/admin/courses">Course operations</Link></div>
 </div></main>