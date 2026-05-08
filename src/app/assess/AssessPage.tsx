"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { QUESTIONS } from "../../../prisma/questions";
import { formatTime } from "@/lib/utils";

type Stage =
  | "validating"
  | "invalid"
  | "inactive"
  | "register"
  | "assessment"
  | "submitted"
  | "duplicate"
  | "error";

interface Answer {
  [questionId: string]: number;
}

const TOTAL_SECONDS = 1200; // 20 minutes
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const INTENT_COUNT = 7;

export default function AssessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [stage, setStage] = useState<Stage>("validating");
  const [errorMsg, setErrorMsg] = useState("");

  // Registration
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [regError, setRegError] = useState("");
  const [registering, setRegistering] = useState(false);

  // Assessment
  const [candidateId, setCandidateId] = useState("");
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answer>({});
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSubmitted = useRef(false);
  const answersRef = useRef<Answer>({});
  const tabSwitchRef = useRef(0);
  const candidateIdRef = useRef("");

  // Keep refs in sync
  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { tabSwitchRef.current = tabSwitchCount; }, [tabSwitchCount]);
  useEffect(() => { candidateIdRef.current = candidateId; }, [candidateId]);

  // Step 1: Validate token
  useEffect(() => {
    if (!token) {
      setStage("invalid");
      setErrorMsg("No assessment token found. Please check your link.");
      return;
    }
    fetch(`/api/candidate/session?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) {
          setStage("register");
        } else if (d.error?.includes("inactive")) {
          setStage("inactive");
        } else {
          setStage("invalid");
          setErrorMsg(d.error || "Invalid assessment link.");
        }
      })
      .catch(() => { setStage("invalid"); setErrorMsg("Failed to validate link."); });
  }, [token]);

  // Submit handler (used by both manual and auto-submit)
  const submitAssessment = useCallback(
    async (type: "manual" | "auto") => {
      if (hasAutoSubmitted.current) return;
      hasAutoSubmitted.current = true;

      if (timerRef.current) clearInterval(timerRef.current);
      if (autosaveRef.current) clearInterval(autosaveRef.current);

      setSubmitting(true);

      const responsesArray = Object.entries(answersRef.current).map(([questionId, answer]) => ({
        questionId,
        answer
      }));

      try {
        const res = await fetch("/api/candidate/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidateIdRef.current,
            responses: responsesArray,
            submissionType: type,
            tabSwitchCount: tabSwitchRef.current
          })
        });

        if (res.ok) {
          setStage("submitted");
        } else {
          const data = await res.json();
          setErrorMsg(data.error || "Submission failed.");
          setStage("error");
        }
      } catch {
        setErrorMsg("Network error. Please try again.");
        setStage("error");
      }
      setSubmitting(false);
    },
    []
  );

  // Timer
  useEffect(() => {
    if (stage !== "assessment" || !startedAt) return;

    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt.getTime()) / 1000);
      const remaining = Math.max(0, TOTAL_SECONDS - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 0 && !hasAutoSubmitted.current) {
        submitAssessment("auto");
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stage, startedAt, submitAssessment]);

  // Autosave
  const doAutosave = useCallback(async () => {
    const cid = candidateIdRef.current;
    if (!cid || hasAutoSubmitted.current) return;

    const responsesArray = Object.entries(answersRef.current).map(([questionId, answer]) => ({
      questionId,
      answer
    }));

    try {
      await fetch("/api/candidate/autosave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: cid,
          responses: responsesArray,
          tabSwitchCount: tabSwitchRef.current
        })
      });
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch {}
  }, []);

  useEffect(() => {
    if (stage !== "assessment") return;
    autosaveRef.current = setInterval(doAutosave, AUTOSAVE_INTERVAL);
    return () => { if (autosaveRef.current) clearInterval(autosaveRef.current); };
  }, [stage, doAutosave]);

  // Tab visibility detection
  useEffect(() => {
    if (stage !== "assessment") return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((c) => {
          const next = c + 1;
          tabSwitchRef.current = next;
          return next;
        });
        setShowTabWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stage]);

  // Registration
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError("");

    if (!/^\d{10}$/.test(mobile)) {
      setRegError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setRegistering(true);
    try {
      const res = await fetch("/api/candidate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, fullName: fullName.trim(), email: email.trim().toLowerCase(), mobile })
      });

      const data = await res.json();
      setRegistering(false);

      if (!res.ok) {
        if (res.status === 409) {
          setStage("duplicate");
        } else if (res.status === 403) {
          setStage("inactive");
        } else {
          setRegError(data.error || "Registration failed. Please try again.");
        }
        return;
      }

      setCandidateId(data.candidateId);
      candidateIdRef.current = data.candidateId;
      setQuestionOrder(data.questionOrder);
      setStartedAt(new Date());
      setStage("assessment");
    } catch {
      setRegistering(false);
      setRegError("Network error. Please try again.");
    }
  }

  // Derived: intent questions first, rest blurred until all intent answered
  const intentQuestionIds = questionOrder.slice(0, INTENT_COUNT);
  const intentAnswered = intentQuestionIds.every((id) => answers[id] !== undefined);

  const orderedQuestions = questionOrder
    .map((id) => QUESTIONS.find((q) => q.id === id))
    .filter(Boolean) as typeof QUESTIONS;

  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = orderedQuestions.length;
  const progressPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  // ─── RENDER ───────────────────────────────────────────────────────────────

  // Validating
  if (stage === "validating") {
    return (
      <FullScreen>
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500">Validating assessment link...</p>
        </div>
      </FullScreen>
    );
  }

  // Invalid / error states
  if (stage === "invalid" || stage === "inactive" || stage === "duplicate" || stage === "error") {
    const messages: Record<string, { icon: string; title: string; body: string; color: string }> = {
      invalid: {
        icon: "❌",
        title: "Invalid Link",
        body: errorMsg || "This assessment link is not valid.",
        color: "red"
      },
      inactive: {
        icon: "⏸️",
        title: "Link Inactive",
        body: "This assessment link is currently inactive. Please contact the hiring team.",
        color: "amber"
      },
      duplicate: {
        icon: "🔒",
        title: "Already Submitted",
        body: "You have already completed this assessment. Re-attempts are not permitted.",
        color: "blue"
      },
      error: {
        icon: "⚠️",
        title: "Error",
        body: errorMsg || "Something went wrong. Please try again.",
        color: "red"
      }
    };
    const m = messages[stage];
    return (
      <FullScreen>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{m.icon}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{m.title}</h2>
          <p className="text-gray-600">{m.body}</p>
        </div>
      </FullScreen>
    );
  }

  // Submitted
  if (stage === "submitted") {
    return (
      <FullScreen>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Assessment Submitted!</h2>
          <p className="text-gray-600 leading-relaxed">
            Your assessment has been submitted successfully. Thank you for your time.
            <br /><br />
            The hiring team will review your results and reach out to you if you are shortlisted.
          </p>
          <div className="mt-6 px-6 py-4 bg-blue-50 rounded-xl text-sm text-blue-700">
            You may now close this window.
          </div>
        </div>
      </FullScreen>
    );
  }

  // Registration form
  if (stage === "register") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-2xl shadow-lg mb-4">
              <svg className="w-7 h-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Sales Candidate Assessment</h1>
            <p className="text-blue-200 mt-2 text-sm">Please fill in your details to begin</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-semibold text-amber-900 text-sm mb-2">⚠ Before You Start — Important Instructions</h3>
              <ul className="text-xs text-amber-800 space-y-1.5">
                <li>• This assessment contains <strong>55 questions</strong> to be completed in <strong>20 minutes</strong>.</li>
                <li>• The timer starts immediately when you begin.</li>
                <li>• The assessment will <strong>auto-submit</strong> when time expires.</li>
                <li>• <strong>Do not switch tabs</strong> or minimize the window — it is tracked.</li>
                <li>• Your answers are auto-saved every 30 seconds.</li>
                <li>• You may only attempt this assessment once.</li>
              </ul>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number *</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {regError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {regError}
                </div>
              )}

              <button
                type="submit"
                disabled={registering}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                {registering ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Starting Assessment...
                  </span>
                ) : (
                  "Start Assessment →"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── ASSESSMENT PORTAL ────────────────────────────────────────────────────
  if (stage === "assessment") {
    const isWarning = timeLeft <= 30 && timeLeft > 0;
    const isCritical = timeLeft <= 10;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Fixed top bar */}
        <div className={`fixed top-0 left-0 right-0 z-50 shadow-md ${isWarning ? (isCritical ? "bg-red-700" : "bg-red-600") : "bg-blue-900"} transition-colors duration-500`}>
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Sales Assessment</p>
                <p className="text-white/70 text-xs">{fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {savedIndicator && (
                <span className="text-xs text-white/80 animate-pulse">✓ Saved</span>
              )}
              <div className="text-center">
                <div className={`text-xl font-bold font-mono text-white ${isCritical ? "animate-pulse" : ""}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-white/70 text-xs">remaining</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-white">{totalAnswered}/{totalQuestions}</div>
                <div className="text-white/70 text-xs">answered</div>
              </div>
            </div>
          </div>

          {/* Warning banner */}
          {isWarning && (
            <div className="bg-white/20 text-white text-center text-xs py-1.5 font-medium">
              {timeLeft <= 0
                ? "Submitting your assessment..."
                : `⚠ Your assessment will be submitted automatically in ${timeLeft} second${timeLeft !== 1 ? "s" : ""}.`}
            </div>
          )}

          {/* Progress bar */}
          <div className="h-1 bg-white/20">
            <div
              className="h-1 bg-white transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="pt-16 pb-24 max-w-3xl mx-auto px-4">
          <div className="py-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-700">
              {intentAnswered ? "All Sections" : "Section 1 — Mandatory Questions"}
            </h2>
            <span className="text-sm text-gray-500">{progressPct}% complete</span>
          </div>

          {orderedQuestions.map((q, index) => {
            const isIntent = q.section === "intent";
            const isBlurred = !isIntent && !intentAnswered;
            const isAnswered = answers[q.id] !== undefined;

            return (
              <div
                key={q.id}
                className={`mb-4 bg-white rounded-xl border transition-all duration-200 ${
                  isBlurred ? "section-blur" : ""
                } ${isAnswered ? "border-blue-200 shadow-sm" : "border-gray-200"}`}
              >
                {/* Section divider */}
                {index === 0 && (
                  <div className="px-6 pt-5 pb-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                      {q.sectionLabel}
                    </span>
                  </div>
                )}
                {index > 0 && orderedQuestions[index - 1].section !== q.section && (
                  <div className="px-6 pt-5 pb-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                      {q.sectionLabel}
                    </span>
                  </div>
                )}

                <div className="px-6 py-5">
                  <div className="flex gap-3 mb-4">
                    <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAnswered ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                      {index + 1}
                    </span>
                    <p className="text-gray-900 font-medium leading-relaxed pt-0.5">{q.text}</p>
                  </div>

                  <div className="space-y-2 ml-10">
                    {q.options.map((option, optIndex) => {
                      const selected = answers[q.id] === optIndex;
                      return (
                        <button
                          key={optIndex}
                          disabled={isBlurred}
                          onClick={() => {
                            if (!isBlurred) {
                              setAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                            }
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all duration-150 ${
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-900 font-medium shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-gray-700"
                          }`}
                        >
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mr-2 flex-shrink-0 ${
                            selected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Blur overlay notice */}
          {!intentAnswered && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-amber-600 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium z-40">
              ⬆ Complete all 7 mandatory questions to unlock the rest
            </div>
          )}
        </div>

        {/* Fixed submit button */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{totalAnswered}</span> of {totalQuestions} questions answered
              {totalAnswered < totalQuestions && (
                <span className="text-amber-600 ml-2">({totalQuestions - totalAnswered} unanswered)</span>
              )}
            </div>
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting || hasAutoSubmitted.current}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors shadow"
            >
              {submitting ? "Submitting..." : "Submit Assessment"}
            </button>
          </div>
        </div>

        {/* Tab switch warning modal */}
        {showTabWarning && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tab Switch Detected</h3>
              <p className="text-gray-600 text-sm mb-2">
                Please stay on this page. Tab switching has been noted.
              </p>
              <p className="text-red-600 text-xs font-medium mb-5">
                This is tab switch #{tabSwitchCount}. This activity is recorded and will be visible to the assessors.
              </p>
              <button
                onClick={() => setShowTabWarning(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"
              >
                I Understand — Return to Assessment
              </button>
            </div>
          </div>
        )}

        {/* Submit confirmation modal */}
        {showSubmitConfirm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Assessment?</h3>
              <p className="text-gray-600 text-sm mb-4">
                You have answered <strong>{totalAnswered}</strong> out of <strong>{totalQuestions}</strong> questions.
                {totalAnswered < totalQuestions && (
                  <span className="text-amber-700 font-medium"> {totalQuestions - totalAnswered} questions are unanswered.</span>
                )}
              </p>
              <p className="text-gray-500 text-xs mb-5">
                Once submitted, you cannot make any changes. This action is final.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSubmitConfirm(false);
                    submitAssessment("manual");
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
                >
                  Yes, Submit Now
                </button>
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg text-sm hover:bg-gray-50 transition-colors"
                >
                  Continue Answering
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4">
      {children}
    </div>
  );
}
