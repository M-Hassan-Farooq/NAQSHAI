'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import UserNav from '@/components/UserNav';

import { syncProfile, getProfile, fetchLatestUserAndProfile } from '@/lib/profileHelper';
import {
  Sparkles,
  Home,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  User,
  Mail,
  Phone,
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

  // Form & Profile State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Verification & UI State
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verified' | 'pending' | 'none'
  const [sellerRole, setSellerRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // 1. Loading State Guard & Database-First Profile Loading
  useEffect(() => {
    let isMounted = true;

    async function loadAuthAndProfile() {
      try {
        // Authenticated User Verification via getUser() & getSession()
        const { data: { user: authUser }, error: userErr } = await supabase.auth.getUser();
        const { data: { session: activeSession } } = await supabase.auth.getSession();

        const effectiveUser = authUser || activeSession?.user;

        // Strict Redirect Condition: Only trigger redirect if session/user is definitively confirmed null
        if (!effectiveUser && !activeSession) {
          if (isMounted) {
            setCheckingAuth(false);
            router.push('/login?redirect=/settings');
          }
          return;
        }

        if (isMounted) {
          setUser(effectiveUser);
          setSession(activeSession);

          // Query public.profiles directly database-first
          const { data: profileRow, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', effectiveUser.id)
            .maybeSingle();

          if (profileErr && profileErr.code !== 'PGRST116') {
            console.warn('Profiles table load notice:', profileErr.message);
          }

          const userMeta = effectiveUser.user_metadata || {};
          const resolvedFullName = profileRow?.full_name || userMeta.full_name || userMeta.name || '';
          const resolvedPhoneNumber = profileRow?.phone_number || userMeta.phone_number || effectiveUser.phone || '';
          const resolvedAvatarUrl = profileRow?.avatar_url || userMeta.avatar_url || userMeta.picture || null;

          setFullName(resolvedFullName);
          setPhoneNumber(resolvedPhoneNumber);
          setAvatarUrl(resolvedAvatarUrl);

          // Query seller verification status from public.sellers table
          const { data: sellerData } = await supabase
            .from('sellers')
            .select('is_identity_verified, seller_role, full_name')
            .eq('id', effectiveUser.id)
            .maybeSingle();

          if (sellerData) {
            setSellerRole(sellerData.seller_role || 'Direct Owner');
            setVerificationStatus(sellerData.is_identity_verified ? 'verified' : 'pending');
          } else {
            setVerificationStatus('none');
          }
        }
      } catch (err) {
        console.error('Database-First profile load error:', err);
        if (isMounted) {
          router.push('/login?redirect=/settings');
        }
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    }

    loadAuthAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // Only redirect on explicit SIGNED_OUT event after initial auth check completes
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setSession(null);
          setUser(null);
          router.push('/login?redirect=/settings');
        }
      } else if (currentSession?.user && isMounted) {
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

  // 2. Avatar Selection & Local Preview Handler
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file size must be less than 5MB.' });
      return;
    }

    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);
    setStatusMessage({
      type: 'info',
      text: 'New profile picture selected! Click "Save Profile Changes" below to submit your changes.',
    });
  };

  // 3. Persistent Save Handler
  const handleSaveProfileChanges = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      let uploadedPublicUrl = null;

      // 3.1 Perform Storage Upload if new file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}_avatar.${fileExt}`;

        try {
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, selectedFile, { upsert: true });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            uploadedPublicUrl = urlData?.publicUrl;
          } else {
            console.warn('Storage bucket upload notice:', uploadError.message);
          }
        } catch (storageErr) {
          console.warn('Storage exception fallback:', storageErr);
        }

        // Data URL Fallback if bucket upload fails
        if (!uploadedPublicUrl) {
          uploadedPublicUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(selectedFile);
          });
        }
      }

      const finalAvatarUrl = uploadedPublicUrl || filePreview || avatarUrl;

      // Multi-Layer Sync: Write to localStorage, public.profiles, public.sellers, auth.updateUser(), refreshSession(), and broadcast
      const { profile: updatedProfile, authUser } = await syncProfile(user.id, {
        full_name: fullName,
        phone_number: phoneNumber,
        avatar_url: finalAvatarUrl,
      });

      const resolvedAvatar = updatedProfile?.avatar_url || finalAvatarUrl;
      const resolvedName = updatedProfile?.full_name || fullName;
      const resolvedPhone = updatedProfile?.phone_number || phoneNumber;

      // Update Local Page State
      setAvatarUrl(resolvedAvatar);
      setFullName(resolvedName);
      setPhoneNumber(resolvedPhone);
      setSelectedFile(null);
      setFilePreview(null);
      if (authUser) setUser(authUser);

      setStatusMessage({ type: 'success', text: 'Profile changes saved successfully!' });
    } catch (err) {
      console.error('Profile save error:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to save profile changes. Please try again.',
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const activeAvatarDisplay = filePreview || avatarUrl;
  const initial = (fullName || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      {/* Standardized Header Navigation Bar */}
      <Navbar
        session={session}
        badgeText="Account Settings"
      />

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
                : statusMessage.type === 'info'
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            ) : statusMessage.type === 'info' ? (
              <Sparkles className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            )}
            <span className="font-medium flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Main Settings Form */}
        <form onSubmit={handleSaveProfileChanges} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-8">
          
          {/* SECTION 1: Avatar Upload Section */}
          <div className="pb-8 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 mb-4">Profile Avatar</h2>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              
              {/* Avatar Preview Box */}
              <div className="relative group shrink-0">
                {activeAvatarDisplay ? (
                  <img
                    src={activeAvatarDisplay}
                    alt={fullName || user?.email || 'User Avatar'}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-emerald-600 shadow-md ring-4 ring-emerald-50"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-emerald-700 text-white font-extrabold text-3xl sm:text-4xl flex items-center justify-center border-4 border-emerald-800 shadow-md">
                    {initial}
                  </div>
                )}
              </div>

              {/* Upload Trigger & Info */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change Profile Picture</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a PNG, JPG, or WEBP image (Max 5MB). Click "Save Profile Changes" below to submit your avatar.
                  </p>
                </div>

                {/* Hidden File Input Trigger */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFileSelect}
                />

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 transition shadow-sm inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <span>{selectedFile ? 'Change Selected Image' : 'Select Avatar Image'}</span>
                  </button>

                  {selectedFile && (
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 truncate max-w-[220px]">
                      Selected: {selectedFile.name}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: Seller Identity Status (Read-Only Badge) */}
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

          {/* SECTION 3: Editable Account Details */}
          <div className="space-y-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">Account Details</h2>

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
                Phone Number (Editable)
              </label>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+92 300 1234567"
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
                  value={user?.email || ''}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Email address is linked to your Supabase authentication identity.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
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

          </div>

        </form>

      </main>
    </div>
  );
}
