import { supabase } from '@/lib/supabaseClient';

export const PROFILE_UPDATED_EVENT = 'naqshai:profile-updated';

/**
 * Helper to safely read from localStorage
 */
export function getLocalCachedProfile(userId) {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const raw = localStorage.getItem(`naqshai_profile_${userId}`);
    if (raw) return JSON.parse(raw);
    const globalRaw = localStorage.getItem('naqshai_active_profile');
    if (globalRaw) return JSON.parse(globalRaw);
  } catch (e) {}
  return null;
}

/**
 * Helper to safely write to localStorage
 */
export function setLocalCachedProfile(userId, profileData) {
  if (typeof window === 'undefined' || !userId || !profileData) return;
  try {
    const existing = getLocalCachedProfile(userId) || {};
    const merged = { ...existing, ...profileData, id: userId, updated_at: new Date().toISOString() };
    localStorage.setItem(`naqshai_profile_${userId}`, JSON.stringify(merged));
    localStorage.setItem('naqshai_active_profile', JSON.stringify(merged));
  } catch (e) {}
}

/**
 * Dispatch client-side events upon profile update
 */
export function broadcastProfileUpdate(updatedDetails) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('profile-updated'));
    if (updatedDetails) {
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED_EVENT, { detail: updatedDetails }));
    }
  }
}

/**
 * Fetch persistent user profile from public.profiles table or public.sellers or local cache
 */
export async function getProfile(userId) {
  if (!userId) return null;

  const localCache = getLocalCachedProfile(userId);

  try {
    // 1. Try public.profiles table
    const { data: profilesData, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, avatar_url, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (profilesData && (profilesData.full_name || profilesData.avatar_url || profilesData.phone_number)) {
      const merged = { ...localCache, ...profilesData };
      setLocalCachedProfile(userId, merged);
      return merged;
    }

    // 2. Try public.sellers table
    const { data: sellerData } = await supabase
      .from('sellers')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (sellerData && (sellerData.full_name || sellerData.avatar_url)) {
      const merged = { ...localCache, ...sellerData };
      setLocalCachedProfile(userId, merged);
      return merged;
    }
  } catch (err) {
    console.warn('DB profile fetch notice:', err);
  }

  return localCache || null;
}

/**
 * Fetch latest user identity using supabase.auth.getUser()
 */
export async function fetchLatestUserAndProfile(providedUserId = null) {
  try {
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    const userId = providedUserId || freshUser?.id;

    if (!userId) {
      return { user: freshUser || null, profile: null };
    }

    const dbProfile = await getProfile(userId);
    return { user: freshUser || null, profile: dbProfile };
  } catch (err) {
    console.warn('fetchLatestUserAndProfile exception:', err);
    return { user: null, profile: null };
  }
}

/**
 * Dual-Write Sync: Write data BOTH to public.profiles table, public.sellers table, localStorage, and supabase.auth.updateUser()
 */
export async function syncProfile(userId, { full_name, phone_number, avatar_url }) {
  if (!userId) return { profile: null, authUser: null };

  const updateFields = {};
  if (full_name !== undefined) updateFields.full_name = full_name;
  if (phone_number !== undefined) updateFields.phone_number = phone_number;
  if (avatar_url !== undefined) updateFields.avatar_url = avatar_url;

  // 1. Write immediately to localStorage for instant persistence across reloads
  setLocalCachedProfile(userId, updateFields);
  const currentMergedProfile = getLocalCachedProfile(userId);

  // 2. Database Write: public.profiles table
  let dbProfile = currentMergedProfile;
  try {
    const payload = {
      id: userId,
      updated_at: new Date().toISOString(),
      ...updateFields,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (!error && data) {
      dbProfile = { ...currentMergedProfile, ...data };
      setLocalCachedProfile(userId, dbProfile);
    }
  } catch (err) {
    console.warn('Profiles table upsert notice:', err);
  }

  // Backup sync to public.sellers table
  try {
    const sellerPayload = { id: userId, updated_at: new Date().toISOString(), ...updateFields };
    await supabase.from('sellers').upsert(sellerPayload, { onConflict: 'id' });
  } catch (err) {
    // optional seller sync
  }

  // 3. Dual-Write to supabase.auth.updateUser()
  let authUser = null;
  try {
    const updatePayload = {};
    if (avatar_url !== undefined) {
      updatePayload.avatar_url = avatar_url;
      updatePayload.picture = avatar_url;
    }
    if (full_name !== undefined) {
      updatePayload.full_name = full_name;
    }
    if (phone_number !== undefined) {
      updatePayload.phone_number = phone_number;
    }

    const { data, error } = await supabase.auth.updateUser({ data: updatePayload });
    if (!error && data?.user) {
      authUser = data.user;
    }
  } catch (err) {
    console.warn('supabase.auth.updateUser notice:', err);
  }

  // 4. Force Session Refresh
  try {
    if (typeof supabase.auth.refreshSession === 'function') {
      const { data: refreshedSession, error: refreshErr } = await supabase.auth.refreshSession();
      if (!refreshErr && refreshedSession?.user) {
        authUser = refreshedSession.user;
      }
    }
  } catch (refreshEx) {
    console.warn('Post-update refreshSession notice:', refreshEx);
  }

  // 5. Client-Side Event Trigger
  broadcastProfileUpdate(dbProfile);

  return { profile: dbProfile, authUser };
}
