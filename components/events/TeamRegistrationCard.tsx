"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import VichaarLogo from "@/components/VichaarLogo";
import { initiateCashfreePayment } from "@/lib/cashfreeClient";
import { QRCodeSVG } from "qrcode.react";
import {
  Users2,
  User,
  CreditCard,
  FileCheck2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from "lucide-react";

interface TicketCategory {
  id: string;
  name: string;
  price: number;
  capacity: number;
  soldCount: number;
  description: string | null;
  isActive: boolean;
}

interface TeamRegistrationCardProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  tickets: TicketCategory[];
  eventStatus: string;
}

type SectionKey = "A" | "B" | "C" | "D" | "E";

const CLASSES_LIST = ["7", "8", "9", "10", "11", "12"];

export default function TeamRegistrationCard({
  eventId,
  eventTitle,
  eventSlug,
  tickets,
  eventStatus
}: TeamRegistrationCardProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>("A");

  const [formData, setFormData] = useState({
    // Section A: Team & Delegate 1 (Primary)
    teamName: "",
    speaker1Name: "",
    speaker1Class: "",
    speaker1School: "",
    speaker1City: "",
    speaker1Email: "",
    speaker1Phone: "",
    speaker1Guardian: "",

    // Section B: Delegate 2 (Co-Speaker)
    speaker2Name: "",
    speaker2Class: "",
    speaker2School: "",
    speaker2Email: "",
    speaker2Phone: "",
    speaker2Guardian: "",

    // Section C: Debate Preferences
    stancePreference: "No Preference", // FOR | AGAINST | No Preference
    comfortableBothStances: "Yes, absolutely.",
    previousExperience: "Yes",
    whyParticipate: "",

    // Section D: Team Payment
    feePaid: "1098", // 2 * 549
    transactionId: "",
    paymentScreenshot: "",

    // Section E: Consent & Declaration
    parentConsentBoth: false,
    teamDeclaration: false
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASHFREE" | "MANUAL_UTR">("CASHFREE");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedInParticipant, setLoggedInParticipant] = useState<any>(null);
  const [profileAutoFilled, setProfileAutoFilled] = useState(false);

  const applySpeaker1Profile = (user: any) => {
    if (!user) return;
    setFormData((prev) => ({
      ...prev,
      speaker1Name: user.fullName || prev.speaker1Name,
      speaker1Email: user.email || prev.speaker1Email,
      speaker1Phone: user.phone || prev.speaker1Phone,
      speaker1City: user.city || prev.speaker1City,
      speaker1School: user.institution || prev.speaker1School,
      speaker1Class: user.grade || prev.speaker1Class,
      speaker1Guardian:
        user.guardianName
          ? `${user.guardianName}${user.guardianPhone ? ` (${user.guardianPhone})` : ""}`
          : prev.speaker1Guardian
    }));
    setProfileAutoFilled(true);
    setTimeout(() => setProfileAutoFilled(false), 4000);
  };

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/my-vichaar/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setLoggedInParticipant(data.user);
            const user = data.user;
            setFormData((prev) => ({
              ...prev,
              speaker1Name: prev.speaker1Name || user.fullName || "",
              speaker1Email: prev.speaker1Email || user.email || "",
              speaker1Phone: prev.speaker1Phone || user.phone || "",
              speaker1City: prev.speaker1City || user.city || "",
              speaker1School: prev.speaker1School || user.institution || "",
              speaker1Class: prev.speaker1Class || user.grade || "",
              speaker1Guardian:
                prev.speaker1Guardian ||
                (user.guardianName
                  ? `${user.guardianName}${user.guardianPhone ? ` (${user.guardianPhone})` : ""}`
                  : "")
            }));
          }
        }
      } catch {
        // Guest mode
      }
    }
    loadMe();
  }, []);

  const upiId = "9116502522@ptsbi";
  const upiPayPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=THE%20VICHAAR%20COUNCIL&am=1098&cu=INR&tn=SHABD%20AND%20SOCH%20TEAM%20REGISTRATION`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage("File size exceeds 50MB limit. Please upload a smaller image.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setScreenshotPreview(result);
      setFormData((prev) => ({ ...prev, paymentScreenshot: result }));
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const validateSectionA = () => {
    if (
      !formData.teamName.trim() ||
      !formData.speaker1Name.trim() ||
      !formData.speaker1Class ||
      !formData.speaker1School.trim() ||
      !formData.speaker1City.trim() ||
      !formData.speaker1Email.trim() ||
      !formData.speaker1Phone.trim() ||
      !formData.speaker1Guardian.trim()
    ) {
      setErrorMessage("Please complete all required fields for Team Details & Delegate 1 in Section A.");
      return false;
    }
    if (!formData.speaker1Email.includes("@")) {
      setErrorMessage("Please enter a valid email for Delegate 1.");
      return false;
    }
    return true;
  };

  const validateSectionB = () => {
    if (
      !formData.speaker2Name.trim() ||
      !formData.speaker2Class ||
      !formData.speaker2School.trim() ||
      !formData.speaker2Email.trim() ||
      !formData.speaker2Phone.trim() ||
      !formData.speaker2Guardian.trim()
    ) {
      setErrorMessage("Please complete all required fields for Delegate 2 (Co-Speaker) in Section B.");
      return false;
    }
    if (!formData.speaker2Email.includes("@")) {
      setErrorMessage("Please enter a valid email for Delegate 2.");
      return false;
    }
    return true;
  };

  const validateSectionC = () => {
    if (!formData.whyParticipate.trim()) {
      setErrorMessage("Please answer the motivation question in Section C.");
      return false;
    }
    return true;
  };

  const validateSectionD = () => {
    if (paymentMethod === "MANUAL_UTR") {
      if (!formData.transactionId.trim()) {
        setErrorMessage("Please enter the 12-digit UPI Transaction ID / UTR Number in Section D.");
        return false;
      }
      if (!formData.paymentScreenshot) {
        setErrorMessage("Please upload your team payment screenshot in Section D.");
        return false;
      }
    }
    return true;
  };

  const validateSectionE = () => {
    if (!formData.parentConsentBoth || !formData.teamDeclaration) {
      setErrorMessage("Both Parental Consent and Team Declaration are mandatory.");
      return false;
    }
    return true;
  };

  const navigateTo = (section: SectionKey) => {
    setErrorMessage("");
    if (section === "B" && !validateSectionA()) return;
    if (section === "C" && (!validateSectionA() || !validateSectionB())) return;
    if (section === "D" && (!validateSectionA() || !validateSectionB() || !validateSectionC())) return;
    if (section === "E" && (!validateSectionA() || !validateSectionB() || !validateSectionC() || !validateSectionD())) return;
    setActiveSection(section);
  };

  const handleCashfreePaymentFirst = async () => {
    setErrorMessage("");

    if (!validateSectionA()) { setActiveSection("A"); return; }
    if (!validateSectionB()) { setActiveSection("B"); return; }
    if (!validateSectionC()) { setActiveSection("C"); return; }

    setIsSubmitting(true);

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          eventSlug,
          ticketCategoryId: tickets[0]?.id || undefined,
          fullName: `${formData.speaker1Name} & ${formData.speaker2Name} (${formData.teamName})`,
          email: formData.speaker1Email,
          phone: formData.speaker1Phone,
          city: formData.speaker1City,
          institution: formData.speaker1School,
          amount: 1098,
          notes: {
            ...formData,
            declarationConfirmed: true,
            channel: "TEAM",
            registrationType: "TEAM_DELEGATE",
            paymentMethod: "CASHFREE_ONLINE",
            submittedAt: new Date().toISOString()
          }
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.paymentSessionId) {
        throw new Error(orderData.error || "Failed to initialize secure Cashfree payment session for team.");
      }

      if (orderData.paymentUrl) {
        window.location.href = orderData.paymentUrl;
        return;
      }

      await initiateCashfreePayment({
        paymentSessionId: orderData.paymentSessionId,
        mode: "production",
        redirectTarget: "_self"
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate team payment.");
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateSectionA()) { setActiveSection("A"); return; }
    if (!validateSectionB()) { setActiveSection("B"); return; }
    if (!validateSectionC()) { setActiveSection("C"); return; }
    if (!validateSectionD()) { setActiveSection("D"); return; }
    if (!validateSectionE()) { setActiveSection("E"); return; }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "CASHFREE") {
        // Create Cashfree Order for Team (₹1098)
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            eventSlug,
            ticketCategoryId: tickets[0]?.id || undefined,
            fullName: `${formData.speaker1Name} & ${formData.speaker2Name} (${formData.teamName})`,
            email: formData.speaker1Email,
            phone: formData.speaker1Phone,
            city: formData.speaker1City,
            institution: formData.speaker1School,
            amount: 1098,
            notes: {
              ...formData,
              channel: "TEAM",
              registrationType: "TEAM_DELEGATE",
              paymentMethod: "CASHFREE_ONLINE",
              submittedAt: new Date().toISOString()
            }
          })
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.paymentSessionId) {
          throw new Error(orderData.error || "Failed to initialize secure Cashfree payment session for team.");
        }

        // Launch Cashfree Checkout
        if (orderData.paymentUrl) {
          window.location.href = orderData.paymentUrl;
          return;
        }

        await initiateCashfreePayment({
          paymentSessionId: orderData.paymentSessionId,
          mode: "production",
          redirectTarget: "_self"
        });
        return;
      }

      // Manual UPI / UTR Fallback Flow
      const payload = {
        eventId,
        eventSlug,
        ticketCategoryId: tickets[0]?.id || undefined,
        channel: "TEAM",
        registrationType: "TEAM_DELEGATE",
        fullName: `${formData.speaker1Name} & ${formData.speaker2Name} (${formData.teamName})`,
        email: formData.speaker1Email,
        whatsappNumber: formData.speaker1Phone,
        city: formData.speaker1City,
        schoolName: formData.speaker1School,
        currentClass: formData.speaker1Class,
        guardianNameAndContact: formData.speaker1Guardian,
        dateOfBirth: "2008-01-01",
        stancePreference: formData.stancePreference,
        comfortableBothStances: formData.comfortableBothStances,
        previousExperience: formData.previousExperience,
        whyParticipate: formData.whyParticipate,
        feePaid: 1098,
        transactionId: formData.transactionId,
        paymentScreenshot: formData.paymentScreenshot,
        guardianConsent: formData.parentConsentBoth,
        participantDeclaration: formData.teamDeclaration,
        teamDetails: {
          teamName: formData.teamName,
          speaker1: {
            name: formData.speaker1Name,
            class: formData.speaker1Class,
            school: formData.speaker1School,
            city: formData.speaker1City,
            email: formData.speaker1Email,
            phone: formData.speaker1Phone,
            guardian: formData.speaker1Guardian
          },
          speaker2: {
            name: formData.speaker2Name,
            class: formData.speaker2Class,
            school: formData.speaker2School,
            email: formData.speaker2Email,
            phone: formData.speaker2Phone,
            guardian: formData.speaker2Guardian
          }
        }
      };

      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit team registration.");
      }

      const confirmationUrl = `/events/${eventSlug}/confirmation?reg_no=${encodeURIComponent(
        data.registrationNumber
      )}&order_id=${encodeURIComponent(data.orderId || "")}&status=pending&name=${encodeURIComponent(
        formData.teamName
      )}&amount=1098&utr=${encodeURIComponent(formData.transactionId)}&channel=team`;

      router.push(confirmationUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please contact the Secretariat.");
      setIsSubmitting(false);
    }
  };

  const sections: { key: SectionKey; label: string; number: string }[] = [
    { key: "A", label: "Team & Speaker 1", number: "01" },
    { key: "B", label: "Co-Speaker 2", number: "02" },
    { key: "C", label: "Preferences", number: "03" },
    { key: "D", label: "Team Payment", number: "04" },
    { key: "E", label: "Declarations", number: "05" }
  ];

  return (
    <div className="border border-charcoal/20 bg-white rounded-md shadow-xl overflow-hidden font-sans">
      {/* Top Header */}
      <div className="bg-navy text-warmwhite p-6 sm:p-8 border-b-4 border-citrus">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <VichaarLogo
              variant="card"
              size={48}
              className="shrink-0"
              priority
            />
            <div>
              <span className="text-[10px] font-bold tracking-[0.24em] text-citrus uppercase block">
                THE VICHAAR COUNCIL · DELEGATION ACCREDITATION
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white">
                SHABD &amp; SOCH
              </h2>
            </div>
          </div>
          <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded border border-white/10 sm:border-none">
            <span className="inline-block px-3 py-1 bg-citrus text-navy text-[10px] font-bold tracking-widest uppercase rounded-xs">
              TEAM REGISTRATION
            </span>
            <span className="text-xs text-warmwhite/80 block mt-1 font-mono">
              20 December 2026 · 2 Delegates
            </span>
          </div>
        </div>

        <div className="mt-5 pt-5 border-t border-white/10 text-xs sm:text-sm text-warmwhite/90 leading-relaxed space-y-1">
          <p className="font-medium text-citrus">
            Welcome to SHABD &amp; SOCH Team Registration!
          </p>
          <p className="text-warmwhite/75 text-xs">
            This form is for pre-formed 2-member debate pairings and teams representing Classes 7–12.
            Both delegates will participate in round allocations and receive individual accredited passes and certificates.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-warmwhite border-b border-charcoal/15 px-3 sm:px-6 py-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 sm:gap-2 sm:justify-between min-w-[500px] sm:min-w-0">
          {sections.map((sec) => {
            const isActive = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => navigateTo(sec.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 ${
                  isActive ? "bg-navy text-citrus shadow-sm" : "text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isActive ? "bg-citrus text-navy" : "bg-charcoal/10 text-charcoal"
                  }`}
                >
                  {sec.key}
                </span>
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Participant Profile Status & Delegate 1 Auto-Fill Banner */}
      <div className="mx-4 sm:mx-6 md:mx-8 mt-5">
        {loggedInParticipant ? (
          <div className="p-4 sm:p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Delegate 1 Profile Linked
                  </span>
                  <span className="text-xs font-mono font-bold text-navy">
                    @{loggedInParticipant.username}
                  </span>
                </div>
                <p className="text-xs text-charcoal/80 font-medium mt-1">
                  Active session for <strong className="text-navy">{loggedInParticipant.fullName}</strong>. Team registrations link Delegate 1 to your portal account for passes and certificates.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => applySpeaker1Profile(loggedInParticipant)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-navy hover:bg-navy/90 text-citrus font-bold text-xs uppercase tracking-wider transition-all shrink-0 shadow-xs cursor-pointer"
            >
              {profileAutoFilled ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Delegate 1 Applied!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-citrus" />
                  <span>Auto-Fill Delegate 1</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5 rounded-xl border border-amber-500/35 bg-gradient-to-r from-amber-500/[0.08] to-amber-500/[0.03] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-800 mt-0.5 sm:mt-0">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Profile Required for Certificates
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-charcoal">
                  Register with your My Vichaar Profile
                </h4>
                <p className="text-xs text-charcoal/75 leading-relaxed">
                  A My Vichaar profile is required so official delegate passes, QR attendance dockets, and verifiable certificates can be issued directly to delegates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link
                href={`/my-vichaar/login?redirect=${encodeURIComponent(`/events/${eventSlug}/register?type=team`)}`}
                className="px-3.5 py-2 rounded-lg bg-navy hover:bg-navy/90 text-citrus text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                Sign In &amp; Auto-Fill
              </Link>
              <Link
                href={`/my-vichaar/register?redirect=${encodeURIComponent(`/events/${eventSlug}/register?type=team`)}`}
                className="px-3.5 py-2 rounded-lg border border-charcoal/20 bg-white hover:bg-charcoal/5 text-charcoal text-xs font-bold uppercase tracking-wider transition-all"
              >
                Create Profile
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="m-4 sm:m-6 p-4 bg-red-50 border-l-4 border-crimson rounded-r flex items-start gap-3 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-crimson shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block">Attention Required</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* SECTION A */}
        {activeSection === "A" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 01 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <Users2 className="w-6 h-6 text-citrus" />
                Section A — Team Name &amp; Delegate 1 (Primary)
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Team Name / Debating Society Moniker <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phoenix Deliberators / Udaipur Debaters"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Speaker 1 Full Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.speaker1Name}
                  onChange={(e) => setFormData({ ...formData, speaker1Name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Speaker 1 Class (7–12) <span className="text-crimson">*</span>
                </label>
                <select
                  required
                  value={formData.speaker1Class}
                  onChange={(e) => setFormData({ ...formData, speaker1Class: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                >
                  <option value="">Select Class</option>
                  {CLASSES_LIST.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  School Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="School Name"
                  value={formData.speaker1School}
                  onChange={(e) => setFormData({ ...formData, speaker1School: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  City <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={formData.speaker1City}
                  onChange={(e) => setFormData({ ...formData, speaker1City: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Email Address <span className="text-crimson">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="speaker1@gmail.com"
                  value={formData.speaker1Email}
                  onChange={(e) => setFormData({ ...formData, speaker1Email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  WhatsApp Contact <span className="text-crimson">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.speaker1Phone}
                  onChange={(e) => setFormData({ ...formData, speaker1Phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Parent/Guardian Name &amp; Contact <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma (+91 98765 00000)"
                  value={formData.speaker1Guardian}
                  onChange={(e) => setFormData({ ...formData, speaker1Guardian: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => navigateTo("B")}
                className="inline-flex items-center gap-2 bg-navy hover:bg-slate text-warmwhite text-xs font-bold uppercase tracking-widest py-3 px-6 rounded transition-all group shadow-sm"
              >
                <span>Proceed to Co-Speaker 2</span>
                <ArrowRight className="w-4 h-4 text-citrus group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION B */}
        {activeSection === "B" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 02 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <User className="w-6 h-6 text-citrus" />
                Section B — Delegate 2 (Co-Speaker)
              </h3>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Speaker 2 Full Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formData.speaker2Name}
                  onChange={(e) => setFormData({ ...formData, speaker2Name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Speaker 2 Class (7–12) <span className="text-crimson">*</span>
                </label>
                <select
                  required
                  value={formData.speaker2Class}
                  onChange={(e) => setFormData({ ...formData, speaker2Class: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                >
                  <option value="">Select Class</option>
                  {CLASSES_LIST.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  School Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="School Name"
                  value={formData.speaker2School}
                  onChange={(e) => setFormData({ ...formData, speaker2School: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Email Address <span className="text-crimson">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="speaker2@gmail.com"
                  value={formData.speaker2Email}
                  onChange={(e) => setFormData({ ...formData, speaker2Email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  WhatsApp Contact <span className="text-crimson">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98111 22233"
                  value={formData.speaker2Phone}
                  onChange={(e) => setFormData({ ...formData, speaker2Phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Parent/Guardian Contact <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunita Verma (+91 98111 00000)"
                  value={formData.speaker2Guardian}
                  onChange={(e) => setFormData({ ...formData, speaker2Guardian: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => navigateTo("A")}
                className="inline-flex items-center gap-2 text-charcoal/70 hover:text-charcoal text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo("C")}
                className="inline-flex items-center gap-2 bg-navy hover:bg-slate text-warmwhite text-xs font-bold uppercase tracking-widest py-3 px-6 rounded transition-all group shadow-sm"
              >
                <span>Proceed to Section C</span>
                <ArrowRight className="w-4 h-4 text-citrus group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION C */}
        {activeSection === "C" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 03 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal">
                Section C — Debate Preferences
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Team Preferred Original Stance <span className="text-crimson">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["FOR", "AGAINST", "No Preference"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormData({ ...formData, stancePreference: st })}
                      className={`p-3 rounded text-xs font-bold border transition-all ${
                        formData.stancePreference === st
                          ? "bg-navy text-citrus border-navy shadow-xs"
                          : "bg-warmwhite border-charcoal/20 text-charcoal/80"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Why does your team want to participate in SHABD &amp; SOCH? <span className="text-crimson">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share what excites your debating pair about this debate and social experience..."
                  value={formData.whyParticipate}
                  onChange={(e) => setFormData({ ...formData, whyParticipate: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy resize-none"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => navigateTo("B")}
                className="inline-flex items-center gap-2 text-charcoal/70 hover:text-charcoal text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo("D")}
                className="inline-flex items-center gap-2 bg-navy hover:bg-slate text-warmwhite text-xs font-bold uppercase tracking-widest py-3 px-6 rounded transition-all group shadow-sm"
              >
                <span>Proceed to Section D</span>
                <ArrowRight className="w-4 h-4 text-citrus group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION D */}
        {activeSection === "D" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 04 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-citrus" />
                Section D — Consolidated Team Payment (₹1,098)
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Choose online checkout via Cashfree PG or manual UPI UTR verification for your 2-delegate debate team.
              </p>
            </div>

            {/* Payment Mode Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("CASHFREE");
                  setErrorMessage("");
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "CASHFREE"
                    ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-600"
                    : "border-charcoal/15 bg-warmwhite hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommended
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-800">⚡ Instant</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    Pay Online via Cashfree
                  </h4>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-snug">
                    UPI (Google Pay, PhonePe, Paytm), Cards &amp; NetBanking. Instant passes for both delegates.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("MANUAL_UTR");
                  setErrorMessage("");
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "MANUAL_UTR"
                    ? "border-navy bg-navy/5 shadow-sm ring-1 ring-navy"
                    : "border-charcoal/15 bg-warmwhite hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-charcoal/10 text-charcoal">
                    Offline / NEFT
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal/70">Manual</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-navy" />
                    Direct UPI QR / Bank UTR
                  </h4>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-snug">
                    Scan static QR code, transfer ₹1,098 manually, and enter 12-digit UTR + receipt.
                  </p>
                </div>
              </button>
            </div>

            {/* CASHFREE PAYMENT VIEW */}
            {paymentMethod === "CASHFREE" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.06] to-white p-5 sm:p-6 rounded-lg space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        CASHFREE SECURE PAYMENT GATEWAY
                      </span>
                      <h4 className="font-editorial text-xl font-bold text-charcoal">
                        Consolidated Team Pass (2 Delegates)
                      </h4>
                      <p className="text-xs text-charcoal/70 mt-0.5">
                        PCI-DSS Level 1 Certified · 256-Bit Bank Encryption · RBI Compliant
                      </p>
                    </div>
                    <div className="text-left sm:text-right bg-white px-4 py-2 rounded border border-charcoal/10">
                      <span className="text-[10px] text-charcoal/60 uppercase block font-semibold">Total Payable</span>
                      <span className="font-editorial text-2xl sm:text-3xl font-bold text-emerald-700">₹1,098</span>
                      <span className="text-[10px] text-charcoal/50 block font-mono">2 × ₹549 per delegate</span>
                    </div>
                  </div>

                  {/* Supported Payment Channels */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded border border-charcoal/10 flex items-center gap-2">
                      <span className="text-base">📱</span>
                      <div>
                        <strong className="block text-[11px] text-charcoal">UPI Instant</strong>
                        <span className="text-[10px] text-charcoal/60">GPay, PhonePe, Paytm</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded border border-charcoal/10 flex items-center gap-2">
                      <span className="text-base">💳</span>
                      <div>
                        <strong className="block text-[11px] text-charcoal">Debit &amp; Credit</strong>
                        <span className="text-[10px] text-charcoal/60">Visa, Master, RuPay</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded border border-charcoal/10 flex items-center gap-2">
                      <span className="text-base">🏦</span>
                      <div>
                        <strong className="block text-[11px] text-charcoal">Net Banking</strong>
                        <span className="text-[10px] text-charcoal/60">50+ Major Banks</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded border border-charcoal/10 flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <div>
                        <strong className="block text-[11px] text-charcoal">Cred &amp; Wallets</strong>
                        <span className="text-[10px] text-charcoal/60">Instant Checkout</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-md border border-emerald-300 text-xs text-charcoal/80 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Instant Verification &amp; Pass Issuance</span>
                    </div>
                    <p className="text-[11px] text-charcoal/70 leading-relaxed">
                      No screenshot or UTR entry needed! Proceed to Section E to review declarations. Submitting the form will immediately open the secure Cashfree checkout interface for ₹1,098.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL UTR VIEW */}
            {paymentMethod === "MANUAL_UTR" && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid sm:grid-cols-2 gap-5 p-5 bg-navy text-warmwhite rounded-md border border-citrus/30 shadow-md">
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded text-charcoal">
                    <QRCodeSVG value={upiPayPayload} size={150} level="H" includeMargin />
                    <span className="text-[10px] text-charcoal/60 mt-1 font-mono">Scan ₹1,098 for 2 Passes</span>
                  </div>
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-citrus block">UPI ID</span>
                      <div className="mt-2 flex items-center justify-between p-2.5 bg-white/10 rounded">
                        <span className="font-mono text-xs">{upiId}</span>
                        <button
                          type="button"
                          onClick={copyToClipboard}
                          className="px-2.5 py-1 bg-citrus text-navy text-[10px] font-bold rounded uppercase cursor-pointer"
                        >
                          {copiedUpi ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs font-mono space-y-1 text-warmwhite/80 border-t border-white/10 pt-2">
                      <div className="flex justify-between"><span>2 Delegate Passes:</span><span>2 × ₹549</span></div>
                      <div className="flex justify-between text-citrus font-bold text-sm"><span>Total Payable:</span><span>₹1,098</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Transaction UTR / Reference ID <span className="text-crimson">*</span>
                    </label>
                    <input
                      type="text"
                      required={paymentMethod === "MANUAL_UTR"}
                      placeholder="12-digit UPI reference"
                      value={formData.transactionId}
                      onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                      Upload Payment Screenshot <span className="text-crimson">*</span> (Max 50MB)
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-charcoal/25 rounded-md p-4 text-center cursor-pointer bg-warmwhite hover:bg-white"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                        className="hidden"
                      />
                      {screenshotPreview ? (
                        <span className="text-xs text-navy font-bold truncate block">{fileName} (Uploaded)</span>
                      ) : (
                        <span className="text-xs text-charcoal/70 flex items-center justify-center gap-1.5">
                          <Upload className="w-4 h-4 text-citrus" /> Click to upload receipt
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => navigateTo("C")}
                className="inline-flex items-center justify-center gap-2 text-charcoal/70 hover:text-charcoal text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              {paymentMethod === "CASHFREE" ? (
                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => navigateTo("E")}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-charcoal/70 hover:text-navy px-3 py-2 order-2 sm:order-1"
                  >
                    <span>Declarations first →</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCashfreePaymentFirst}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3.5 rounded transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer w-full sm:w-auto text-center order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Opening Cashfree...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-citrus" />
                        <span>Pay ₹1,098 via Cashfree (Payment First, Then Continuation)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigateTo("E")}
                  className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-slate text-warmwhite text-xs font-bold uppercase tracking-widest py-3 px-6 rounded transition-all group shadow-sm cursor-pointer"
                >
                  <span>Proceed to Declarations</span>
                  <ArrowRight className="w-4 h-4 text-citrus group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* SECTION E */}
        {activeSection === "E" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 05 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <FileCheck2 className="w-6 h-6 text-citrus" />
                Section E — Declarations &amp; Confirmation
              </h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 p-4 bg-warmwhite rounded border border-charcoal/15 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.parentConsentBoth}
                  onChange={(e) => setFormData({ ...formData, parentConsentBoth: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-navy rounded shrink-0"
                />
                <span className="text-xs text-charcoal/80 leading-relaxed">
                  <strong>Parent/Guardian Consent:</strong> I confirm that the parents/guardians of both Delegate 1 ({formData.speaker1Name || "Speaker 1"}) and Delegate 2 ({formData.speaker2Name || "Speaker 2"}) are aware of and have given permission for participation in SHABD &amp; SOCH on 20 December 2026.
                </span>
              </label>

              <label className="flex items-start gap-3 p-4 bg-warmwhite rounded border border-charcoal/15 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.teamDeclaration}
                  onChange={(e) => setFormData({ ...formData, teamDeclaration: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-navy rounded shrink-0"
                />
                <span className="text-xs text-charcoal/80 leading-relaxed">
                  <strong>Team Declaration:</strong> We confirm that the information provided is accurate. We agree to adhere to the code of conduct, participate across rounds, and understand that stance allocation will be made by the organisers.
                </span>
              </label>
            </div>

            {/* Team Submission Summary Box */}
            <div className="p-4 bg-navy/5 border border-navy/20 rounded-lg text-xs space-y-1">
              <strong className="text-navy block uppercase tracking-wider text-[11px]">
                {paymentMethod === "CASHFREE"
                  ? "⚡ Instant Online Checkout via Cashfree (₹1,098)"
                  : "🏦 Manual Bank Transfer / UTR Verification"}
              </strong>
              <p className="text-charcoal/70">
                {paymentMethod === "CASHFREE"
                  ? "Submitting will immediately initiate Cashfree PG checkout where you can complete payment via UPI, Cards, or NetBanking. Both delegate passes will be verified and generated automatically."
                  : "Submitting will record your registration details and UTR number for verification by the Secretariat."}
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => navigateTo("D")}
                className="inline-flex items-center gap-2 text-charcoal/70 hover:text-charcoal text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-citrus hover:bg-citrus-hover text-navy text-xs sm:text-sm font-bold uppercase tracking-widest py-3.5 px-8 rounded shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    <span>
                      {paymentMethod === "CASHFREE"
                        ? "Opening Cashfree Gateway..."
                        : "Submitting Team Registration..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === "CASHFREE"
                        ? "Proceed to Cashfree Checkout (₹1,098)"
                        : "Submit Team Registration"}
                    </span>
                    {paymentMethod === "CASHFREE" ? (
                      <ArrowRight className="w-4 h-4" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
