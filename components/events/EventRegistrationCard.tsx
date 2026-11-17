"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import InstitutionalDatePicker from "@/components/ui/InstitutionalDatePicker";
import VichaarLogo from "@/components/VichaarLogo";
import {
  User,
  Calendar,
  School,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  CreditCard,
  FileText,
  Clock
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

interface EventRegistrationCardProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  tickets: TicketCategory[];
  eventStatus: string;
}

type SectionKey = "A" | "B" | "C" | "D" | "E";

export default function EventRegistrationCard({
  eventId,
  eventTitle,
  eventSlug,
  tickets,
  eventStatus
}: EventRegistrationCardProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>("A");

  // Form State
  const [formData, setFormData] = useState({
    // Section A: Personal & Academic Details
    fullName: "",
    dateOfBirth: "",
    currentClass: "",
    schoolName: "",
    city: "",
    email: "",
    whatsappNumber: "",
    guardianNameAndContact: "",

    // Section B: Debate Preferences
    stancePreference: "", // "FOR" | "AGAINST" | "No Preference"
    comfortableBothStances: "", // "Yes, absolutely." | "Yes, with preparation." | "I may need some guidance."
    previousExperience: "", // "Yes" | "No, this is my first time."
    whyParticipate: "",

    // Section C: Payment Details
    feePaid: "549",
    transactionId: "",
    paymentScreenshot: "", // Base64 data URI

    // Section D: Consent & Confirmation
    guardianConsent: false,
    participantDeclaration: false,

    // Section E: Additional Information
    foodAllergies: "No", // "Yes" | "No"
    allergiesSpecify: "",
    additionalInfo: ""
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loggedInParticipant, setLoggedInParticipant] = useState<any>(null);
  const [profileAutoFilled, setProfileAutoFilled] = useState(false);

  const applyProfileDetails = (user: any) => {
    if (!user) return;
    const formattedDob = user.dateOfBirth
      ? typeof user.dateOfBirth === "string"
        ? user.dateOfBirth.split("T")[0]
        : ""
      : "";

    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName || prev.fullName,
      email: user.email || prev.email,
      whatsappNumber: user.phone || prev.whatsappNumber,
      city: user.city || prev.city,
      schoolName: user.institution || prev.schoolName,
      currentClass: user.grade || prev.currentClass,
      dateOfBirth: formattedDob || prev.dateOfBirth,
      guardianNameAndContact:
        user.guardianName
          ? `${user.guardianName}${user.guardianPhone ? ` (${user.guardianPhone})` : ""}`
          : prev.guardianNameAndContact
    }));
    setProfileAutoFilled(true);
    setTimeout(() => setProfileAutoFilled(false), 4000);
  };

  // Auto-fill logged-in participant data if available
  useEffect(() => {
    async function loadMe() {
      try {
        const res = await fetch("/api/my-vichaar/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setLoggedInParticipant(data.user);
            const user = data.user;
            const formattedDob = user.dateOfBirth
              ? typeof user.dateOfBirth === "string"
                ? user.dateOfBirth.split("T")[0]
                : ""
              : "";

            setFormData((prev) => ({
              ...prev,
              fullName: prev.fullName || user.fullName || "",
              email: prev.email || user.email || "",
              whatsappNumber: prev.whatsappNumber || user.phone || "",
              city: prev.city || user.city || "",
              schoolName: prev.schoolName || user.institution || "",
              currentClass: prev.currentClass || user.grade || "",
              dateOfBirth: prev.dateOfBirth || formattedDob || "",
              guardianNameAndContact:
                prev.guardianNameAndContact ||
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

  const upiId = "thevichaarcouncil@okaxis";
  const upiPayPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=THE%20VICHAAR%20COUNCIL&am=549&cu=INR&tn=SHABD%20AND%20SOCH%20REGISTRATION`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file (PNG, JPG, or JPEG) of your payment screenshot.");
      return;
    }

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

  // Section Validation Helpers
  const validateSectionA = () => {
    if (
      !formData.fullName.trim() ||
      !formData.dateOfBirth ||
      !formData.currentClass ||
      !formData.schoolName.trim() ||
      !formData.city.trim() ||
      !formData.email.trim() ||
      !formData.whatsappNumber.trim() ||
      !formData.guardianNameAndContact.trim()
    ) {
      setErrorMessage("Please complete all required fields (1 to 8) in Section A.");
      return false;
    }
    if (!formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    return true;
  };

  const validateSectionB = () => {
    if (
      !formData.stancePreference ||
      !formData.comfortableBothStances ||
      !formData.previousExperience ||
      !formData.whyParticipate.trim()
    ) {
      setErrorMessage("Please answer all questions (9 to 12) in Section B.");
      return false;
    }
    return true;
  };

  const validateSectionC = () => {
    if (!formData.transactionId.trim()) {
      setErrorMessage("Please enter your Transaction ID / UTR Number in Question 14.");
      return false;
    }
    if (!formData.paymentScreenshot) {
      setErrorMessage("Please upload a payment screenshot in Question 15 to proceed.");
      return false;
    }
    return true;
  };

  const validateSectionD = () => {
    if (!formData.guardianConsent || !formData.participantDeclaration) {
      setErrorMessage("Both Parent/Guardian Consent (Q16) and Participant Declaration (Q17) are mandatory.");
      return false;
    }
    return true;
  };

  const navigateTo = (section: SectionKey) => {
    setErrorMessage("");
    // Validate prior steps before advancing
    if (section === "B" && !validateSectionA()) return;
    if (section === "C" && (!validateSectionA() || !validateSectionB())) return;
    if (section === "D" && (!validateSectionA() || !validateSectionB() || !validateSectionC())) return;
    if (section === "E" && (!validateSectionA() || !validateSectionB() || !validateSectionC() || !validateSectionD())) return;
    setActiveSection(section);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateSectionA()) {
      setActiveSection("A");
      return;
    }
    if (!validateSectionB()) {
      setActiveSection("B");
      return;
    }
    if (!validateSectionC()) {
      setActiveSection("C");
      return;
    }
    if (!validateSectionD()) {
      setActiveSection("D");
      return;
    }

    if (formData.foodAllergies === "Yes" && !formData.allergiesSpecify.trim()) {
      setErrorMessage("Please specify your food allergies in Question 19.");
      setActiveSection("E");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        eventId,
        eventSlug,
        ticketCategoryId: tickets[0]?.id || undefined,
        ...formData,
        feePaid: Number(formData.feePaid) || 549
      };

      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit registration. Please verify details and try again.");
      }

      // Successful submission -> redirect to confirmation page
      const confirmationUrl = `/events/${eventSlug}/confirmation?reg_no=${encodeURIComponent(
        data.registrationNumber
      )}&order_id=${encodeURIComponent(data.orderId || "")}&status=pending&name=${encodeURIComponent(
        formData.fullName
      )}&amount=549&utr=${encodeURIComponent(formData.transactionId)}`;

      router.push(confirmationUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please contact the Secretariat.");
      setIsSubmitting(false);
    }
  };

  const sections: { key: SectionKey; label: string; number: string }[] = [
    { key: "A", label: "Personal & Academic", number: "01" },
    { key: "B", label: "Debate Preferences", number: "02" },
    { key: "C", label: "Payment Details", number: "03" },
    { key: "D", label: "Consent & Declaration", number: "04" },
    { key: "E", label: "Additional Info", number: "05" }
  ];

  return (
    <div className="border border-charcoal/20 bg-white rounded-md shadow-xl overflow-hidden font-sans">
      {/* Institutional Top Brand Header */}
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
                THE VICHAAR COUNCIL · OFFICIAL ACCREDITATION
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white">
                SHABD &amp; SOCH
              </h2>
            </div>
          </div>
          <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded border border-white/10 sm:border-none">
            <span className="inline-block px-3 py-1 bg-crimson text-white text-[10px] font-bold tracking-widest uppercase rounded-xs">
              INDIVIDUAL REGISTRATION
            </span>
            <span className="text-xs text-warmwhite/80 block mt-1 font-mono">
              20 December 2026 · Classes 7–12
            </span>
          </div>
        </div>

        {/* Form Description */}
        <div className="mt-5 pt-5 border-t border-white/10 text-xs sm:text-sm text-warmwhite/90 leading-relaxed space-y-2">
          <p className="font-medium text-citrus">
            Welcome to SHABD &amp; SOCH! A Debate &amp; Social Experience organised by The Vichaar Council.
          </p>
          <p className="text-warmwhite/75 text-xs">
            Get ready to express your opinions, challenge perspectives and experience debating like never before.
            This form is for individual participants. Please provide accurate information. Your registration will be
            confirmed after payment verification by the organising team.
          </p>
        </div>
      </div>

      {/* Section Progress Stepper Tabs */}
      <div className="bg-warmwhite border-b border-charcoal/15 px-3 sm:px-6 py-3 overflow-x-auto scrollbar-none">
        {/* Mobile Step Indicator */}
        <div className="flex sm:hidden items-center justify-between gap-2 text-xs mb-2.5 px-1">
          <div className="flex items-center gap-1.5 font-bold text-navy">
            <span className="w-5 h-5 rounded-full bg-navy text-citrus flex items-center justify-center text-[10px] font-bold">
              {activeSection}
            </span>
            <span className="text-[11px] uppercase tracking-wider text-charcoal">
              {sections.find((s) => s.key === activeSection)?.label}
            </span>
          </div>
          <span className="text-[10px] text-charcoal/60 font-mono">
            Step {sections.findIndex((s) => s.key === activeSection) + 1} of 5
          </span>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 sm:justify-between min-w-[500px] sm:min-w-0">
          {sections.map((sec, idx) => {
            const isActive = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => navigateTo(sec.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-navy text-citrus shadow-sm"
                    : "text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
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

      {/* Participant Profile Status & Auto-Fill Accreditation Banner */}
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
                    Active Participant Profile
                  </span>
                  <span className="text-xs font-mono font-bold text-navy">
                    @{loggedInParticipant.username}
                  </span>
                </div>
                <p className="text-xs text-charcoal/80 font-medium mt-1">
                  Connected as <strong className="text-navy">{loggedInParticipant.fullName}</strong>. Your official digital delegate pass with QR, attendance docket, and verifiable certificates will be automatically issued to this account.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => applyProfileDetails(loggedInParticipant)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-navy hover:bg-navy/90 text-citrus font-bold text-xs uppercase tracking-wider transition-all shrink-0 shadow-xs cursor-pointer"
            >
              {profileAutoFilled ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Profile Applied!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-citrus" />
                  <span>Auto-Fill From Profile</span>
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
                    Profile Required for Certificates &amp; Passes
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-charcoal">
                  Register with your My Vichaar Profile
                </h4>
                <p className="text-xs text-charcoal/75 leading-relaxed">
                  A participant profile is required so your official delegate pass, QR check-in credentials, and verifiable certificate of participation can be authenticated and permanently linked to you.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <Link
                href={`/my-vichaar/login?redirect=${encodeURIComponent(`/events/${eventSlug}/register?type=individual`)}`}
                className="px-3.5 py-2 rounded-lg bg-navy hover:bg-navy/90 text-citrus text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
              >
                Sign In &amp; Auto-Fill
              </Link>
              <Link
                href={`/my-vichaar/register?redirect=${encodeURIComponent(`/events/${eventSlug}/register?type=individual`)}`}
                className="px-3.5 py-2 rounded-lg border border-charcoal/20 bg-white hover:bg-charcoal/5 text-charcoal text-xs font-bold uppercase tracking-wider transition-all"
              >
                Create Free Profile
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Error Message Alert */}
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
        {/* ========================================================================= */}
        {/* SECTION A — Personal & Academic Details */}
        {/* ========================================================================= */}
        {activeSection === "A" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 01 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal">
                Section A — Personal &amp; Academic Details
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                All fields marked with an asterisk (<span className="text-crimson font-bold">*</span>) are mandatory.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Question 1: Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  1. Full Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 2: Date of Birth */}
              <div>
                <InstitutionalDatePicker
                  label="2. Date of Birth"
                  required
                  value={formData.dateOfBirth}
                  onChange={(val) => setFormData({ ...formData, dateOfBirth: val })}
                  placeholder="Select Date of Birth (YYYY-MM-DD)"
                  minYear={2003}
                  maxYear={2015}
                  theme="light"
                />
              </div>

              {/* Question 3: Current Class */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  3. Current Class <span className="text-crimson">*</span>
                </label>
                <select
                  required
                  value={formData.currentClass}
                  onChange={(e) => setFormData({ ...formData, currentClass: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                >
                  <option value="">Select Class (7–12)</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              {/* Question 4: School Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  4. School Name <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern School, Barakhamba Road"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 5: City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  5. City <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 6: Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  6. Email Address <span className="text-crimson">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. participant@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 7: WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  7. WhatsApp Number <span className="text-crimson">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 8: Parent/Guardian Name and Contact Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  8. Parent/Guardian Name &amp; Contact Number <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Sharma, +91 98111 22233"
                  value={formData.guardianNameAndContact}
                  onChange={(e) => setFormData({ ...formData, guardianNameAndContact: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>
            </div>

            {/* Navigation Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => navigateTo("B")}
                className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-citrus font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded transition-all shadow-sm w-full sm:w-auto text-center"
              >
                <span>Proceed to Debate Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION B — Debate Preferences */}
        {/* ========================================================================= */}
        {activeSection === "B" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 02 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal">
                Section B — Debate Preferences
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Help the Academic Committee curate balanced debate brackets and motions.
              </p>
            </div>

            {/* Question 9: Original Stance Preference */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                9. For Round 1 – Original Stance, which position would you prefer?{" "}
                <span className="text-crimson">*</span>
              </label>
              <div className="grid gap-2 sm:grid-cols-3">
                {["FOR", "AGAINST", "No Preference"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3.5 rounded border cursor-pointer text-xs font-semibold transition-all ${
                      formData.stancePreference === opt
                        ? "border-navy bg-navy/5 text-navy ring-1 ring-navy"
                        : "border-charcoal/20 bg-warmwhite text-charcoal hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="stancePreference"
                      value={opt}
                      checked={formData.stancePreference === opt}
                      onChange={(e) => setFormData({ ...formData, stancePreference: e.target.value })}
                      className="accent-navy"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 10: Comfortable with both stances */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                10. Are you comfortable arguing both FOR and AGAINST a motion during the two rounds?{" "}
                <span className="text-crimson">*</span>
              </label>
              <div className="space-y-2">
                {[
                  "Yes, absolutely.",
                  "Yes, with preparation.",
                  "I may need some guidance."
                ].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded border cursor-pointer text-xs font-semibold transition-all ${
                      formData.comfortableBothStances === opt
                        ? "border-navy bg-navy/5 text-navy ring-1 ring-navy"
                        : "border-charcoal/20 bg-warmwhite text-charcoal hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="comfortableBothStances"
                      value={opt}
                      checked={formData.comfortableBothStances === opt}
                      onChange={(e) => setFormData({ ...formData, comfortableBothStances: e.target.value })}
                      className="accent-navy"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 11: Previous Experience */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                11. Have you participated in debates, MUNs or public-speaking events before?{" "}
                <span className="text-crimson">*</span>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {["Yes", "No, this is my first time."].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3.5 rounded border cursor-pointer text-xs font-semibold transition-all ${
                      formData.previousExperience === opt
                        ? "border-navy bg-navy/5 text-navy ring-1 ring-navy"
                        : "border-charcoal/20 bg-warmwhite text-charcoal hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="previousExperience"
                      value={opt}
                      checked={formData.previousExperience === opt}
                      onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                      className="accent-navy"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 12: Why participate */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                12. Why do you want to participate in SHABD &amp; SOCH?{" "}
                <span className="text-crimson">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Share your motivation, what you hope to experience, or your passion for public discourse..."
                value={formData.whyParticipate}
                onChange={(e) => setFormData({ ...formData, whyParticipate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all leading-relaxed"
              />
            </div>

            {/* Important Note */}
            <div className="p-3.5 bg-amber-50 border border-citrus/40 rounded text-xs text-amber-900 flex items-start gap-2.5">
              <span className="text-citrus font-bold text-sm">ℹ️</span>
              <p>
                <strong>Important:</strong> Your preferred stance is only a preference. Final allocation will be decided
                by The Vichaar Council.
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveSection("A")}
                className="inline-flex items-center justify-center gap-2 text-charcoal/70 hover:text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-3 rounded border border-charcoal/10 sm:border-transparent hover:bg-charcoal/5 transition-colors w-full sm:w-auto text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Section A</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo("C")}
                className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-citrus font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded transition-all shadow-sm w-full sm:w-auto text-center"
              >
                <span>Proceed to Payment Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION C — Payment Details */}
        {/* ========================================================================= */}
        {activeSection === "C" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 03 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal">
                Section C — Payment Details
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Scan the official Council UPI QR code below or transfer directly to the UPI ID.
              </p>
            </div>

            {/* Payment Showcase Box */}
            <div className="border-2 border-citrus/50 bg-[#FAF9F5] p-5 sm:p-6 rounded-md space-y-5">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-charcoal/15 shadow-sm text-center">
                  <div className="p-2 bg-white rounded border border-charcoal/10">
                    <QRCodeSVG
                      value={upiPayPayload}
                      size={148}
                      level="H"
                      includeMargin={false}
                      imageSettings={{
                        src: "/assets/vichaar-logo.png",
                        height: 28,
                        width: 28,
                        excavate: true
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-charcoal mt-2 uppercase tracking-wider">
                    SCAN VIA ANY UPI APP
                  </span>
                  <span className="text-[9px] text-charcoal/60">GPay · PhonePe · Paytm · BHIM</span>
                </div>

                {/* Details & Copy Button */}
                <div className="flex-1 space-y-3 text-xs w-full">
                  <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                    <span className="text-charcoal/60 font-semibold uppercase text-[10px]">Event Pass</span>
                    <span className="font-bold text-charcoal">SHABD &amp; SOCH Delegate Admission</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                    <span className="text-charcoal/60 font-semibold uppercase text-[10px]">Payable Amount</span>
                    <span className="font-editorial text-2xl font-bold text-crimson">₹549</span>
                  </div>
                  <div>
                    <span className="text-charcoal/60 font-semibold uppercase text-[10px] block mb-1">
                      Official UPI ID
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white px-3 py-2 border border-charcoal/20 rounded font-mono text-xs sm:text-sm font-bold text-navy flex-1 select-all">
                        {upiId}
                      </code>
                      <button
                        type="button"
                        onClick={copyToClipboard}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-navy hover:bg-navy/90 text-citrus text-xs font-bold uppercase rounded transition-colors"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Deep Link */}
                  <div className="pt-1">
                    <a
                      href={upiPayPayload}
                      className="inline-block text-[11px] font-bold text-navy hover:text-crimson underline tracking-wider uppercase sm:hidden"
                    >
                      📱 Tap here to open directly in UPI App
                    </a>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="border-t border-charcoal/10 pt-3 text-[11px] text-charcoal/80 space-y-1">
                <span className="font-bold uppercase tracking-wider text-charcoal block">Payment Instructions:</span>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Scan the QR code above or enter the UPI ID <code>{upiId}</code> in your banking app.</li>
                  <li>Pay the delegate fee of <strong>₹549</strong>.</li>
                  <li>Note down the 12-digit UTR Number / Transaction ID and take a screenshot of the payment receipt.</li>
                </ol>
              </div>
            </div>

            {/* Question 13: Registration Fee Paid (₹) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                13. Registration Fee Paid (₹) <span className="text-crimson">*</span>
              </label>
              <input
                type="text"
                readOnly
                value={formData.feePaid}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-charcoal/5 font-mono font-bold text-charcoal cursor-not-allowed"
              />
            </div>

            {/* Question 14: Transaction ID / UTR Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                14. Transaction ID / UTR Number <span className="text-crimson">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 432109876543 (12-digit UTR / Reference ID)"
                value={formData.transactionId}
                onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy font-mono transition-all"
              />
              <span className="text-[10px] text-charcoal/60 mt-1 block">
                Found in your payment receipt on GPay, PhonePe, Paytm, or bank SMS.
              </span>
            </div>

            {/* Question 15: Upload Payment Screenshot */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                15. Upload Payment Screenshot <span className="text-crimson">*</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-charcoal/25 hover:border-navy bg-warmwhite hover:bg-white p-6 rounded-md cursor-pointer transition-all text-center flex flex-col items-center justify-center space-y-2 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-navy/5 group-hover:bg-navy/10 flex items-center justify-center text-navy transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-navy group-hover:underline block">
                    {fileName ? "Change Selected Image" : "Click to Upload or Drag & Drop"}
                  </span>
                  <span className="text-[10px] text-charcoal/60">
                    PNG, JPG, or JPEG up to 50MB
                  </span>
                </div>
              </div>

              {/* Preview */}
              {screenshotPreview && (
                <div className="mt-3 p-3 bg-white border border-charcoal/15 rounded flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded overflow-hidden border border-charcoal/10 shrink-0 bg-charcoal/5">
                    <img
                      src={screenshotPreview}
                      alt="Payment Screenshot Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-charcoal truncate block">{fileName || "Screenshot Attached"}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Image attached successfully
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotPreview(null);
                      setFileName("");
                      setFormData((prev) => ({ ...prev, paymentScreenshot: "" }));
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs text-crimson hover:underline font-semibold px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveSection("B")}
                className="inline-flex items-center justify-center gap-2 text-charcoal/70 hover:text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-3 rounded border border-charcoal/10 sm:border-transparent hover:bg-charcoal/5 transition-colors w-full sm:w-auto text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Section B</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo("D")}
                className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-citrus font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded transition-all shadow-sm w-full sm:w-auto text-center"
              >
                <span>Proceed to Consent &amp; Declaration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION D — Consent & Confirmation */}
        {/* ========================================================================= */}
        {activeSection === "D" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 04 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal">
                Section D — Consent &amp; Confirmation
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Both affirmations are required for individual student accreditation under Council regulations.
              </p>
            </div>

            {/* Question 16: Parent/Guardian Consent */}
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                16. Parent/Guardian Consent <span className="text-crimson">*</span>
              </span>
              <label
                className={`flex items-start gap-3.5 p-4 rounded-md border cursor-pointer transition-all ${
                  formData.guardianConsent
                    ? "border-navy bg-navy/5 ring-1 ring-navy text-navy"
                    : "border-charcoal/20 bg-warmwhite text-charcoal hover:bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  required
                  checked={formData.guardianConsent}
                  onChange={(e) => setFormData({ ...formData, guardianConsent: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-charcoal/30 accent-navy"
                />
                <span className="text-xs sm:text-sm leading-relaxed">
                  I confirm that my parent/guardian is aware of my participation in SHABD &amp; SOCH on 20 December 2026
                  and has given permission for the same.
                </span>
              </label>
            </div>

            {/* Question 17: Participant Declaration */}
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                17. Participant Declaration <span className="text-crimson">*</span>
              </span>
              <label
                className={`flex items-start gap-3.5 p-4 rounded-md border cursor-pointer transition-all ${
                  formData.participantDeclaration
                    ? "border-navy bg-navy/5 ring-1 ring-navy text-navy"
                    : "border-charcoal/20 bg-warmwhite text-charcoal hover:bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  required
                  checked={formData.participantDeclaration}
                  onChange={(e) => setFormData({ ...formData, participantDeclaration: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-charcoal/30 accent-navy"
                />
                <span className="text-xs sm:text-sm leading-relaxed">
                  I confirm that the information provided is accurate. I agree to follow the event rules, maintain
                  respectful conduct and participate in both Original Stance and Flipped Stance rounds. I understand that
                  the final stance allocation will be made by the organisers.
                </span>
              </label>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveSection("C")}
                className="inline-flex items-center justify-center gap-2 text-charcoal/70 hover:text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-3 rounded border border-charcoal/10 sm:border-transparent hover:bg-charcoal/5 transition-colors w-full sm:w-auto text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Section C</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo("E")}
                className="inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-citrus font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded transition-all shadow-sm w-full sm:w-auto text-center"
              >
                <span>Proceed to Additional Information</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION E — Additional Information & Final Submission */}
        {/* ========================================================================= */}
        {activeSection === "E" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 05 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal">
                Section E — Additional Information
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Final logistical preferences for dietary accommodation and special notes.
              </p>
            </div>

            {/* Question 18: Food allergies or dietary requirements */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                18. Do you have any food allergies or dietary requirements?{" "}
                <span className="text-crimson">*</span>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {["No", "Yes"].map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3.5 rounded border cursor-pointer text-xs font-semibold transition-all ${
                      formData.foodAllergies === opt
                        ? "border-navy bg-navy/5 text-navy ring-1 ring-navy"
                        : "border-charcoal/20 bg-warmwhite text-charcoal hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="foodAllergies"
                      value={opt}
                      checked={formData.foodAllergies === opt}
                      onChange={(e) => setFormData({ ...formData, foodAllergies: e.target.value })}
                      className="accent-navy"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question 19: If yes, please specify */}
            {formData.foodAllergies === "Yes" && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                  19. If yes, please specify <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Peanut allergy, lactose intolerant, vegan, gluten-free"
                  value={formData.allergiesSpecify}
                  onChange={(e) => setFormData({ ...formData, allergiesSpecify: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>
            )}

            {/* Additional information: Question 19 (if No) or Question 20 (if Yes) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                {formData.foodAllergies === "Yes" ? "20." : "19."} Any additional information you would like to share with the organising team?{" "}
                <span className="text-charcoal/50 text-[10px] uppercase font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Accessibility requirements, travel constraints, or questions for our Secretariat..."
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all leading-relaxed"
              />
            </div>

            {/* Final Submission Card */}
            <div className="border border-charcoal/15 bg-[#FAF9F5] p-5 rounded-md space-y-3">
              <div className="flex items-center gap-2 text-navy font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-citrus" />
                <span>Ready to Submit Application</span>
              </div>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                By clicking <strong>Submit Registration &amp; Verify UTR</strong>, your delegate profile and payment
                receipt will be recorded in the Council Assembly Master Database. Instant acknowledgement will be displayed
                on screen and dispatched to <strong>{formData.email || "your email"}</strong>.
              </p>
            </div>

            {/* Navigation & Submit Buttons */}
            <div className="pt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActiveSection("D")}
                className="inline-flex items-center justify-center gap-2 text-charcoal/70 hover:text-charcoal font-bold text-xs uppercase tracking-wider px-4 py-3 rounded border border-charcoal/10 sm:border-transparent hover:bg-charcoal/5 transition-colors w-full sm:w-auto text-center"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Section D</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2.5 bg-citrus hover:bg-citrus-hover text-ink font-display font-bold text-xs sm:text-sm uppercase tracking-wider px-8 py-3.5 rounded transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto text-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Accreditation...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Registration &amp; Verify UTR</span>
                    <CheckCircle2 className="w-4 h-4" />
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
