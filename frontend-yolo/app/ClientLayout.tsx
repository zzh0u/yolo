'use client';
import { useState } from "react";
import { LoginModal } from "../signin/components/login/modal";
import { useOneTapLogin } from "../signin/hooks/useOneTapLogin";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  useOneTapLogin();
  return (
    <SessionProvider>
      <>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        {children}
      </>
    </SessionProvider>
  );
}