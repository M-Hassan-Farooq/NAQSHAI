'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  X,
  UploadCloud,
  ShieldCheck,
  AlertCircle,
  User,
  Mail,
  Loader2,
  CheckCircle2,
  Camera,
  UserCheck
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, user, onUserUpdated }) {
  const [fullName, setFullName] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verified' | 'pending' | 'none'
  const [sellerRole, setSellerRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const userMeta = user.user_metadata || {};
    setFullName(userMeta.full_name || userMeta.name || '');

    // Fetch seller verification status from public.sellers table
    async function fetchVerificationStatus() {
      try {
        const { data: sellerData, error } = await supabase
          .from('sellers')
          .select('is_identity_verified, seller_role, full_name')
          .eq('id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.warn('Sellers query notice:', error.message);
        }

        if (sellerData) {
          setSellerRole(sellerData.seller_role || 'Direct Owner');
          if (sellerData.is_identity_verified) {
            setVerificationStatus('verified');
          } else {
            setVerificationStatus('pending');
          }
        } else {
          setVerificationStatus('none');
        }
      } catch (err) {
        console.error('Error fetching seller status:', err);
        setVerificationStatus('none');
      }
    }

    fetchVerificationStatus();
  }, [user]);

  if (!isOpen || !user) return null;

  const userMeta = user.user_metadata || {};
  const avatarUrl = userMeta.avatar_url || userMeta.picture || null;
  const initial = (fullName || user.email || 'U').charAt(0).toUpperCase();

  const handleAvatarFileChange = async (e) => {
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

    setUploadingAvatar(true);
    setStatusMessage({ type: '', text: '' });

    try {
      let publicUrl = null;

      // 1. Try uploading to Supabase Storage 'avatars' bucket
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
          console.warn('Supabase storage upload fallback:', uploadError.message);
        }
      } catch (storageException) {
        console.warn('Storage exception, using data URL fallback:', storageException);
      }

      // 2. Data URL Fallback if bucket upload was not configured
      if (!publicUrl) {
        publicUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      // 3. Update Supabase User Metadata with new avatar_url
      const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          picture: publicUrl,
        },
      });

      if (updateErr) {
        throw updateErr;
      }

      setStatusMessage({ type: 'success', text: 'Profile avatar updated successfully!' });
      if (onUserUpdated && updateData?.user) {
        onUserUpdated(updateData.user);
      }
    } catch (err) {
      console.error('Avatar update failed:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update avatar.' });
    } finally {
      setUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const { data: updateData, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      });

      if (error) throw error;

      setStatusMessage({ type: 'success', text: 'Profile details updated successfully!' });
      if (onUserUpdated && updateData?.user) {
        onUserUpdated(updateData.user);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      
      <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 sm:p-8 max-w-md w-full relative space-y-6">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Account Settings</h2>
            <p className="text-xs text-slate-500">Manage profile details & verification status</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {statusMessage.text && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            )}
            <span className="font-medium flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName || user.email}
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-600 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-700 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-emerald-800 shadow-md">
                {initial}
              </div>
            )}

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
              className="absolute bottom-0 right-0 p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full shadow-md transition transform hover:scale-105 disabled:opacity-50"
              title="Update Avatar Image"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            type="button"
            disabled={uploadingAvatar}
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{uploadingAvatar ? 'Uploading image...' : 'Update Avatar'}</span>
          </button>
        </div>

        {/* Verification Status Badge */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Seller Identity Status
            </span>
            {verificationStatus === 'verified' ? (
              <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Seller</span>
              </span>
            ) : verificationStatus === 'pending' ? (
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Under Review</span>
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Standard Account</span>
              </span>
            )}
          </div>
          {sellerRole && (
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Registered Role: <span className="text-slate-800">{sellerRole}</span>
            </p>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ahsan Khan"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address (Primary Account)
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
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
