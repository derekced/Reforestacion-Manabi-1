"use client";

import PageContainer from '@/components/PageContainer';
import GestionVoluntarios from '@/components/GestionVoluntarios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthRequired from '@/components/AuthRequired';

export default function ControlPage() {
  const [allowed, setAllowed] = useState(null); // null = loading, true = allowed, false = not allowed
  const router = useRouter();

  useEffect(() => {
    try {
      const u = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
      if (!u) {
        setAllowed(false);
        return;
      }
      const user = JSON.parse(u);
      if (user.role === 'organizer' || user.role === 'admin') {
        setAllowed(true);
      } else {
        setAllowed(false);
        router.push('/');
      }
    } catch (e) {
      setAllowed(false);
      router.push('/');
    }
  }, [router]);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (allowed === false) {
    const u = localStorage.getItem('authUser') || sessionStorage.getItem('authUser');
    if (!u) return <AuthRequired />;
    return null;
  }

  return (
    <PageContainer>
      <GestionVoluntarios />
    </PageContainer>
  );
}
