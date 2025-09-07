'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdminEnabled: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    isAdminEnabled: false,
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if admin is enabled
        const isAdminEnabled =
          process.env.NODE_ENV === 'development' ||
          process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';

        if (!isAdminEnabled) {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            isAdminEnabled: false,
          });
          router.push('/');
          return;
        }

        // Check authentication by calling a protected endpoint
        const response = await fetch('/api/admin/verify', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            isAdminEnabled: true,
          });
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            isAdminEnabled: true,
          });
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          isAdminEnabled: true,
        });
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  return authState;
}
