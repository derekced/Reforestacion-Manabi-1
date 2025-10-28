import React from "react";
import ProfileForm from "@/components/formu/ProfileForm";
import { PageContainer } from "@/components/PageContainer";

export const metadata = {
  title: "Mi Perfil - Reforesta Manabí",
};

export default function ProfilePage() {
  return (
    <PageContainer>
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <ProfileForm />
        </div>
      </main>
    </PageContainer>
  );
}