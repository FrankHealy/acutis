import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { ProductSpaAuthProvider } from "@acutis/identity/spa";
import Workspace from "./app/workspace";
import GuestJoin from "./app/guest-join";
import "./app/styles.css";

const pathToView = { "/service-users": "service-users", "/appointments": "appointments", "/assessments": "assessments", "/care-plans": "care-plans", "/notes": "notes", "/forms": "forms", "/settings": "settings" } as const;
function App() {
  const [pathname, setPathname] = useState(window.location.pathname);
  useEffect(() => {
    const navigate = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || anchor.target) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin !== window.location.origin || !(target.pathname in pathToView) && target.pathname !== "/") return;
      event.preventDefault(); window.history.pushState({}, "", target); setPathname(target.pathname);
    };
    const back = () => setPathname(window.location.pathname);
    document.addEventListener("click", navigate); window.addEventListener("popstate", back);
    return () => { document.removeEventListener("click", navigate); window.removeEventListener("popstate", back); };
  }, []);
  const view = pathToView[pathname as keyof typeof pathToView] ?? "dashboard";
  return pathname === "/join" ? <GuestJoin productName="Acutis Community" /> : <ProductSpaAuthProvider issuer={import.meta.env.VITE_KEYCLOAK_ISSUER} clientId={import.meta.env.VITE_KEYCLOAK_CLIENT_ID}><Workspace view={view} /></ProductSpaAuthProvider>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
