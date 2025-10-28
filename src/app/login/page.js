import React from "react";
import LoginForm from "@/components/formu/LoginForm";
import { PageContainer } from "@/components/PageContainer";

export const metadata = {
  title: "Login - Reforesta Manabí",
};

export default function LoginPage() {
  return (
    <PageContainer>
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <LoginForm />
        </div>
      </main>
    </PageContainer>
  );
}
