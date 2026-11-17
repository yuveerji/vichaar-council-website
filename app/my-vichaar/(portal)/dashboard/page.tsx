"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Ticket,
  Award,
  FileText,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Camera,
  Upload,
  Trash2,
  User
} from "lucide-react";

interface DashboardData {
  profile: {
    id: string;
    fullName: string;
    username: string;
    email: string;
    institution?: string | null;
    avatarUrl?: string | null;
    isEmailVerified: boolean;
  };
  metrics: {
    totalRegistrations: number;
    upcomingCount: number;
    confirmedCount?: number;
    pendingCount?: number;
    completedCount: number;
    certificatesCount: number;
    submissionsCount: number;
    unreadNotificationsCount: number;
  };
  registrations: any[];
  certificates: any[];
  notifications: any[];
}

export default function ParticipantDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarFeedback, setAvatarFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/my-vichaar/profile");
        const json = await res.json();
        if (res.ok) {
          setData(json);
        }
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarFeedback({ type: "error", text: "Please select an image file (PNG, JPG, WebP)." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarFeedback({ type: "error", text: "Image file exceeds 5MB size limit." });
      return;
    }

    setUploadingAvatar(true);
    setAvatarFeedback(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/my-vichaar/profile/avatar", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to upload avatar");
      }

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            avatarUrl: result.avatarUrl
          }
        };
      });

      setAvatarFeedback({ type: "success", text: "Profile picture updated successfully!" });
      router.refresh();
      setTimeout(() => setAvatarFeedback(null), 4000);
    } catch (err: any) {
      setAvatarFeedback({ type: "error", text: err.message || "Failed to upload image." });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    setUploadingAvatar(true);
    setAvatarFeedback(null);

    try {
      const res = await fetch("/api/my-vichaar/profile/avatar", {
        method: "DELETE"
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to remove avatar");

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          profile: {
            ...prev.profile,
            avatarUrl: null
          }
        };
      });

      setAvatarFeedback({ type: "success", text: "Profile picture removed." });
      router.refresh();
      setTimeout(() => setAvatarFeedback(null), 3000);
    } catch (err: any) {
      setAvatarFeedback({ type: "error", text: err.message || "Failed to remove picture." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-citrus" />
      </div>
    );
  }

  const profile = data?.profile;
  const metrics = data?.metrics || {
    totalRegistrations: 0,
    upcomingCount: 0,
    confirmedCount: 0,
    pendingCount: 0,
    completedCount: 0,
    certificatesCount: 0,
    submissionsCount: 0,
    unreadNotificationsCount: 0
  };
  const registrations = data?.registrations || [];
  const upcomingRegistrations = registrations.filter(
    (r) => new Date(r.event?.startDate || 0) >= new Date()
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner with Integrated Profile Picture Upload Station */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1728] via-[#10213A] to-[#091322] border border-white/10 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-citrus/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          {/* Welcome Text Content */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
                OFFICIAL PARTICIPANT SPACE
              </span>
              {profile?.isEmailVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-editorial font-bold text-white tracking-wide">
              Welcome, {profile?.fullName || "Delegate"}
            </h1>
            <p className="text-sm font-editorial italic text-citrus/90 tracking-wider mt-1">
              YOUR SPACE. YOUR IDEAS. YOUR JOURNEY.
            </p>
            <p className="text-xs sm:text-sm text-warmwhite/70 leading-relaxed mt-3">
              Manage your conference passes, debate registrations, research submissions, and verified credentials across every Vichaar Council initiative.
            </p>

            <div className="mt-6 flex flex-col xs:flex-row flex-wrap gap-3 w-full xs:w-auto">
              <Link
                href="/events"
                className="px-5 py-3 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md w-full xs:w-auto text-center"
              >
                <span>Explore Upcoming Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/my-vichaar/profile"
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors w-full xs:w-auto text-center"
              >
                <span>View My Profile</span>
              </Link>
            </div>
          </div>

          {/* Profile Picture Upload Station */}
          <div className="bg-[#070E1A]/90 border border-white/15 rounded-2xl p-5 sm:p-6 backdrop-blur-xl shrink-0 shadow-2xl xl:max-w-sm w-full">
            <div className="flex items-center gap-4">
              {/* Circular Avatar Display with Quick Upload Overlay */}
              <div className="relative group shrink-0">
                <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border-2 border-citrus/40 bg-[#101C32] p-0.5 shadow-[0_0_20px_rgba(255,166,43,0.2)] overflow-hidden relative flex items-center justify-center">
                  {profile?.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile?.fullName || "Profile Picture"}
                      width={88}
                      height={88}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-tr from-navy to-[#18263B] flex items-center justify-center text-citrus font-bold text-2xl font-editorial">
                      {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : <User className="w-8 h-8 text-citrus" />}
                    </div>
                  )}

                  {/* Loading Spinner Overlay */}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-full z-20">
                      <Loader2 className="w-6 h-6 animate-spin text-citrus" />
                    </div>
                  )}

                  {/* Hover Camera Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white rounded-full cursor-pointer z-10"
                    title="Change Profile Picture"
                    aria-label="Change Profile Picture"
                  >
                    <Camera className="w-5 h-5 text-citrus mb-0.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                  </button>
                </div>

                {/* Status Dot */}
                <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#070E1A] shadow" />
              </div>

              {/* Avatar Metadata & Controls */}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-citrus">
                  DELEGATE PORTRAIT
                </div>
                <div className="text-xs font-bold text-white truncate mt-0.5">
                  {profile?.fullName}
                </div>
                <div className="text-[11px] text-warmwhite/60 font-mono truncate">
                  @{profile?.username}
                </div>

                {/* Upload & Remove Action Buttons */}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-citrus hover:text-navy border border-white/15 text-white font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{profile?.avatarUrl ? "Change" : "Upload Photo"}</span>
                  </button>

                  {profile?.avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={uploadingAvatar}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Remove profile picture"
                      aria-label="Remove profile picture"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            {/* Upload Feedback Toast */}
            {avatarFeedback && (
              <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                avatarFeedback.type === "success"
                  ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-300"
                  : "bg-red-950/70 border border-red-500/40 text-red-300"
              }`}>
                {avatarFeedback.type === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <span className="text-red-400 font-bold shrink-0">!</span>
                )}
                <span className="truncate">{avatarFeedback.text}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-citrus/30 transition-colors">
          <div className="flex items-center justify-between text-warmwhite/60 mb-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-medium truncate">Registrations</span>
            <Calendar className="w-4 h-4 text-citrus shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-sans">
            {metrics.totalRegistrations}
          </div>
          <div className="text-[10px] sm:text-[11px] text-warmwhite/50 mt-1 truncate">Total across all events</div>
        </div>

        <div className="bg-[#0B1526] border border-emerald-500/20 bg-gradient-to-b from-emerald-500/[0.04] to-transparent rounded-2xl p-3.5 sm:p-5 hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-warmwhite/60 mb-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-medium text-emerald-400 truncate">Confirmed</span>
            <Ticket className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300 font-sans">
            {metrics.confirmedCount !== undefined ? metrics.confirmedCount : metrics.upcomingCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-warmwhite/50 mt-1 truncate">Verified entry passes</div>
        </div>

        <div className="bg-[#0B1526] border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.05] to-transparent rounded-2xl p-3.5 sm:p-5 hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-warmwhite/60 mb-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-medium text-amber-400 truncate">Pending</span>
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300 font-sans">
            {metrics.pendingCount || 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-warmwhite/50 mt-1 truncate">Awaiting Sheet verification</div>
        </div>

        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-3.5 sm:p-5 hover:border-citrus/30 transition-colors">
          <div className="flex items-center justify-between text-warmwhite/60 mb-2">
            <span className="text-[11px] sm:text-xs uppercase tracking-wider font-medium truncate">Certificates</span>
            <Award className="w-4 h-4 text-purple-400 shrink-0" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-sans">
            {metrics.certificatesCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-warmwhite/50 mt-1 truncate">Issued & verified</div>
        </div>
      </div>

      {/* Main Section: Next Event or Registration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Participation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-wide uppercase font-sans">
              Upcoming Participations
            </h2>
            <Link
              href="/my-vichaar/registrations"
              className="text-xs text-citrus font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingRegistrations.length > 0 ? (
            <div className="space-y-4">
              {upcomingRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className={`bg-[#0B1526] border rounded-2xl p-6 transition-colors ${
                    reg.paymentStatus === "SUCCESS"
                      ? "border-white/10 hover:border-emerald-500/40"
                      : "border-amber-500/25 bg-gradient-to-b from-amber-500/[0.03] to-[#0B1526] hover:border-amber-400/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-citrus font-semibold">
                        {reg.ticketCategory?.name || "Delegate Pass"}
                      </span>
                      <h3 className="text-xl font-editorial font-bold text-white mt-0.5">
                        {reg.event?.title || "Upcoming Event"}
                      </h3>
                    </div>
                    <div>
                      {reg.paymentStatus === "SUCCESS" ? (
                        <span className="text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Confirmed</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-300 font-semibold px-3 py-1 bg-amber-950/70 border border-amber-500/40 rounded-full flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Verification Pending Explanatory Note */}
                  {reg.paymentStatus !== "SUCCESS" && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-amber-300">Payment UTR In Review by Secretariat</span>
                        <span>Your registration has been logged and is awaiting confirmation in Google Sheets. Your official scannable entry pass will activate once verified.</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-warmwhite/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-citrus" />
                      <span>{new Date(reg.event?.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-citrus" />
                      <span className="truncate">{reg.event?.city || "New Delhi"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-citrus" />
                      <span className="font-mono">{reg.registrationNumber}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-warmwhite/50">
                      Admissions Desk: {reg.event?.venue}
                    </span>
                    <Link
                      href="/my-vichaar/tickets"
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                        reg.paymentStatus === "SUCCESS"
                          ? "bg-citrus/15 hover:bg-citrus/25 text-citrus"
                          : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300"
                      }`}
                    >
                      {reg.paymentStatus === "SUCCESS" ? "View Digital Pass →" : "View Verification Status →"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-warmwhite/40">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">No Active Registrations</h3>
                <p className="text-xs text-warmwhite/60 max-w-sm mx-auto mt-1">
                  You are not currently registered for any upcoming conferences or debate experiences.
                </p>
              </div>
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-citrus text-[#070E1A] font-bold text-xs uppercase tracking-wider hover:bg-citrus/90 transition-all shadow-md"
              >
                <span>Browse Available Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Col: Quick Access & Notifications */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white tracking-wide uppercase font-sans">
            Quick Actions
          </h2>

          <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-5 space-y-3">
            <Link
              href="/my-vichaar/profile"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-citrus/10 flex items-center justify-center text-citrus">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-citrus transition-colors">
                    Participant Profile
                  </div>
                  <div className="text-[11px] text-warmwhite/50">View & edit institutional credentials</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-warmwhite/40 group-hover:text-citrus transition-colors" />
            </Link>

            <Link
              href="/my-vichaar/tickets"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-citrus transition-colors">
                    Digital Passes & QR
                  </div>
                  <div className="text-[11px] text-warmwhite/50">Instant check-in credentials</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-warmwhite/40 group-hover:text-citrus transition-colors" />
            </Link>

            <Link
              href="/my-vichaar/submissions"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-citrus transition-colors">
                    Paper & Policy Submission
                  </div>
                  <div className="text-[11px] text-warmwhite/50">Submit research for review</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-warmwhite/40 group-hover:text-citrus transition-colors" />
            </Link>

            <Link
              href="/my-vichaar/certificates"
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-citrus transition-colors">
                    Certificates of Merit
                  </div>
                  <div className="text-[11px] text-warmwhite/50">Verifiable credentials</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-warmwhite/40 group-hover:text-citrus transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
