"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import InstitutionalDatePicker from "@/components/ui/InstitutionalDatePicker";
import VichaarLogo from "@/components/VichaarLogo";
import {
  User,
  CheckCircle2,
  ShieldAlert,
  Edit3,
  X,
  Save,
  Loader2,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  School,
  Calendar,
  Phone,
  Mail,
  Award,
  FileText,
  Ticket,
  Copy,
  Check,
  Building,
  AtSign,
  AlertCircle
} from "lucide-react";

interface ProfileData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  institution?: string | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  role: string;
  createdAt?: string;
}

interface ProfileMetrics {
  totalRegistrations: number;
  upcomingCount: number;
  completedCount: number;
  certificatesCount: number;
  submissionsCount: number;
  unreadNotificationsCount: number;
}

export default function ParticipantProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [metrics, setMetrics] = useState<ProfileMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);

  // Edit form state
  const [editFullName, setEditFullName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editInstitution, setEditInstitution] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Username live availability checking
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean;
    message: string;
  } | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/my-vichaar/profile");
      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
        setMetrics(data.metrics || null);
        setEditFullName(data.profile.fullName || "");
        setEditUsername(data.profile.username || "");
        setEditPhone(data.profile.phone || "");
        setEditDob(data.profile.dateOfBirth || "");
        setEditInstitution(data.profile.institution || "");
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Real-time username check on debounced typing
  useEffect(() => {
    if (!isEditing || !profile) return;
    const sanitized = editUsername.trim().toLowerCase().replace(/^@+/, "");

    if (!sanitized) {
      setUsernameStatus({ available: false, message: "Username cannot be empty." });
      return;
    }

    if (sanitized === profile.username.toLowerCase()) {
      setUsernameStatus({ available: true, message: "Current username" });
      return;
    }

    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/my-vichaar/auth/check-username?username=${encodeURIComponent(
            sanitized
          )}&current_username=${encodeURIComponent(profile.username)}`
        );
        const data = await res.json();
        setUsernameStatus({
          available: data.available,
          message: data.message
        });
      } catch {
        setUsernameStatus({ available: false, message: "Could not verify username." });
      } finally {
        setUsernameChecking(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [editUsername, isEditing, profile]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image exceeds 10MB size limit.");
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/my-vichaar/profile/avatar", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to upload avatar");

      setProfile((prev) => (prev ? { ...prev, avatarUrl: result.avatarUrl } : prev));
      setSaveMessage("Profile picture updated successfully.");
      router.refresh();
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to upload profile picture.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    setUploadingAvatar(true);
    try {
      const res = await fetch("/api/my-vichaar/profile/avatar", { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to remove avatar");

      setProfile((prev) => (prev ? { ...prev, avatarUrl: null } : prev));
      setSaveMessage("Profile picture removed.");
      router.refresh();
      setTimeout(() => setSaveMessage(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to remove picture.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCopyHandle = () => {
    if (!profile) return;
    navigator.clipboard.writeText(`@${profile.username}`);
    setCopiedHandle(true);
    setTimeout(() => setCopiedHandle(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (usernameStatus && !usernameStatus.available) {
      setErrorMessage(usernameStatus.message || "Please choose a valid and available username.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      const payload = {
        fullName: editFullName.trim(),
        username: editUsername.trim().toLowerCase().replace(/^@+/, ""),
        phone: editPhone.trim(),
        dateOfBirth: editDob.trim(),
        institution: editInstitution.trim() // Empty string will be set to null in the database
      };

      const res = await fetch("/api/my-vichaar/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile changes.");
      }

      if (data.profile) {
        setProfile(data.profile);
        setEditFullName(data.profile.fullName || "");
        setEditUsername(data.profile.username || "");
        setEditPhone(data.profile.phone || "");
        setEditDob(data.profile.dateOfBirth || "");
        setEditInstitution(data.profile.institution || "");
        setIsEditing(false);
        setSaveMessage("Profile updated successfully.");
        setTimeout(() => setSaveMessage(""), 4000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-citrus" />
        <span className="text-xs uppercase tracking-widest text-warmwhite/60 font-mono">
          Loading Delegate Profile...
        </span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-warmwhite/70">
        Could not load participant profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 pb-36 font-sans">
      {/* Toast Alert Messages */}
      {saveMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Main Profile Institutional Card */}
      <div className="bg-[#050B14] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden text-warmwhite mb-10">
        {/* Subtle Decorative Gradient Top Header */}
        <div className="h-2 bg-gradient-to-r from-citrus via-crimson to-citrus" />

        <div className="p-6 sm:p-10">
          {/* Header Row: Title & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-3">
            <div className="flex items-center gap-3">
              <VichaarLogo
                variant="dashboard"
                size={36}
                className="shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold tracking-[0.24em] text-citrus uppercase block">
                  THE VICHAAR COUNCIL
                </span>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-editorial">
                  MY VICHAAR · DELEGATE DOSSIER
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile.isEmailVerified ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-950/70 border border-emerald-500/30 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Email Verified</span>
                </span>
              ) : (
                <Link
                  href="/my-vichaar/verify-email"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold px-3 py-1 bg-amber-950/70 border border-amber-500/30 rounded-full hover:bg-amber-900/60 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Verify Email</span>
                </Link>
              )}
            </div>
          </div>

          {/* User Identity Section */}
          <div className="py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Avatar Circle with Hover Overlay */}
              <div className="relative group shrink-0">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-[#182335] border-2 border-citrus/50 flex items-center justify-center text-warmwhite/70 shadow-lg overflow-hidden relative">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-editorial text-3xl font-bold text-citrus">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-20">
                      <Loader2 className="w-6 h-6 animate-spin text-citrus" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer z-10"
                    title="Upload profile picture"
                  >
                    <Camera className="w-5 h-5 text-citrus mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-editorial">
                  {profile.fullName}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base text-citrus font-mono font-medium">
                    @{profile.username}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHandle}
                    className="p-1 rounded text-warmwhite/50 hover:text-white transition-colors"
                    title="Copy Handle"
                  >
                    {copiedHandle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-xs text-warmwhite/60 tracking-wide pt-0.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] uppercase tracking-wider font-mono">
                    {profile.role || "DELEGATE"}
                  </span>
                  <span>·</span>
                  <span>Registered Council Scholar</span>
                </div>
              </div>
            </div>

            {/* Avatar Actions */}
            <div className="flex items-center gap-2 sm:self-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-citrus hover:text-navy border border-white/15 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{profile.avatarUrl ? "Change Photo" : "Upload Photo"}</span>
              </button>

              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors cursor-pointer disabled:opacity-50"
                  title="Remove photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          {metrics && (
            <div className="py-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-white/10 text-center">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <span className="text-[10px] text-warmwhite/60 uppercase tracking-wider block font-mono">Assembly Passes</span>
                <span className="text-xl font-bold text-citrus font-editorial">{metrics.totalRegistrations}</span>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <span className="text-[10px] text-warmwhite/60 uppercase tracking-wider block font-mono">Certificates</span>
                <span className="text-xl font-bold text-citrus font-editorial">{metrics.certificatesCount}</span>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <span className="text-[10px] text-warmwhite/60 uppercase tracking-wider block font-mono">Papers &amp; Submissions</span>
                <span className="text-xl font-bold text-citrus font-editorial">{metrics.submissionsCount}</span>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5">
                <span className="text-[10px] text-warmwhite/60 uppercase tracking-wider block font-mono">Account Status</span>
                <span className="text-xs font-bold text-emerald-400 block mt-1 uppercase">ACTIVE · ACCREDITED</span>
              </div>
            </div>
          )}

          {/* Detailed Information Grid */}
          <div className="pt-6 pb-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-citrus" />
              <span>ACCREDITATION &amp; PERSONAL DOSSIER</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              {/* Column 1: Personal */}
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-warmwhite/60 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-citrus" />
                    <span>Full Legal Name</span>
                  </div>
                  <div className="text-base font-semibold text-white">
                    {profile.fullName}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-warmwhite/60 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-citrus" />
                    <span>Registered Email Address</span>
                  </div>
                  <div className="text-base font-semibold text-white break-all">
                    {profile.email}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-warmwhite/60 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-citrus" />
                    <span>Date of Birth</span>
                  </div>
                  <div className="text-base font-semibold text-white">
                    {profile.dateOfBirth || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Column 2: Account & Institution */}
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-warmwhite/60 mb-1 flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5 text-citrus" />
                    <span>Public Handle / Username</span>
                  </div>
                  <div className="text-base font-semibold text-white font-mono">
                    @{profile.username}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-warmwhite/60 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-citrus" />
                    <span>WhatsApp / Mobile Number</span>
                  </div>
                  <div className="text-base font-semibold text-white">
                    {profile.phone || "Not provided"}
                  </div>
                </div>

                {/* Institution Row — Hides if empty/deleted, and shows clean Independent badge */}
                <div>
                  <div className="text-xs text-warmwhite/60 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-citrus" />
                    <span>Institutional Affiliation</span>
                  </div>
                  {profile.institution ? (
                    <div>
                      <div className="text-base font-semibold text-white">
                        {profile.institution}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                        ✓ Registered Educational Affiliation
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="inline-block px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-warmwhite/75 font-medium">
                        Independent Delegate (No Institution Affiliated)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Button: Open Detailed Edit Profile Modal */}
          <div className="pt-6 border-t border-white/10">
            <button
              onClick={() => {
                setEditFullName(profile.fullName || "");
                setEditUsername(profile.username || "");
                setEditPhone(profile.phone || "");
                setEditDob(profile.dateOfBirth || "");
                setEditInstitution(profile.institution || "");
                setErrorMessage("");
                setIsEditing(true);
              }}
              className="w-full py-4 px-6 rounded-xl border border-citrus/40 bg-citrus/10 hover:bg-citrus hover:text-[#070E1A] text-citrus font-bold text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-2.5 transition-all shadow-md group cursor-pointer"
            >
              <Edit3 className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>EDIT DOSSIER &amp; HANDLE DETAILS</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DETAILED EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B1424] border border-white/15 rounded-2xl w-full max-w-xl p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-citrus" />
                <h3 className="text-lg font-bold text-white tracking-wide font-editorial">
                  Edit Delegate Dossier
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-warmwhite/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-950/70 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5 pt-5">
              {/* Field 1: Full Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-bold mb-1.5">
                  Full Legal Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full px-4 py-2.5 bg-[#060D17] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus transition-all"
                />
              </div>

              {/* Field 2: Username (with Real-time Availability Check) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-bold">
                    Username Handle <span className="text-crimson">*</span>
                  </label>
                  {usernameChecking ? (
                    <span className="text-[11px] text-warmwhite/60 flex items-center gap-1 font-mono">
                      <Loader2 className="w-3 h-3 animate-spin text-citrus" />
                      Checking availability...
                    </span>
                  ) : usernameStatus ? (
                    <span
                      className={`text-[11px] font-mono flex items-center gap-1 font-semibold ${
                        usernameStatus.available ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {usernameStatus.available ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {usernameStatus.message}
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-citrus font-mono font-bold text-sm select-none">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="username_handle"
                    maxLength={30}
                    className={`w-full pl-8 pr-4 py-2.5 bg-[#060D17] border rounded-xl text-white font-mono text-sm focus:outline-none transition-all ${
                      usernameStatus && !usernameStatus.available
                        ? "border-red-500/60 focus:border-red-500"
                        : usernameStatus && usernameStatus.available
                        ? "border-emerald-500/60 focus:border-emerald-400"
                        : "border-white/15 focus:border-citrus"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-warmwhite/50 mt-1 block">
                  3–30 characters. Lowercase letters, numbers, and underscores only.
                </span>
              </div>

              {/* Field 3: Phone Number */}
              <div>
                <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-bold mb-1.5">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-2.5 bg-[#060D17] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus transition-all"
                />
              </div>

              {/* Field 4: Date of Birth */}
              <div>
                <InstitutionalDatePicker
                  label="Date of Birth"
                  value={editDob}
                  onChange={(val) => setEditDob(val)}
                  placeholder="Select Date of Birth"
                  minYear={1990}
                  maxYear={2015}
                  theme="dark"
                />
              </div>

              {/* Field 5: Institution (with Clear / Set as Independent Button) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs uppercase tracking-wider text-warmwhite/80 font-bold">
                    Institution Affiliation
                  </label>
                  {editInstitution.trim() && (
                    <button
                      type="button"
                      onClick={() => setEditInstitution("")}
                      className="text-[11px] text-red-400 hover:text-red-300 font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      ✕ Clear (Set as Independent)
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={editInstitution}
                  onChange={(e) => setEditInstitution(e.target.value)}
                  placeholder="e.g. Modern School, Barakhamba (Leave empty if independent)"
                  className="w-full px-4 py-2.5 bg-[#060D17] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus transition-all"
                />

                {!editInstitution.trim() ? (
                  <span className="text-[10px] text-citrus mt-1 block font-mono">
                    ℹ️ No institution set. You will appear as an Independent Delegate.
                  </span>
                ) : (
                  <span className="text-[10px] text-warmwhite/50 mt-1 block">
                    Clear this field anytime if you wish to detach your school or college.
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-warmwhite/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || (usernameStatus !== null && !usernameStatus.available)}
                  className="px-6 py-2.5 rounded-xl bg-citrus hover:bg-citrus-hover text-[#070E1A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Dossier...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
