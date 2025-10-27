import React from "react";
import LoginForm from "@/components/formu/LoginForm";

export const metadata = {
  title: "Login - Reforesta Manabí",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-6">
      <div className="w-full max-w-2xl">
        <LoginForm />
      </div>
    </main>
  );
}
