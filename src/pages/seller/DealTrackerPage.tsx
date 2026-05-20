import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Flame,
  MessageSquare,
  RefreshCw,
  Send,
  Shield,
  SkipForward,
  X,
  ZapOff,
} from "lucide-react";

// Types & Mock Data 
type DealStage = "inspection" | "marketing" | "closing" | "complete";
type MessageStatus = "safe" | "blocked";

interface ChatMessage {
  id: string;
  sender: "seller" | "buyer";
  text: string;
  time: string;
  status: MessageStatus;
}

const CIRCUMVENTION_PATTERNS = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,       // Phone numbers
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,  // Emails
  /\b(call|text|whatsapp|venmo|zelle|cashapp)\b/i,
  /\b(instagram|ig|facebook|fb|twitter|linkedin|snapchat)\b/i,
];

function containsCircumvention(text: string): boolean {
  return CIRCUMVENTION_PATTERNS.some((p) => p.test(text));
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1", sender: "buyer", text: "Hi! I've reviewed the property. I'd like to schedule an inspection for Tuesday — would that work?",
    time: "10:02 AM", status: "safe",
  },
  {
    id: "m2", sender: "seller", text: "Tuesday works for me. Please coordinate through the platform for all scheduling.",
    time: "10:15 AM", status: "safe",
  },
  {
    id: "m3", sender: "buyer", text: "Perfect. I'll have my inspector submit a request. The property looks great from the photos!",
    time: "10:22 AM", status: "safe",
  },
];

// Countdown Timer Hook
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    if (seconds <= 0) { setActive(false); return; }
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, active]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const display = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const pct = Math.max(0, seconds / initialSeconds);

  return { seconds, display, pct, expired: seconds <= 0 };
}

// Stage Pill 
const STAGES: { id: DealStage; label: string; icon: React.ReactNode }[] = [
  { id: "inspection", label: "Inspection", icon: <FileText className="h-4 w-4" /> },
  { id: "marketing", label: "72-Hr Marketing", icon: <Flame className="h-4 w-4" /> },
  { id: "closing", label: "Closing", icon: <Shield className="h-4 w-4" /> },
  { id: "complete", label: "Complete", icon: <CheckCircle2 className="h-4 w-4" /> },
];

function Pipeline({ stage }: { stage: DealStage }) {
  const idx = STAGES.findIndex((s) => s.id === stage);
  return (
    <div className="flex items-center">
      {STAGES.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <div key={s.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${active
                ? "bg-[var(--color-primary)] text-[var(--color-secondary)]"
                : done
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "bg-[var(--color-border-light)] text-[var(--color-text-muted)]"
                }`}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`h-0.5 w-8 transition-all ${done ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-light)]"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}


// Kill Switch Alert   
function KillSwitchAlert({ onActivate }: { onActivate: () => void }) {
  return (
    <div className="rounded-xl border-2 border-[var(--color-danger)] bg-[var(--color-danger)]/5 p-5">
      <div className="flex items-start gap-3">
        <ZapOff className="h-6 w-6 shrink-0 text-[var(--color-danger)]" />
        <div className="flex-1">
          <p className="font-black text-[var(--color-danger)]">Kill Switch Active</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            The 72-hour marketing window has expired. You may now cancel and
            auto-assign to the #1 Backup Buyer.
          </p>
        </div>
      </div>
      <button
        onClick={onActivate}
        className="mt-4 flex w-full items-center justify-center gap-2 bg-[var(--color-danger)] py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition hover:scale-[1.01]"
      >
        <SkipForward className="h-4 w-4" />
        Cancel Deal & Assign Backup Buyer
      </button>
    </div>
  );
}

// Blocked Message Toast 

function BlockedToast({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 shadow-lg">
      <AlertTriangle className="h-5 w-5 shrink-0 text-[var(--color-danger)]" />
      <div className="flex-1">
        <p className="text-sm font-black text-[var(--color-danger)]">Anti-Circumvention Warning</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
          Personal contact info (phone, email) or external platform names are not allowed in chat.
          This keeps all communications protected within TRACT.
        </p>
      </div>
      <button onClick={onDismiss} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function DealTrackerPage() {
  const [stage, setStage] = useState<DealStage>("marketing");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState("");
  const [showBlocked, setShowBlocked] = useState(false);
  const [killSwitchUsed, setKillSwitchUsed] = useState(false);
  const [inspectionDays] = useState(7);
  const [inspectionChoice, setInspectionChoice] = useState<3 | 7 | 10>(7);

  const marketingTimer = useCountdown(72 * 3600 - 18 * 3600); // 18h elapsed
  const inspectionTimer = useCountdown(inspectionDays * 24 * 3600 - 24 * 3600);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;

    if (containsCircumvention(text)) {
      setShowBlocked(true);
      setChatInput("");
      const blocked: ChatMessage = {
        id: `m${Date.now()}`, sender: "seller", text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        status: "blocked",
      };
      setMessages((prev) => [...prev, blocked]);
      return;
    }

    const msg: ChatMessage = {
      id: `m${Date.now()}`, sender: "seller", text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "safe",
    };
    setMessages((prev) => [...prev, msg]);
    setChatInput("");
  }

  const isMarketingKillable = marketingTimer.expired && stage === "marketing";
  const isCritical = marketingTimer.pct < 0.15;

  if (killSwitchUsed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
          <SkipForward className="h-10 w-10 text-[var(--color-danger)]" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-black text-[var(--color-primary)]">Deal Reassigned</h1>
          <p className="mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
            The primary deal has been cancelled. Your #1 Backup Buyer has been notified and promoted
            to primary partner status.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 px-6 py-3">
          <RefreshCw className="h-4 w-4 text-[var(--color-secondary)]" />
          <span className="text-sm font-bold text-[var(--color-primary)]">Backup Buyer: Notified</span>
        </div>
        <button
          onClick={() => setKillSwitchUsed(false)}
          className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)] underline underline-offset-4"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
          Seller Portal
        </p>
        <h1 className="mt-1 font-serif text-3xl font-black text-[var(--color-primary)]">
          Deal Tracker
        </h1>
        <div className="mt-4 overflow-x-auto pb-2">
          <Pipeline stage={stage} />
        </div>
      </div>

      {/* Property Summary */}
      <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bg-soft)] text-2xl">🏡</div>
            <div>
              <h2 className="font-black text-[var(--color-primary)]">123 Aspen Estates</h2>
              <p className="text-xs text-[var(--color-text-muted)]">Austin, TX · Under Contract with Marcus J.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-none border border-[var(--color-primary)] px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
              Partnership Secured
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* 72-Hour Marketing Timer (No upload proof) */}
          <div
            className={`rounded-xl border-2 p-6 transition ${isCritical
              ? "border-[var(--color-danger)] bg-[var(--color-danger)]/5"
              : "border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]"
              }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isCritical ? (
                  <Flame className="h-6 w-6 text-[var(--color-danger)]" />
                ) : (
                  <Clock className="h-6 w-6 text-[var(--color-secondary)]" />
                )}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                    72-Hour Marketing Window
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Wholesaler must complete marketing actions before timer expires
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span
                className={`font-mono text-4xl font-black ${isCritical ? "text-[var(--color-danger)]" : "text-[var(--color-primary)]"
                  }`}
              >
                {marketingTimer.display}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">remaining</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-border-light)]">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isCritical ? "bg-[var(--color-danger)]" : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]"
                  }`}
                style={{ width: `${marketingTimer.pct * 100}%` }}
              />
            </div>
            {isCritical && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[var(--color-danger)]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Final hours — Kill Switch activates when timer reaches zero
              </p>
            )}
          </div>

          {/* Kill Switch */}
          {isMarketingKillable && (
            <KillSwitchAlert onActivate={() => setKillSwitchUsed(true)} />
          )}

          {/* Inspection Period */}

          <div className="rounded-xl border border-[var(--color-border-light)] bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[var(--color-secondary)]" />
              <h3 className="font-black text-[var(--color-primary)]">Inspection Period</h3>
            </div>
            <div className="mt-4 flex gap-3">
              {([3, 7, 10] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setInspectionChoice(d)}
                  className={`flex-1 rounded-xl border-2 py-3 text-sm font-black transition ${inspectionChoice === d
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
                    : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/50"
                    }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Time Remaining
                </p>
                <span className="font-mono text-2xl font-black text-[var(--color-primary)]">
                  {inspectionTimer.display}
                </span>
              </div>
              <button
                onClick={() => setStage("closing")}
                className="flex items-center gap-2 bg-[var(--color-primary)] px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-[var(--shadow-card)] transition hover:scale-[1.02]"
              >
                Proceed to Closing
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Stage Controls */}
          <div className="flex flex-wrap gap-3">
            {STAGES.slice(0, -1).map((s) => (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className={`flex items-center gap-2 rounded-none border px-4 py-2 text-[11px] font-black uppercase tracking-wider transition ${stage === s.id
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                  : "border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Panel*/}
        <div className="flex flex-col rounded-xl border border-[var(--color-border-light)] bg-white shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="text-sm font-black text-[var(--color-primary)]">Secure Chat</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">With Marcus J. (Primary Partner)</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--color-primary)]">
                Encrypted
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ minHeight: 280, maxHeight: 380 }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "seller" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.status === "blocked"
                    ? "border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-[var(--color-danger)] line-through"
                    : msg.sender === "seller"
                      ? "bg-[var(--color-primary)] text-white"
                      : "border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] text-[var(--color-text-main)]"
                    }`}
                >
                  {msg.status === "blocked" && (
                    <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-[var(--color-danger)]">
                      ⚠ Blocked
                    </p>
                  )}
                  <p className="text-sm leading-5">{msg.text}</p>
                  <p
                    className={`mt-1 text-[10px] ${msg.sender === "seller" ? "text-white/50" : "text-[var(--color-text-muted)]"
                      }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Blocked Toast */}
          {showBlocked && (
            <div className="px-4">
              <BlockedToast onDismiss={() => setShowBlocked(false)} />
            </div>
          )}

          {/* Input */}
          <div className="border-t border-[var(--color-border-light)] p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message…"
                className="flex-1 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-bg-soft)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--color-text-muted)]/60 focus:border-[var(--color-primary)]"
              />
              <button
                onClick={sendMessage}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white transition hover:scale-[1.05]"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">
              🔒 Anti-circumvention active — phone, email, and external links are auto-blocked
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}