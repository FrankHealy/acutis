import type { ReactNode } from "react";
import ConfigWorkspaceShell from "@/areas/config/ConfigWorkspaceShell";

type ConfigLayoutProps = {
  children: ReactNode;
};

export default function ConfigLayout({ children }: ConfigLayoutProps) {
  return <ConfigWorkspaceShell>{children}</ConfigWorkspaceShell>;
}
