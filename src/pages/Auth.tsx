import AuthForm from "@/components/AuthForm";
import { useLocation } from "react-router-dom";

export default function Auth() {
  const location = useLocation();
  const mode = location.pathname.includes("signup") ? "signup" : "signin";

  return <AuthForm mode={mode} />;
}