'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import UserNav from '@/components/UserNav';
import {
  Sparkles,
  ArrowLeft,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  User,
  Mail,
  Loader2,
  CheckCircle2,
  Camera,
  UserCheck,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [fullName, setFullName] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verified' | 'pending' | 'none'
  const [sellerRole, setSellerRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Route Protection: Check active session
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (!activeSession) {
          router.push('/login?redirect=/settings');
          return;
        }

        if (isMounted) {
          setSession(activeSession);
          setUser(activeSession.user);

          const userMeta = activeSession.user.user_metadata || {};
          setFullName(userMeta.full_name || userMeta.name || '');

          // Fetch identity verification status from public.sellers table
          const { data: sellerData, error } = await supabase
            .from('sellers')
            .select('is_identity_verified, seller_role, full_name')
            .eq('id', activeSession.user.id)
            .maybeSingle();

          if (sellerData) {
            setSellerRole(sellerData.seller_role || 'Direct Owner');
            setVerificationStatus(sellerData.is_identity_verified ? 'verified' : 'pending');
          } else {
            setVerificationStatus('none');
          }
        }
      } catch (err) {
        console.error('Session check error on settings page:', err);
        router.push('/login?redirect=/settings');
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    }

    checkAuthSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (!currentSession) {
        router.push('/login?redirect=/settings');
      } else if (isMounted) {
        setSession(currentSession);
        setUser(currentSession.user);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    router.push('/');
  };

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file size must be less than 5MB.' });
      return;
    }

    setUploadingAvatar(true);
    setStatusMessage({ type: '', text: '' });

    try {
      let publicUrl = null;

      // 1. Upload file to Supabase Storage 'avatars' bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          publicUrl = urlData?.publicUrl;
        } else {
          console.warn('Storage upload fallback:', uploadError.message);
        }
      } catch (storageErr) {
        console.warn('Storage exception fallback:', storageErr);
      }

      // 2. Data URL Fallback if bucket upload has restrictions
      if (!publicUrl) {
        publicUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      // 3. Update user session metadata with new avatar_url
      const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          picture: publicUrl,
        },
      });

      if (updateErr) throw updateErr;

      // 4. Update local state immediately so Navbar & page update instantly
      if (updateData?.user) {
        setUser(updateData.user);
        setSession((prev) => (prev ? { ...prev, user: updateData.user } : prev));
      }

      setStatusMessage({ type: 'success', text: 'Profile picture updated successfully!' });
    } catch (err) {
      console.error('Avatar update failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile picture.' });
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveProfileDetails = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const { data: updateData, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      if (error) throw error;

      if (updateData?.user) {
        setUser(updateData.user);
        setSession((prev) => (prev ? { ...prev, user: updateData.user } : prev));
      }

      setStatusMessage({ type: 'success', text: 'Profile details saved successfully!' });
    } catch (err) {
      console.error('Profile update error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save profile changes.' });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Loading settings portal...</span>
        </div>
      </div>
    );
  }

  const userMeta = user?.user_metadata || {};
  const avatarUrl = userMeta.avatar_url || userMeta.picture || null;
  const initial = (fullName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shadow-sm group-hover:bg-emerald-100 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">NAQSHAI</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-full hidden sm:inline-block">
              Account Settings
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/sell')}
              className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm"
            >
              List Your Plot
            </button>
            <button
              onClick={() => router.push('/explore')}
              className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm hidden sm:inline-block"
            >
              3D Map
            </button>
            <button
              onClick={() => router.push('/recommend')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>AI Advisor</span>
            </button>

            {session?.user && (
              <UserNav
                session={session}
                onSignOut={handleSignOut}
                onUserUpdated={(updatedUser) => {
                  setUser(updatedUser);
                  setSession((prev) => (prev ? { ...prev, user: updatedUser } : prev));
                }}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-700" />
            <span>Back to Previous Page</span>
          </button>
          <span className="text-xs text-slate-400 font-mono">/settings</span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your personal profile, picture, and identity verification status.
          </p>
        </div>

        {/* Status Alerts */}
        {statusMessage.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            )}
            <span className="font-medium flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Main Settings Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-8">
          
          {/* SECTION 1: Avatar Upload Prominent Section */}
          <div className="pb-8 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-4">Profile Avatar</h2>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              
              {/* Avatar Preview */}
              <div className="relative group shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName || user.email}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-600 shadow-md ring-4 ring-emerald-50"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-700 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center border-4 border-emerald-800 shadow-md">
                    {initial}
                  </div>
                )}
              </div>

              {/* Upload Trigger Button & Info */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change Profile Picture</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a high-resolution PNG, JPG, or WEBP image (Max 5MB). Your avatar is displayed across the platform and seller listings.
                  </p>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />

                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>Uploading Image...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 text-emerald-200" />
                      <span>Change Profile Picture</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>

          {/* SECTION 2: Seller Identity Status (Read-Only) */}
          <div className="pb-8 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-3">Identity & Verification Status</h2>
            
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Verification Badge
                </p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {sellerRole ? `Registered as ${sellerRole}` : 'Standard Platform Account'}
                </p>
              </div>

              {verificationStatus === 'verified' ? (
                <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Verified Seller</span>
                </span>
              ) : verificationStatus === 'pending' ? (
                <span className="text-xs font-semibold px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Under Review</span>
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1.5 bg-slate-200 text-slate-700 rounded-full flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  <span>Standard User</span>
                </span>
              )}
            </div>
          </div>

          {/* SECTION 3: Editable Account Details Form */}
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-4">Account Details</h2>

            <form onSubmit={handleSaveProfileDetails} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name (Editable)
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address (Read-Only)
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="email"
                    disabled
                    value={user.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Email address is linked to your Supabase authentication identity.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-200" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-emerald-200" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>

      </main>
    </div>
  );
}
