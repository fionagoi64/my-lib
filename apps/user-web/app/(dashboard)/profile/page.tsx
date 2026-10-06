"use client";

import { useState, useEffect } from "react";
import { useProfile, useUpdateProfile } from "@library/api";
import { useTranslation } from "react-i18next";
import { Input } from "@library/ui";

export default function ProfilePage() {
  const { t } = useTranslation();

  const { data: profile, refetch: refetchProfile } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Pre-fill profile state when profile data loads
  useEffect(() => {
    if (profile?.profile) {
      setPhone(profile.profile.phone || "");
      setAddress(profile.profile.address || "");
      setBio(profile.profile.bio || "");
      setAvatarUrl(profile.profile.avatarUrl || "");
    }
  }, [profile]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    updateProfileMutation.mutate(
      { phone, address, bio, avatarUrl },
      {
        onSuccess: () => {
          setProfileSuccess(true);
          setTimeout(() => setProfileSuccess(false), 3000);
          refetchProfile();
        },
      }
    );
  };

  return (
    <div className="bg-zinc-900/20 border border-zinc-900 p-8 rounded-3xl space-y-8 text-left">
      {/* Account Identity Card */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-900">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-20 h-20 rounded-full border border-zinc-800 object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-bold text-2xl text-blue-400">
            {(profile?.firstName?.charAt(0) || "").toUpperCase()}
          </div>
        )}
        <div className="text-center sm:text-left space-y-1">
          <h3 className="text-2xl font-black text-white tracking-tight">
            {profile?.firstName} {profile?.lastName || ""}
          </h3>
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <span className="text-[10px] text-blue-400 font-extrabold uppercase bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              {profile?.role?.name || "READER"}
            </span>
            <span className="text-zinc-500 text-xs font-semibold">
              {t("profile.memberId")}: #{profile?.id}
            </span>
          </div>
          <p className="text-zinc-400 text-xs font-semibold">{profile?.email}</p>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-white text-sm">{t("profile.title")}</h4>
        <p className="text-zinc-500 text-xs mt-0.5">{t("profile.description")}</p>
      </div>

      {profileSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold rounded-xl text-center">
          {t("profile.success")}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
              {t("profile.phone")}
            </label>
            <Input
              type="text"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all h-11"
            />
          </div>
          <div>
            <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
              {t("profile.avatarUrl")}
            </label>
            <Input
              type="text"
              placeholder="https://image.url/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all h-11"
            />
          </div>
        </div>

        <div>
          <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
            {t("profile.address")}
          </label>
          <Input
            type="text"
            placeholder="123 Main St, New York, NY"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all h-11"
          />
        </div>

        <div>
          <label className="block text-zinc-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">
            {t("profile.bio")}
          </label>
          <textarea
            rows={4}
            placeholder="Avid science fiction reader, software engineer..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none text-white transition-all resize-none"
          />
        </div>

        <div className="pt-4 border-t border-zinc-900 flex justify-end">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold rounded-xl text-sm cursor-pointer outline-none border-none"
          >
            {updateProfileMutation.isPending ? t("profile.saving") : t("profile.save")}
          </button>
        </div>
      </form>
    </div>
  );
}
