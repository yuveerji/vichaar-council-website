"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

interface NewEventFormProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export default function NewEventForm({ user }: NewEventFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    description: "",
    categoryName: "Public Policy & Governance",
    format: "IN_PERSON",
    venue: "Vichaar Council Chamber",
    city: "New Delhi",
    startDate: "2027-02-15T09:30",
    capacity: 150
  });

  const [tickets, setTickets] = useState([
    { name: "Delegate Pass (General)", price: 499, capacity: 100, description: "Full chamber access" },
    { name: "Student & Scholar Pass", price: 249, capacity: 50, description: "Subsidized scholar pass" }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData({ ...formData, title: val, slug });
  };

  const handleAddTicket = () => {
    setTickets([...tickets, { name: "Observer Pass", price: 0, capacity: 20, description: "Complimentary access" }]);
  };

  const handleTicketChange = (index: number, field: string, val: any) => {
    const copy = [...tickets];
    copy[index] = { ...copy[index], [field]: val };
    setTickets(copy);
  };

  const handleRemoveTicket = (index: number) => {
    setTickets(tickets.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tickets })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create assembly.");
      }

      router.push("/admin/events");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout user={user}>
      <div className="max-w-3xl space-y-8">
        <div className="border-b border-navy-border pb-6 flex items-center justify-between">
          <div>
            <Link href="/admin/events" className="text-[10px] text-citrus uppercase tracking-widest hover:underline mb-2 block">
              ← Back to Event Roll
            </Link>
            <h1 className="font-editorial text-3xl font-bold text-warmwhite">
              Convene New Assembly
            </h1>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-950/80 border border-red-500/50 text-red-200 text-xs rounded-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="border border-navy-border bg-navy p-8 rounded-sm space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                Assembly Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Constitutional Law Colloquium 2027"
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-citrus focus:border-citrus focus:outline-none rounded-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
              Short Summary Docket *
            </label>
            <input
              type="text"
              required
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="A one-sentence institutional description"
              className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
              Detailed Description *
            </label>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Complete overview of committees, topics, rules of procedure..."
              className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                Category
              </label>
              <select
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
              >
                <option value="Public Policy & Governance">Public Policy & Governance</option>
                <option value="Debate & Dialogue">Debate & Dialogue</option>
                <option value="Diplomacy & Global Affairs">Diplomacy & Global Affairs</option>
                <option value="Parliamentary Simulation">Parliamentary Simulation</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                Format
              </label>
              <select
                value={formData.format}
                onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
              >
                <option value="IN_PERSON">In-Person</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                Total Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-mutedgrey mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-navy-border bg-navy-deep px-3.5 py-2.5 text-xs text-warmwhite focus:border-citrus focus:outline-none rounded-xs"
              />
            </div>
          </div>

          {/* Ticket Categories Configuration */}
          <div className="pt-6 border-t border-navy-border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-warmwhite uppercase tracking-wider block">
                  Delegate Pass Categories & Cashfree Pricing
                </span>
                <span className="text-[10px] text-mutedgrey">Configure passes, pricing in INR (₹0 for Free/Complimentary).</span>
              </div>
              <button
                type="button"
                onClick={handleAddTicket}
                className="border border-white/20 px-3 py-1 text-[10px] text-citrus font-bold uppercase rounded-xs hover:border-citrus"
              >
                + Add Pass Category
              </button>
            </div>

            <div className="space-y-3">
              {tickets.map((t, i) => (
                <div key={i} className="p-3 bg-navy-deep border border-navy-border rounded-xs grid gap-3 sm:grid-cols-4 items-center">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Pass Name"
                      value={t.name}
                      onChange={(e) => handleTicketChange(i, "name", e.target.value)}
                      className="w-full bg-navy border border-navy-border px-3 py-1.5 text-xs text-warmwhite rounded-xs"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={t.price}
                      onChange={(e) => handleTicketChange(i, "price", Number(e.target.value))}
                      className="w-full bg-navy border border-navy-border px-3 py-1.5 text-xs text-warmwhite rounded-xs font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Cap"
                      value={t.capacity}
                      onChange={(e) => handleTicketChange(i, "capacity", Number(e.target.value))}
                      className="w-full bg-navy border border-navy-border px-3 py-1.5 text-xs text-warmwhite rounded-xs"
                    />
                    {tickets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTicket(i)}
                        className="text-red-400 hover:text-red-300 text-xs px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-navy-border flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="border border-citrus bg-citrus px-6 py-3 text-xs font-bold tracking-widest text-ink uppercase rounded-xs hover:bg-warmwhite transition-colors shadow-gold disabled:opacity-50"
            >
              {isSubmitting ? "Convening Assembly..." : "Publish Assembly Docket ↗"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
