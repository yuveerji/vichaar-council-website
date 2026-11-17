"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle2, Clock, Upload, ArrowRight, Loader2, X } from "lucide-react";

export default function ParticipantSubmissionsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Policy Brief");
  const [abstract, setAbstract] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

  const loadSubmissions = async () => {
    try {
      const res = await fetch("/api/my-vichaar/submissions");
      const json = await res.json();
      if (res.ok) {
        setSubmissions(json.submissions || []);
      }
    } catch (e) {
      console.error("Error loading submissions:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleSubmitPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage("");

    try {
      const res = await fetch("/api/my-vichaar/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, abstract, fileUrl })
      });

      const json = await res.json();
      if (res.ok) {
        setShowSubmitModal(false);
        setTitle("");
        setAbstract("");
        setFileUrl("");
        loadSubmissions();
      } else {
        setFormMessage(json.error || "Submission failed.");
      }
    } catch {
      setFormMessage("Failed to connect to Council review repository.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-citrus" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-citrus font-semibold">
            RESEARCH & EDITORIAL FORUM
          </span>
          <h1 className="text-2xl sm:text-3xl font-editorial font-bold text-white tracking-wide mt-1">
            Intellectual Submissions
          </h1>
          <p className="text-xs text-warmwhite/60 mt-1">
            Submit policy briefs, research essays, position papers, and debate analyses to Council editors.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-5 py-2.5 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Paper</span>
        </button>
      </div>

      {submissions.length > 0 ? (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-[#0B1526] border border-white/10 rounded-2xl p-6 hover:border-citrus/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-citrus font-semibold px-2.5 py-0.5 rounded-full bg-citrus/10 border border-citrus/20">
                    {sub.category}
                  </span>
                  <span className="text-xs text-warmwhite/50">
                    Submitted on {new Date(sub.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                      sub.status === "ACCEPTED"
                        ? "text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
                        : "text-amber-300 bg-amber-950/60 border-amber-500/30"
                    }`}
                  >
                    {sub.status === "ACCEPTED" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{sub.status.replace("_", " ")}</span>
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <h2 className="text-xl font-editorial font-bold text-white">
                  {sub.title}
                </h2>
                <p className="text-xs sm:text-sm text-warmwhite/70 mt-2 leading-relaxed">
                  {sub.abstract}
                </p>
              </div>

              {sub.fileUrl && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-warmwhite/50">
                  <span>Attached Document: {sub.fileUrl}</span>
                  <span className="text-citrus font-medium">Under Academic Review</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0B1526] border border-white/10 rounded-2xl p-12 text-center space-y-4">
          <FileText className="w-12 h-12 text-warmwhite/30 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Intellectual Submissions Yet</h3>
          <p className="text-xs text-warmwhite/60 max-w-sm mx-auto">
            You can submit original research papers, position briefs, and debate essays for publication in The Vichaar Council Journal.
          </p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-citrus text-[#070E1A] font-bold text-xs uppercase tracking-wider hover:bg-citrus/90 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Your First Paper</span>
          </button>
        </div>
      )}

      {/* Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B1424] border border-white/15 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-citrus font-bold">THE VICHAAR COUNCIL</span>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Submit Research / Policy Brief
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1.5 rounded-lg text-warmwhite/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formMessage && (
              <div className="mt-4 p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-200 text-xs">
                {formMessage}
              </div>
            )}

            <form onSubmit={handleSubmitPaper} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-warmwhite/70 font-medium mb-1">
                  Title of the Work <span className="text-citrus">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Geopolitical Implications of Arctic Trade Corridors"
                  className="w-full px-3.5 py-2.5 bg-[#080E1A] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-warmwhite/70 font-medium mb-1">
                  Category <span className="text-citrus">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#080E1A] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus [color-scheme:dark]"
                >
                  <option value="Policy Brief">Policy Brief</option>
                  <option value="Research Essay">Research Essay</option>
                  <option value="Position Paper">Position Paper</option>
                  <option value="Debate Case Analysis">Debate Case Analysis</option>
                  <option value="Op-Ed">Op-Ed & Commentary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-warmwhite/70 font-medium mb-1">
                  Executive Abstract <span className="text-citrus">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Provide a concise 100–250 word summary of your thesis, methodology, and central argument."
                  className="w-full px-3.5 py-2.5 bg-[#080E1A] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-warmwhite/70 font-medium mb-1">
                  Document Link or Cloud URL (Optional)
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="Google Drive, Dropbox, or OneDrive share link"
                  className="w-full px-3.5 py-2.5 bg-[#080E1A] border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-citrus"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-warmwhite/70 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-citrus hover:bg-[#FFA62B]/90 text-[#070E1A] font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Submission</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
