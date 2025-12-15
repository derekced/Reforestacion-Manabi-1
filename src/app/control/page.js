"use client";

import PageContainer from '@/components/PageContainer';
import GestionVoluntarios from '@/components/GestionVoluntarios';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthRequired from '@/components/AuthRequired';
import { getCurrentUser } from '@/lib/supabase-v2';

export default function ControlPage() {
  const [allowed, setAllowed] = useState(null); // null = loading, true = allowed, false = not allowed
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          setAllowed(false);
          return;
        }

        const userRole = user.profile?.role || user.user_metadata?.role || 'volunteer';
        
        if (userRole === 'organizer' || userRole === 'admin') {
          setAllowed(true);
        } else {
          setAllowed(false);
          router.push('/');
        }
      } catch (e) {
        console.error('Error checking auth:', e);
        setAllowed(false);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (allowed === false) {
    return <AuthRequired />;
  }

  return (
    <PageContainer>
      <GestionVoluntarios />
    </PageContainer>
  );
}
