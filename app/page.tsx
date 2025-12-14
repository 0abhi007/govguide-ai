"use client";

import { useState } from "react";

const OPTIONS = [
  { label: "Aadhaar Update", icon: "🪪" },
  { label: "Driving Licence", icon: "🚗" },
  { label: "PAN Card", icon: "💳" },
  { label: "Bank Account KYC", icon: "🏦" },
  { label: "Government Exam", icon: "🎓" },
  { label: "Job Application", icon: "💼" },
];

const BG_TEXT =
  "Aadhaar • PAN • Driving Licence • Bank KYC • Government Exam • Job Application • ";

export default function Home() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ CLEAN, SINGLE-CALL SUBMIT
  async function handleSubmit() {
    if (!query.trim()) return;

    setLoading(true);
    setAnswer("");
    setError("");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Backend error");
      }

      setAnswer(data.answer);
    } catch {
      setError("Unable to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#c97b5a] text-[#1f4f4a]">

      {/* ===== BACKGROUND TEXT ===== */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute left-[-50%] w-[200%] rotate-[-18deg]"
            style={{ top: `${10 + i * 14}%` }}
          >
            <div className="flex animate-marquee font-semibold text-xl text-[#ffe6c9]">
              {Array(6).fill(BG_TEXT).map((t, idx) => (
                <span key={idx} className="mr-12 whitespace-nowrap">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== MAIN CARD ===== */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#fffaf3] rounded-3xl shadow-2xl p-6">

          <h1 className="text-2xl font-semibold mb-1">GovGuide AI</h1>
          <p className="text-sm text-[#5f6f6a] mb-4">
            Honest application guidance for India — no agents, no confusion.
          </p>

          <p className="text-sm font-medium mb-3">
            What do you need help with?
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {OPTIONS.map((item) => {
              const active = selected === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    setSelected(item.label);
                    setQuery(item.label);
                  }}
                  className={`flex items-center justify-between px-4 py-2 rounded-full text-sm transition
                    ${
                      active
                        ? "bg-[#1f5f5a] text-white"
                        : "bg-[#d18b6a] text-white hover:opacity-90"
                    }`}
                >
                  <span>{item.label}</span>
                  <span>{item.icon}</span>
                </button>
              );
            })}
          </div>

          <textarea
            rows={3}
            value={query}
            onChange={(e) => {
              setSelected(null);
              setQuery(e.target.value);
            }}
            placeholder="Type your application or question..."
            className="w-full rounded-xl p-3 text-sm bg-[#f6efe4] text-[#1f4f4a] placeholder-[#8b7c6a] border border-[#e1d3bf] focus:outline-none focus:ring-2 focus:ring-[#4f7f7a] mb-4"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1f5f5a] text-white py-3 rounded-full text-sm font-medium shadow-md disabled:opacity-60"
          >
            {loading ? "Getting guidance..." : "Get Guidance"}
          </button>

          {error && (
            <div className="mt-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {answer && (
            <div className="mt-4 bg-[#f6efe4] p-4 rounded-xl text-sm whitespace-pre-wrap">
              {answer}
            </div>
          )}

          <p className="text-[11px] text-[#6b6b6b] mt-4">
            Disclaimer: Not an official government service.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </main>
  );
}
