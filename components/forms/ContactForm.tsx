"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "GENERAL",
    message: "",
    honeyPot: "" // Anti-spam hidden field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setStatusMessage({
        type: "success",
        text: data.message || "Your message has been lodged with the Secretariat. We will respond shortly."
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        category: "GENERAL",
        message: "",
        honeyPot: ""
      });
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err.message || "An unexpected error occurred. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-charcoal/15 bg-white p-5 sm:p-8 md:p-10 rounded-sm shadow-sm">
      <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal mb-2 text-balance">
        Official Secretariat Correspondence
      </h3>
      <p className="text-xs text-charcoal/60 mb-6">
        All submissions are logged with the Secretariat and assigned a unique reference ticket.
      </p>

      {statusMessage && (
        <div
          className={`p-4 mb-6 rounded-xs text-xs font-medium ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Anti-spam honeypot */}
        <input
          type="text"
          name="website"
          value={formData.honeyPot}
          onChange={(e) => setFormData({ ...formData, honeyPot: e.target.value })}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
              Your Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Priyadarshini Rao"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-charcoal/20 px-3.5 py-2.5 text-xs text-charcoal focus:border-citrus focus:outline-none rounded-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
              Official Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="name@organization.org"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-charcoal/20 px-3.5 py-2.5 text-xs text-charcoal focus:border-citrus focus:outline-none rounded-xs"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-charcoal/20 px-3.5 py-2.5 text-xs text-charcoal focus:border-citrus focus:outline-none rounded-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
              Category of Correspondence *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-charcoal/20 px-3.5 py-2.5 text-xs text-charcoal focus:border-citrus focus:outline-none rounded-xs bg-white"
            >
              <option value="GENERAL">General Institutional Enquiry</option>
              <option value="COLLABORATION">Academic & Institutional Collaboration</option>
              <option value="EVENT_PARTNERSHIP">Assembly or Event Partnership</option>
              <option value="MEDIA">Press, Media & Publications</option>
              <option value="GRIEVANCE">Grievance or Regulatory Redressal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
            Subject Matter *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Proposal for Inter-Collegiate Policy Caucus"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full border border-charcoal/20 px-3.5 py-2.5 text-xs text-charcoal focus:border-citrus focus:outline-none rounded-xs"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
            Formal Message *
          </label>
          <textarea
            required
            rows={5}
            placeholder="Please articulate the purpose and specific nature of your communication..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full border border-charcoal/20 px-3.5 py-2.5 text-xs text-charcoal focus:border-citrus focus:outline-none rounded-xs"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full border border-citrus bg-citrus py-3.5 text-xs font-bold tracking-[0.18em] text-ink transition-all hover:bg-navy hover:text-warmwhite hover:border-navy uppercase rounded-xs shadow-gold disabled:opacity-50"
        >
          {isSubmitting ? "LODGING CORRESPONDENCE..." : "TRANSMIT TO SECRETARIAT ↗"}
        </button>

        <p className="text-[10px] text-center text-mutedgrey tracking-wide">
          Your information is governed by our Privacy Policy and strictly utilized for Council correspondence.
        </p>
      </form>
    </div>
  );
}
