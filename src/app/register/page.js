import React from "react";
import RegisterForm from "@/components/formu/RegisterForm";

export const metadata = {
  title: "Registro - Reforesta Manabí",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 p-6">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}
