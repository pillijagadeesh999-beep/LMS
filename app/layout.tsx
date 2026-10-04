import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"SkillArc — Learning, reimagined.",description:"A modern learning management platform by Lumbini Technologies."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}