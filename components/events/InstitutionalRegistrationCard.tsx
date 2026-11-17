"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VichaarLogo from "@/components/VichaarLogo";
import { initiateCashfreePayment } from "@/lib/cashfreeClient";
import { QRCodeSVG } from "qrcode.react";
import {
  Building2,
  UserCheck,
  Users,
  CreditCard,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  FileText,
  Clock,
  ShieldCheck,
  Plus
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

interface InstitutionalRegistrationCardProps {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  tickets: TicketCategory[];
  eventStatus: string;
}

type SectionKey = "A" | "B" | "C" | "D" | "E";

const CLASSES_LIST = ["Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

const SCHOOL_BOARDS = [
  "CBSE (Central Board of Secondary Education)",
  "ICSE / ISC (Council for the Indian School Certificate Examinations)",
  "IB (International Baccalaureate)",
  "Cambridge / IGCSE",
  "State Board",
  "Other / Autonomous"
];

export default function InstitutionalRegistrationCard({
  eventId,
  eventTitle,
  eventSlug,
  tickets,
  eventStatus
}: InstitutionalRegistrationCardProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>("A");

  // Form State
  const [formData, setFormData] = useState({
    // Section A: Institutional Information
    schoolName: "",
    schoolAddress: "",
    city: "",
    schoolBoard: "",
    officialSchoolEmail: "",
    schoolWebsite: "",

    // Section B: Authorised Representative
    coordinatorName: "",
    coordinatorDesignation: "",
    coordinatorEmail: "",
    coordinatorPhone: "",

    // Section C: Participation Details
    totalStudents: "5",
    classesRepresented: [] as string[],
    studentRoster: "",
    participationMode: "Individual Participation", // Individual Participation | Team Participation | Both Individual and Team Participation
    stancePreference: "No Preference", // FOR | AGAINST | No Preference

    // Section D: Consolidated Payment
    feePaid: "2745", // default 5 * 549
    transactionId: "",
    paymentScreenshot: "", // Base64 or URL

    // Section E: Declaration & Notes
    declarationConfirmed: false,
    additionalRequests: ""
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASHFREE" | "MANUAL_UTR">("CASHFREE");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const perStudentFee = tickets[0]?.price || 549;
  const upiId = "9116502522@ptsbi";

  // Dynamic fee recalculation when totalStudents changes
  const handleStudentCountChange = (countStr: string) => {
    const count = parseInt(countStr, 10);
    setFormData((prev) => {
      const validCount = isNaN(count) || count < 1 ? 1 : count;
      return {
        ...prev,
        totalStudents: countStr,
        feePaid: String(validCount * perStudentFee)
      };
    });
  };

  const handleClassToggle = (className: string) => {
    setFormData((prev) => {
      const exists = prev.classesRepresented.includes(className);
      const updated = exists
        ? prev.classesRepresented.filter((c) => c !== className)
        : [...prev.classesRepresented, className];
      return { ...prev, classesRepresented: updated };
    });
  };

  const insertRosterTemplate = () => {
    const template =
      `1. Full Name: \n   Class: \n   Email: \n   WhatsApp: \n   Parent Contact: \n\n` +
      `2. Full Name: \n   Class: \n   Email: \n   WhatsApp: \n   Parent Contact: \n\n` +
      `3. Full Name: \n   Class: \n   Email: \n   WhatsApp: \n   Parent Contact: `;
    setFormData((prev) => ({
      ...prev,
      studentRoster: prev.studentRoster ? prev.studentRoster + "\n\n" + template : template
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // 50MB File Upload Handling
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

  // Section Validations
  const validateSectionA = () => {
    if (
      !formData.schoolName.trim() ||
      !formData.schoolAddress.trim() ||
      !formData.city.trim() ||
      !formData.officialSchoolEmail.trim()
    ) {
      setErrorMessage("Please complete all required fields (Questions 1, 2, 3 and 5) in Section A.");
      return false;
    }
    if (!formData.officialSchoolEmail.includes("@")) {
      setErrorMessage("Please enter a valid school email address.");
      return false;
    }
    return true;
  };

  const validateSectionB = () => {
    if (
      !formData.coordinatorName.trim() ||
      !formData.coordinatorDesignation.trim() ||
      !formData.coordinatorEmail.trim() ||
      !formData.coordinatorPhone.trim()
    ) {
      setErrorMessage("Please complete all Coordinator Details (Questions 7 to 10) in Section B.");
      return false;
    }
    if (!formData.coordinatorEmail.includes("@")) {
      setErrorMessage("Please enter a valid official email for the coordinator.");
      return false;
    }
    return true;
  };

  const validateSectionC = () => {
    const count = parseInt(formData.totalStudents, 10);
    if (isNaN(count) || count < 1) {
      setErrorMessage("Please enter a valid number of students in Question 11 (minimum 1).");
      return false;
    }
    if (formData.classesRepresented.length === 0) {
      setErrorMessage("Please select at least one Class Represented in Question 12.");
      return false;
    }
    if (!formData.studentRoster.trim() || formData.studentRoster.trim().length < 10) {
      setErrorMessage("Please provide the participating student names, classes and contacts in Question 13.");
      return false;
    }
    if (!formData.participationMode) {
      setErrorMessage("Please select participation mode in Question 14.");
      return false;
    }
    if (!formData.stancePreference) {
      setErrorMessage("Please select preferred stance allocation in Question 15.");
      return false;
    }
    return true;
  };

  const validateSectionD = () => {
    if (paymentMethod === "MANUAL_UTR") {
      if (!formData.transactionId.trim()) {
        setErrorMessage("Please enter the Transaction ID / UTR Number in Question 17.");
        return false;
      }
      if (!formData.paymentScreenshot) {
        setErrorMessage("Please upload the consolidated payment screenshot in Question 18.");
        return false;
      }
    }
    return true;
  };

  const validateSectionE = () => {
    if (!formData.declarationConfirmed) {
      setErrorMessage("The Authorised Representative Declaration (Question 19) is required.");
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
      const calculatedAmount = (parseInt(formData.totalStudents, 10) || 1) * perStudentFee;
      const payableAmount = Number(formData.feePaid) || calculatedAmount;

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          eventSlug,
          ticketCategoryId: tickets[0]?.id || undefined,
          fullName: formData.schoolName,
          email: formData.coordinatorEmail || formData.officialSchoolEmail,
          phone: formData.coordinatorPhone,
          city: formData.city,
          institution: formData.schoolName,
          amount: payableAmount,
          notes: {
            ...formData,
            declarationConfirmed: true,
            channel: "INSTITUTIONAL",
            paymentMethod: "CASHFREE_ONLINE",
            submittedAt: new Date().toISOString()
          }
        })
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.paymentSessionId) {
        throw new Error(orderData.error || "Failed to initialize secure Cashfree payment session for delegation.");
      }

      await initiateCashfreePayment({
        paymentSessionId: orderData.paymentSessionId,
        mode: "production",
        redirectTarget: "_self"
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to initiate institutional payment.");
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
      const calculatedAmount = (parseInt(formData.totalStudents, 10) || 1) * perStudentFee;
      const payableAmount = Number(formData.feePaid) || calculatedAmount;

      if (paymentMethod === "CASHFREE") {
        // Create Cashfree Order for Institutional Delegation
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId,
            eventSlug,
            ticketCategoryId: tickets[0]?.id || undefined,
            fullName: formData.schoolName,
            email: formData.coordinatorEmail || formData.officialSchoolEmail,
            phone: formData.coordinatorPhone,
            city: formData.city,
            institution: formData.schoolName,
            amount: payableAmount,
            notes: {
              ...formData,
              channel: "INSTITUTIONAL",
              paymentMethod: "CASHFREE_ONLINE",
              submittedAt: new Date().toISOString()
            }
          })
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.paymentSessionId) {
          throw new Error(orderData.error || "Failed to initialize secure Cashfree payment session for delegation.");
        }

        // Launch Cashfree PG Checkout
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
        ...formData,
        totalStudents: parseInt(formData.totalStudents, 10) || 1,
        feePaid: payableAmount
      };

      const res = await fetch("/api/events/register-institutional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit institutional registration. Please review and try again.");
      }

      // Successful submission -> redirect to confirmation
      const confirmationUrl = `/events/${eventSlug}/confirmation?reg_no=${encodeURIComponent(
        data.registrationNumber
      )}&order_id=${encodeURIComponent(data.orderId || "")}&status=pending&name=${encodeURIComponent(
        formData.schoolName
      )}&amount=${encodeURIComponent(payableAmount)}&utr=${encodeURIComponent(
        formData.transactionId
      )}&channel=institutional`;

      router.push(confirmationUrl);
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please contact the Secretariat.");
      setIsSubmitting(false);
    }
  };

  const sections: { key: SectionKey; label: string; number: string }[] = [
    { key: "A", label: "School Details", number: "01" },
    { key: "B", label: "Coordinator", number: "02" },
    { key: "C", label: "Students Roster", number: "03" },
    { key: "D", label: "Consolidated Payment", number: "04" },
    { key: "E", label: "Declaration", number: "05" }
  ];

  const calculatedTotalAmount = (parseInt(formData.totalStudents, 10) || 1) * perStudentFee;
  const upiPayPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=THE%20VICHAAR%20COUNCIL&am=${encodeURIComponent(
    formData.feePaid || calculatedTotalAmount
  )}&cu=INR&tn=SHABD%20AND%20SOCH%20INSTITUTIONAL%20REGISTRATION`;

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
                THE VICHAAR COUNCIL · INSTITUTIONAL ACCREDITATION
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-white">
                SHABD &amp; SOCH
              </h2>
            </div>
          </div>
          <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded border border-white/10 sm:border-none">
            <span className="inline-block px-3 py-1 bg-citrus text-navy text-[10px] font-bold tracking-widest uppercase rounded-xs">
              INSTITUTIONAL REGISTRATION
            </span>
            <span className="text-xs text-warmwhite/80 block mt-1 font-mono">
              20 December 2026 · Udaipur
            </span>
          </div>
        </div>

        {/* Form Description */}
        <div className="mt-5 pt-5 border-t border-white/10 text-xs sm:text-sm text-warmwhite/90 leading-relaxed space-y-2">
          <p className="font-medium text-citrus">
            Greetings from The Vichaar Council!
          </p>
          <p className="text-warmwhite/85 text-xs sm:text-[13px] leading-relaxed">
            <strong>SHABD &amp; SOCH</strong> is a Debate &amp; Social Experience scheduled for <strong>20 December 2026 in Udaipur</strong>,
            bringing together students from <strong>Classes 7–12</strong>.
          </p>
          <p className="text-warmwhite/75 text-xs leading-relaxed">
            This form is intended for schools and educational institutions wishing to register multiple students through a single institutional representative.
            The authorised school representative or faculty coordinator is requested to provide the institution&apos;s details and the information of all participating students.
            Each participant will be required to follow event guidelines and complete any additional individual information or consent requirements communicated by the organising team.
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
          {sections.map((sec) => {
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
        {/* SECTION A — Institutional Information */}
        {/* ========================================================================= */}
        {activeSection === "A" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3 flex items-center justify-between">
              <div>
                <span className="eyebrow text-crimson block text-[10px]">Step 01 of 05</span>
                <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-citrus" />
                  Section A — Institutional Information
                </h3>
                <p className="text-xs text-charcoal/60 mt-1">
                  Institution details and official accreditation data. (<span className="text-crimson font-bold">*</span> = required)
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Question 1: Name of School / Institution */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  1. Name of School / Institution <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Xavier's Senior Secondary School"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 2: Complete School Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  2. Complete School Address <span className="text-crimson">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Street Address, Campus Area, Locality, Pincode"
                  value={formData.schoolAddress}
                  onChange={(e) => setFormData({ ...formData, schoolAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all resize-none"
                />
              </div>

              {/* Question 3: City */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  3. City <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Udaipur, Jaipur, New Delhi"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 4: School Board */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  4. School Board <span className="text-charcoal/50 text-[10px] font-normal">(Optional)</span>
                </label>
                <select
                  value={formData.schoolBoard}
                  onChange={(e) => setFormData({ ...formData, schoolBoard: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                >
                  <option value="">Select Affiliated Board</option>
                  {SCHOOL_BOARDS.map((board) => (
                    <option key={board} value={board}>
                      {board}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question 5: Official School Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  5. Official School Email Address <span className="text-crimson">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="principal@school.edu.in or info@school.com"
                  value={formData.officialSchoolEmail}
                  onChange={(e) => setFormData({ ...formData, officialSchoolEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 6: School Website */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  6. School Website <span className="text-charcoal/50 text-[10px] font-normal">(if available)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://www.yourschool.edu.in"
                  value={formData.schoolWebsite}
                  onChange={(e) => setFormData({ ...formData, schoolWebsite: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-charcoal/10">
              <button
                type="button"
                onClick={() => navigateTo("B")}
                className="inline-flex items-center gap-2 bg-navy hover:bg-slate text-warmwhite text-xs font-bold uppercase tracking-widest py-3 px-6 rounded transition-all group shadow-sm"
              >
                <span>Proceed to Section B</span>
                <ArrowRight className="w-4 h-4 text-citrus group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION B — Authorised Representative */}
        {/* ========================================================================= */}
        {activeSection === "B" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 02 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-citrus" />
                Section B — Authorised Representative
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Details of the faculty coordinator or school teacher-in-charge responsible for this delegation.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Question 7: Coordinator Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  7. Name of Faculty Coordinator / School Representative <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Meenakshi Sharma"
                  value={formData.coordinatorName}
                  onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 8: Designation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  8. Designation <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Head of Humanities / Debate Club Coordinator"
                  value={formData.coordinatorDesignation}
                  onChange={(e) => setFormData({ ...formData, coordinatorDesignation: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 9: Official Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  9. Official Email Address <span className="text-crimson">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="coordinator@school.edu.in"
                  value={formData.coordinatorEmail}
                  onChange={(e) => setFormData({ ...formData, coordinatorEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                />
              </div>

              {/* Question 10: Contact / WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  10. Contact / WhatsApp Number <span className="text-crimson">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.coordinatorPhone}
                  onChange={(e) => setFormData({ ...formData, coordinatorPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
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

        {/* ========================================================================= */}
        {/* SECTION C — Participation Details */}
        {/* ========================================================================= */}
        {activeSection === "C" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 03 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <Users className="w-6 h-6 text-citrus" />
                Section C — Participation Details &amp; Student Roster
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Consolidated student registration, classes represented, and debate preferences.
              </p>
            </div>

            <div className="space-y-5">
              {/* Question 11: Total Number of Students */}
              <div className="bg-warmwhite p-4 sm:p-5 rounded-md border border-charcoal/15">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                      11. Total Number of Students Being Registered <span className="text-crimson">*</span>
                    </label>
                    <p className="text-[11px] text-charcoal/60">
                      Standard delegate fee: ₹{perStudentFee} per student.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={formData.totalStudents}
                      onChange={(e) => handleStudentCountChange(e.target.value)}
                      className="w-24 text-center px-3 py-2 text-sm font-bold border border-charcoal/30 rounded bg-white text-navy focus:outline-none focus:border-navy"
                    />
                    <span className="text-xs font-semibold text-charcoal/80">Students</span>
                  </div>
                </div>
              </div>

              {/* Question 12: Classes Represented */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  12. Classes Represented <span className="text-crimson">*</span>{" "}
                  <span className="text-charcoal/50 text-[10px] font-normal">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {CLASSES_LIST.map((cls) => {
                    const isSelected = formData.classesRepresented.includes(cls);
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => handleClassToggle(cls)}
                        className={`py-2.5 px-3 rounded text-xs font-semibold border text-center transition-all ${
                          isSelected
                            ? "bg-navy text-citrus border-navy shadow-sm font-bold"
                            : "bg-warmwhite text-charcoal/80 border-charcoal/20 hover:border-charcoal/40"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Question 13: Names, Classes and Contact Details */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                    13. Names, Classes and Contact Details of Participating Students <span className="text-crimson">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={insertRosterTemplate}
                    className="inline-flex items-center gap-1 text-[11px] text-citrus-dark font-semibold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Insert Roster Template</span>
                  </button>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded mb-2 text-[11px] text-amber-900 leading-relaxed">
                  <strong>Instructions:</strong> Please provide the following details for every student in this box:
                  <div className="font-mono text-[10.5px] mt-1 text-charcoal/85">
                    Full Name · Class · Student Email Address · WhatsApp Number · Parent/Guardian Contact Number
                  </div>
                </div>
                <textarea
                  required
                  rows={6}
                  placeholder={`Example:\n1. Aryan Sharma · Class 10 · aryan@gmail.com · 9876543210 · Parent: 9876500000\n2. Priya Verma · Class 9 · priya@gmail.com · 9811122233 · Parent: 9811100000`}
                  value={formData.studentRoster}
                  onChange={(e) => setFormData({ ...formData, studentRoster: e.target.value })}
                  className="w-full px-3.5 py-3 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all font-mono"
                />
              </div>

              {/* Question 14: Participation Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                  14. Will students participate individually or in pre-formed teams? <span className="text-crimson">*</span>
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    "Individual Participation",
                    "Team Participation",
                    "Both Individual and Team Participation"
                  ].map((mode) => {
                    const isChecked = formData.participationMode === mode;
                    return (
                      <label
                        key={mode}
                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer text-xs font-semibold transition-all ${
                          isChecked
                            ? "border-navy bg-navy/5 text-navy font-bold shadow-xs"
                            : "border-charcoal/20 bg-warmwhite text-charcoal/80 hover:bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="participationMode"
                          checked={isChecked}
                          onChange={() => setFormData({ ...formData, participationMode: mode })}
                          className="accent-navy"
                        />
                        <span>{mode}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Question 15: Preferred Stance Allocation */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  15. Does the institution have a preferred Original Stance allocation? <span className="text-crimson">*</span>
                </label>
                <p className="text-[11px] text-charcoal/60 mb-2 italic">
                  Note: This is only an institutional preference. Final Original Stance allocations will be made by The Vichaar Council.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {["FOR", "AGAINST", "No Preference"].map((stance) => {
                    const isChecked = formData.stancePreference === stance;
                    return (
                      <label
                        key={stance}
                        className={`flex items-center justify-center gap-2 p-3 rounded-md border cursor-pointer text-xs font-semibold transition-all text-center ${
                          isChecked
                            ? "border-navy bg-navy text-citrus font-bold shadow-xs"
                            : "border-charcoal/20 bg-warmwhite text-charcoal/80 hover:bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="stancePreference"
                          checked={isChecked}
                          onChange={() => setFormData({ ...formData, stancePreference: stance })}
                          className="sr-only"
                        />
                        <span>{stance}</span>
                      </label>
                    );
                  })}
                </div>
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

        {/* ========================================================================= */}
        {/* SECTION D — Consolidated Payment Details */}
        {/* ========================================================================= */}
        {activeSection === "D" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 04 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-citrus" />
                Section D — Payment Details (Consolidated Delegation)
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Choose online checkout via Cashfree PG or manual UPI UTR verification for your school delegation.
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
                    UPI, Corporate/Debit/Credit Cards &amp; NetBanking. Instant consolidated tax invoice.
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
                    Institutional Transfer / NEFT
                  </span>
                  <span className="text-xs font-mono font-bold text-charcoal/70">Manual</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-charcoal flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-navy" />
                    Direct UPI QR / Bank UTR
                  </h4>
                  <p className="text-[11px] text-charcoal/70 mt-1 leading-snug">
                    Scan static QR code, transfer via school bank account, and upload 12-digit UTR + receipt.
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
                        Consolidated Institutional Delegation
                      </h4>
                      <p className="text-xs text-charcoal/70 mt-0.5">
                        PCI-DSS Level 1 Certified · 256-Bit Bank Encryption · RBI Compliant
                      </p>
                    </div>
                    <div className="text-left sm:text-right bg-white px-4 py-2 rounded border border-charcoal/10">
                      <span className="text-[10px] text-charcoal/60 uppercase block font-semibold">Total Payable</span>
                      <span className="font-editorial text-2xl sm:text-3xl font-bold text-emerald-700">
                        ₹{formData.feePaid || calculatedTotalAmount}
                      </span>
                      <span className="text-[10px] text-charcoal/50 block font-mono">
                        {formData.totalStudents} Delegates × ₹{perStudentFee}
                      </span>
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
                        <strong className="block text-[11px] text-charcoal">Corporate Banking</strong>
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
                      <span>Automated Pass &amp; Docket Generation</span>
                    </div>
                    <p className="text-[11px] text-charcoal/70 leading-relaxed">
                      No screenshot or UTR number needed! Proceed to Section E to review the authorised declaration. Submitting the form will immediately open the secure Cashfree checkout interface for ₹{formData.feePaid || calculatedTotalAmount}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MANUAL UTR VIEW */}
            {paymentMethod === "MANUAL_UTR" && (
              <div className="space-y-5 animate-fadeIn">
                {/* UPI QR & Account Box */}
                <div className="grid sm:grid-cols-2 gap-5 p-5 bg-navy text-warmwhite rounded-md border border-citrus/30 shadow-md">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded text-charcoal">
                <span className="text-[10px] font-bold tracking-widest text-crimson uppercase mb-2">
                  SCAN VIA ANY UPI APP
                </span>
                <div className="p-2 border-2 border-charcoal/10 rounded-sm bg-white">
                  <QRCodeSVG
                    value={upiPayPayload}
                    size={160}
                    level="H"
                    includeMargin
                  />
                </div>
                <span className="text-[10px] text-charcoal/60 mt-2 font-mono">
                  GPay · PhonePe · Paytm · BHIM
                </span>
              </div>

              {/* Account Details & Breakdown */}
              <div className="space-y-3.5 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-citrus block">
                    Institutional Payment Destination
                  </span>
                  <div className="mt-2 flex items-center justify-between p-2.5 bg-white/10 rounded border border-white/10">
                    <span className="font-mono text-xs text-warmwhite">{upiId}</span>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="px-2.5 py-1 bg-citrus text-navy text-[10px] font-bold rounded hover:bg-citrus-hover transition-colors flex items-center gap-1 uppercase"
                    >
                      {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? "Copied" : "Copy UPI"}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 border-t border-white/10 pt-3 font-mono">
                  <div className="flex justify-between text-warmwhite/70">
                    <span>Students:</span>
                    <span>{formData.totalStudents}</span>
                  </div>
                  <div className="flex justify-between text-warmwhite/70">
                    <span>Per Student Rate:</span>
                    <span>₹{perStudentFee}</span>
                  </div>
                  <div className="flex justify-between text-citrus font-bold text-sm border-t border-white/10 pt-1">
                    <span>Consolidated Total:</span>
                    <span>₹{formData.feePaid}</span>
                  </div>
                </div>

                <p className="text-[10.5px] text-warmwhite/60 leading-tight">
                  Please retain the Transaction UTR number and take a screenshot of the completed transfer to upload below.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Question 16: Fee Paid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  16. Total Registration Fee Paid (₹) <span className="text-crimson">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-charcoal/50 text-sm font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.feePaid}
                    onChange={(e) => setFormData({ ...formData, feePaid: e.target.value })}
                    className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy font-bold font-mono"
                  />
                </div>
              </div>

              {/* Question 17: Transaction ID / UTR */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  17. Transaction ID / UTR Number <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="12-digit UPI reference (e.g. 432109876543)"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy font-mono"
                />
              </div>

              {/* Question 18: Upload Payment Screenshot (50MB Limit) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  18. Upload Payment Screenshot <span className="text-crimson">*</span>{" "}
                  <span className="text-charcoal/50 text-[10px] font-normal">(Max size: 50MB per file)</span>
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-charcoal/25 hover:border-navy rounded-md p-6 text-center cursor-pointer bg-warmwhite hover:bg-white transition-all"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  {screenshotPreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-36 h-36 border rounded overflow-hidden shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={screenshotPreview}
                          alt="Payment Receipt Preview"
                          className="object-contain w-full h-full bg-white"
                        />
                      </div>
                      <span className="text-xs text-navy font-bold">{fileName}</span>
                      <span className="text-[10px] text-citrus-dark font-semibold">Click to replace screenshot</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-charcoal/70">
                      <Upload className="w-8 h-8 text-citrus" />
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">
                        Click or drag &amp; drop to upload receipt
                      </span>
                      <span className="text-[11px] text-charcoal/50">
                        PNG, JPG, JPEG or PDF (Auto-synced to Secretariat Drive Folder)
                      </span>
                    </div>
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
                        <span>Pay ₹{formData.feePaid || calculatedTotalAmount} via Cashfree (Payment First, Then Continuation)</span>
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
                  <span>Proceed to Section E</span>
                  <ArrowRight className="w-4 h-4 text-citrus group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION E — Declaration & Confirmation */}
        {/* ========================================================================= */}
        {activeSection === "E" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="border-b border-charcoal/10 pb-3">
              <span className="eyebrow text-crimson block text-[10px]">Step 05 of 05</span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal flex items-center gap-2">
                <FileCheck2 className="w-6 h-6 text-citrus" />
                Section E — Institutional Confirmation &amp; Declaration
              </h3>
              <p className="text-xs text-charcoal/60 mt-1">
                Final authorisation on behalf of the school/institution.
              </p>
            </div>

            <div className="space-y-5">
              {/* Question 19: Institutional Representative Declaration */}
              <div className="p-4 sm:p-5 bg-warmwhite rounded-md border border-charcoal/15">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.declarationConfirmed}
                    onChange={(e) => setFormData({ ...formData, declarationConfirmed: e.target.checked })}
                    className="mt-1 w-4 h-4 accent-navy rounded shrink-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                      19. Institutional Representative Declaration <span className="text-crimson">*</span>
                    </span>
                    <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed font-editorial italic">
                      &ldquo;I hereby confirm that I am authorised to submit this institutional registration on behalf of the school/institution.
                      I verify that the information provided is accurate and that the participating students and their parents/guardians have
                      been informed about their participation in SHABD &amp; SOCH. I understand that individual participant details, consent and
                      payment verification may be required before final confirmation.&rdquo;
                    </p>
                  </div>
                </label>
              </div>

              {/* Question 20: Additional Information / Special Requests */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  20. Additional Information / Special Requests <span className="text-charcoal/50 text-[10px] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Dietary constraints for delegation, transport scheduling, teacher escort passes, or queries for the Secretariat..."
                  value={formData.additionalRequests}
                  onChange={(e) => setFormData({ ...formData, additionalRequests: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-charcoal/20 rounded bg-warmwhite focus:bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy resize-none"
                />
              </div>

              {/* Institutional Summary Box */}
              <div className="bg-navy text-warmwhite p-4 sm:p-5 rounded-md border-l-4 border-citrus space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-widest text-citrus block">
                  Delegation Summary
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-warmwhite/80 font-mono text-[11px] pt-1">
                  <div>
                    <span className="text-[9px] uppercase block text-warmwhite/50">School:</span>
                    <span className="font-bold text-white truncate block">{formData.schoolName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase block text-warmwhite/50">Coordinator:</span>
                    <span className="font-bold text-white truncate block">{formData.coordinatorName || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase block text-warmwhite/50">Delegates:</span>
                    <span className="font-bold text-citrus">{formData.totalStudents} Students</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase block text-warmwhite/50">Total Fee:</span>
                    <span className="font-bold text-white">₹{formData.feePaid}</span>
                  </div>
                </div>
              </div>

              {/* Delegation Submission Mode Info */}
              <div className="p-4 bg-navy/5 border border-navy/20 rounded-lg text-xs space-y-1">
                <strong className="text-navy block uppercase tracking-wider text-[11px]">
                  {paymentMethod === "CASHFREE"
                    ? `⚡ Instant Online Checkout via Cashfree (₹${formData.feePaid})`
                    : "🏦 Manual Bank Transfer / UTR Verification"}
                </strong>
                <p className="text-charcoal/70">
                  {paymentMethod === "CASHFREE"
                    ? "Submitting will immediately launch the Cashfree payment gateway to complete payment via NetBanking, Cards, or UPI. Official institutional accreditation invoice and all delegate passes will be generated automatically."
                    : "Submitting will record your school delegation roster and UTR number for manual verification by the Secretariat."}
                </p>
              </div>
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
                className={`inline-flex items-center gap-2.5 bg-citrus hover:bg-citrus-hover text-navy text-xs sm:text-sm font-bold uppercase tracking-widest py-3.5 px-8 rounded shadow-md transition-all cursor-pointer ${
                  isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    <span>
                      {paymentMethod === "CASHFREE"
                        ? "Opening Cashfree Gateway..."
                        : "Submitting Institutional Roster..."}
                    </span>
                  </>
                ) : (
                  <>
                    {paymentMethod === "CASHFREE" ? (
                      <>
                        <span>Proceed to Cashfree Checkout (₹{formData.feePaid})</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Submit Institutional Registration</span>
                      </>
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
