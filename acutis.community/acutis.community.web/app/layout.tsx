import type { Metadata } from "next";
import Providers from "./providers";
export const metadata: Metadata = { title: "Acutis Community" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en-IE"><body style={{ margin: 0 }}><Providers>{children}</Providers></body></html>; }
