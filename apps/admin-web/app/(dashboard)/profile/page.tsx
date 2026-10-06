"use client";

import { useState, useEffect } from "react";
import {
  useProfile,
  useUpdateProfile,
} from "@library/api";
import { useTranslation } from "react-i18next";

export default function AdminProfilePage() {
  const { t } = useTranslation();

  const { data: profile, refetch: refetchProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Fill in active profile data upon loading
  useEffect(() => {
    if (profile?.profile) {
      setPhone(profile.profile.phone || "");
      setAvatarUrl(profile.profile.avatarUrl || "");
      setAddress(profile.profile.address || "");
      setBio(profile.profile.bio || "");
    }
  }, [profile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);

    updateProfileMutation.mutate(
      { phone, avatarUrl, address, bio },
      {
        onSuccess: () => {
          setProfileSuccess(true);
          refetchProfile();
          setTimeout(() => setProfileSuccess(false), 3000);
        },
        onError: (err: any) => {
          alert(err.response?.data?.message || "Failed to update profile specifications.");
        },
      }
    );
  };

  const currentAvatar = avatarUrl || profile?.profile?.avatarUrl;

  return (
    <div className="bg-zinc-900/20 border border-zinc-900 p-8 rounded-3xl space-y-8 text-left">
      {/* Admin Identity Card */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-900">
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full border border-zinc-800 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center font-bold text-2xl text-red-500">
            {(profile?.firstName?.charAt(0) || '').toUpperCase()}
          </div>
        )}
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-2xl font-black text-white tracking-tight">
            {profile?.firstName} {profile?.lastName || ""}
          </h3>
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <span className="text-[10px] text-red-400 font-extrabold uppercase bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20 leading-none">
              {profile?.role?.name || "ADMIN"}
            </span>
            <span className="text-zinc-555 text-xs font-semibold">
              Staff ID: #{profile?.id}
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-semibold">{profile?.email}</p>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-white text-sm">Admin Staff Details</h4>
        <p className="text-zinc-500 text-xs mt-0.5">Customize your administrator identity card and contact info details.</p>
      </div>

      {profileSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-xl text-center">
          ✨ Administrator profile updated successfully!
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">Contact Number</label>
            <input
              type="text"
              placeholder="+1 (555) 987-6543"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">Avatar URL</label>
            <input
              type="text"
              placeholder="https://image.url/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">Office / Street Address</label>
          <input
            type="text"
            placeholder="Staff Office Room 402, Main Library Hall"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all"
          />
        </div>

        <div>
          <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">Bio Description</label>
          <textarea
            rows={4}
            placeholder="Library manager and archive curator..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all resize-none"
          />
        </div>

        <div className="pt-4 border-t border-zinc-900 flex justify-end">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="px-6 py-3 bg-red-655 hover:bg-red-700 active:scale-95 transition-all text-white font-bold rounded-xl text-sm cursor-pointer border-none outline-none"
          >
            {updateProfileMutation.isPending ? "Saving Profile..." : "Save Profile Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
