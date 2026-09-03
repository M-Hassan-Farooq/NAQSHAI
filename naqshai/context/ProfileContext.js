'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getProfile, fetchLatestUserAndProfile, PROFILE_UPDATED_EVENT } from '@/lib/profileHelper';

const ProfileContext = createContext({
  user: null,
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  setProfileState: () => {},
});

export function ProfileProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Database-First fetch using fresh auth user and public.profiles table
  const fetchPersistentProfile = useCallback(async (userId = null) => {
    try {
      const { user: freshUser, profile: dbProfile } = await fetchLatestUserAndProfile(userId);
      if (freshUser) {
        setUser(freshUser);
      }
      if (dbProfile) {
        setProfile(dbProfile);
      }
      return dbProfile;
    } catch (err) {
      console.warn('fetchPersistentProfile notice:', err);
      return null;
    }
  }, []);

  // Initialize auth & listen for changes/events
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(activeSession);
          if (activeSession?.user?.id) {
            await fetchPersistentProfile(activeSession.user.id);
          }
        }
      } catch (err) {
        console.warn('Auth init notice in ProfileContext:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (isMounted) {
        setSession(currentSession);
        if (currentSession?.user?.id) {
          await fetchPersistentProfile(currentSession.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    });

    // Client-Side Event Trigger Listeners:
    // Listen for both 'profile-updated' and 'naqshai:profile-updated'
    const handleStandardProfileUpdated = async () => {
      if (isMounted) {
        await fetchPersistentProfile();
      }
    };

    const handleCustomProfileUpdate = (event) => {
      if (isMounted && event.detail) {
        setProfile((prev) => ({
          ...(prev || {}),
          ...event.detail,
        }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('profile-updated', handleStandardProfileUpdated);
      window.addEventListener(PROFILE_UPDATED_EVENT, handleCustomProfileUpdate);
    }

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('profile-updated', handleStandardProfileUpdated);
        window.removeEventListener(PROFILE_UPDATED_EVENT, handleCustomProfileUpdate);
      }
    };
  }, [fetchPersistentProfile]);

  const refreshProfile = useCallback(async () => {
    return await fetchPersistentProfile();
  }, [fetchPersistentProfile]);

  const setProfileState = useCallback((newProfileData) => {
    setProfile((prev) => {
      const updated = { ...(prev || {}), ...newProfileData };
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('profile-updated'));
      }
      return updated;
    });
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        refreshProfile,
        setProfileState,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
