'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ProfileWithAccess = {
  id: string;
  email: string | null;
  role: 'admin' | 'user';
  ia_slugs: string[];
};

const AuthContext = createContext<{
  profile: ProfileWithAccess | null;
  loading: boolean;
  refetch: () => Promise<void>;
  signOut: () => Promise<void>;
} | null>(null);

export function AuthProvider({
  children,
  initialProfile,
}: {
  children: React.ReactNode;
  initialProfile: ProfileWithAccess | null;
}) {
  const [profile, setProfile] = useState<ProfileWithAccess | null>(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/user-profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const { createClient } = await import('@/app/lib/supabase/client');
    await createClient().auth.signOut();
    setProfile(null);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    if (initialProfile) {
      setLoading(false);
      return;
    }
    refetch();
  }, [initialProfile, refetch]);

  return (
    <AuthContext.Provider value={{ profile, loading, refetch, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function useHasAccess(slug: string): boolean {
  const { profile } = useAuth();
  if (!profile) return false;
  if (profile.role === 'admin') return true;
  return profile.ia_slugs.includes(slug);
}
