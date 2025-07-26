import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  return (
    <div className="flex space-x-2">
      <Button onClick={() => signIn("google")}>Login with Google</Button>
      <Button onClick={() => signIn("github")}>Login with GitHub</Button>
    </div>
  );
}