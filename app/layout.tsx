import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"SkillArc LMS",description:"Learning management platform powered by Supabase and Vercel"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}