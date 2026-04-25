"use client";

import { useState, useEffect, useRef } from "react";
import { RetroOffice3D } from "@/features/retro-office/RetroOffice3D";
import { X, UserPlus, Send, Server } from "lucide-react";

/* ─── Types ─────────────────────────────────────── */
type StaffStatus = "active" | "idle" | "busy" | "offline";

type Staff = {
  id: string;
  name: string;
  apiKey: string;
  personality: string;
  status: StaffStatus;
  avatar: string;
  role: string;
};

type ChatMsg = {
  id: string;
  from: string;
  to: string;
  text: string;
  ts: string;
};

type Resource = { id: string; name: string; type: string; size: string };

/* ─── Constants ─────────────────────────────────── */
const AVATARS = ["🤖", "🧠", "⚡", "🔬", "🛡️", "🎯", "🔭", "🧬"];
const ROLES = ["Araştırma Ajanı", "Analiz Ajanı", "Koordinatör", "QA Ajanı", "Veri İşleyici"];
const PERSONALITIES = ["Analitik", "Yaratıcı", "Sistematik", "Hızlı", "Detaycı"];
const STATUSES: StaffStatus[] = ["active", "idle", "busy", "offline"];
const STATUS_COLOR: Record<StaffStatus, string> = {
  active: "#22c55e",
  idle: "#f59e0b",
  busy: "#ef4444",
  offline: "#6b7280",
};

const RANDOM_NAMES = [
  "Ara-7", "Nexus", "Vela", "Orionis", "Cygnus", "Lyra", "Draco", "Sigma",
];

const MOCK_RESOURCES: Resource[] = [
  { id: "r1", name: "dataset_q1_2025.csv", type: "CSV", size: "2.4 MB" },
  { id: "r2", name: "medical_guidelines.pdf", type: "PDF", size: "8.1 MB" },
  { id: "r3", name: "agent_config.json", type: "JSON", size: "12 KB" },
];

const MOCK_STAFF: Staff[] = [
  { id: "s1", name: "Ara-7", apiKey: "sk-mock-****-1234", personality: "Analitik", status: "active", avatar: "🤖", role: "Araştırma Ajanı" },
  { id: "s2", name: "Nexus", apiKey: "sk-mock-****-5678", personality: "Hızlı", status: "busy", avatar: "⚡", role: "Koordinatör" },
  { id: "s3", name: "Vela", apiKey: "sk-mock-****-9012", personality: "Detaycı", status: "idle", avatar: "🔬", role: "QA Ajanı" },
];

const MOCK_CHAT: ChatMsg[] = [
  { id: "c1", from: "Ara-7", to: "Nexus", text: "Veri setini analiz ettim, anomali tespit edildi.", ts: "14:32" },
  { id: "c2", from: "Nexus", to: "Ara-7", text: "Hangi modülde? Detay ver.", ts: "14:33" },
  { id: "c3", from: "Vela", to: "Ara-7", text: "QA testleri tamamlandı. Rapor hazır.", ts: "14:35" },
  { id: "c4", from: "Ara-7", to: "Vela", text: "Anormallik skoru %87. Kritik seviye.", ts: "14:36" },
  { id: "c5", from: "Nexus", to: "Genel", text: "Tüm ajanlar toplantı odasına raporlayın.", ts: "14:38" },
];

const MEETING_MOCKUP: { name: string; partner: string; status: StaffStatus }[] = [
  { name: "Ara-7", partner: "Nexus", status: "active" },
  { name: "Nexus", partner: "Ara-7 & Vela", status: "busy" },
  { name: "Vela", partner: "Nexus", status: "idle" },
  { name: "Sigma", partner: "Draco", status: "active" },
  { name: "Draco", partner: "Sigma", status: "idle" },
];

function randomId() {
  return Math.random().toString(36).slice(2, 9);
}

/* ─── Modal Base ─────────────────────────────────── */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "linear-gradient(135deg,#0d1117 0%,#161b22 100%)",
        border: "1px solid rgba(99,179,237,0.25)",
        borderRadius: "1rem", width: "min(560px,92vw)", maxHeight: "80vh",
        overflow: "hidden", display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "#e2e8f0", letterSpacing: "0.02em" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: "0.25rem" }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "1.5rem" }}>{children}</div>
      </div>
    </div>
  );
}

/* ─── Staff Add Modal ────────────────────────────── */
function StaffAddModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Staff) => void }) {
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("sk-mock-****-" + Math.random().toString(36).slice(2, 6));
  const [personality, setPersonality] = useState(PERSONALITIES[0]);
  const [status, setStatus] = useState<StaffStatus>("active");

  const handleAdd = () => {
    const finalName = name.trim() || RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    onAdd({
      id: randomId(),
      name: finalName,
      apiKey,
      personality,
      status,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
    });
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#0d1117", border: "1px solid rgba(99,179,237,0.2)",
    borderRadius: "0.5rem", padding: "0.6rem 0.875rem", color: "#e2e8f0",
    fontSize: "0.875rem", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "0.4rem", display: "block", textTransform: "uppercase" };

  return (
    <Modal title="Yeni Personel Ekle" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
        <div>
          <label style={labelStyle}>Personel İsmi</label>
          <input style={inputStyle} placeholder="Boş bırakılırsa rastgele atanır..." value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>API Key (Mockup)</label>
          <input style={inputStyle} value={apiKey} readOnly />
        </div>
        <div>
          <label style={labelStyle}>Kişilik (Mockup)</label>
          <select style={{ ...inputStyle, cursor: "pointer" }} value={personality} onChange={e => setPersonality(e.target.value)}>
            {PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Statü</label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)} style={{
                padding: "0.35rem 0.875rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 600,
                border: `2px solid ${status === s ? STATUS_COLOR[s] : "rgba(255,255,255,0.1)"}`,
                background: status === s ? STATUS_COLOR[s] + "22" : "transparent",
                color: status === s ? STATUS_COLOR[s] : "#94a3b8", cursor: "pointer",
              }}>{s.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <button onClick={handleAdd} style={{
          marginTop: "0.5rem", padding: "0.75rem", borderRadius: "0.5rem",
          background: "linear-gradient(90deg,#3b82f6,#06b6d4)", color: "#fff",
          fontWeight: 700, fontSize: "0.9rem", border: "none", cursor: "pointer",
        }}>Personeli Ekle</button>
      </div>
    </Modal>
  );
}

/* ─── Phone Modal ────────────────────────────────── */
function PhoneModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="📞 Telefon Kulübesi" onClose={onClose}>
      <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
        <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "0.75rem", padding: "1.25rem", marginBottom: "1rem" }}>
          <p style={{ margin: 0, color: "#93c5fd", fontWeight: 600, marginBottom: "0.5rem" }}>🔧 Yakında Aktif</p>
          <p style={{ margin: 0 }}>Telefon kulübesi ajanların sesli iletişim kurabileceği bir nokta olacak. Şu anlık mockup modda.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {["Ara-7 → Nexus (bağlantı bekleniyor)", "Vela → Draco (çevrimdışı)", "Sigma → Koordinatör (aktif çağrı)"].map((line, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.5rem" }}>
              <Phone size={14} color="#60a5fa" />
              <span style={{ color: "#e2e8f0", fontSize: "0.82rem" }}>{line}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ─── Meeting Modal ──────────────────────────────── */
function MeetingModal({ staff, onClose }: { staff: Staff[]; onClose: () => void }) {
  const allMembers = [...MEETING_MOCKUP];
  return (
    <Modal title="👥 Toplantı Masası — Çalışma Sıralaması" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {allMembers.map((m, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: "0.875rem",
            padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.65rem",
          }}>
            <span style={{ fontWeight: 700, color: "#94a3b8", minWidth: "1.5rem", fontSize: "0.85rem" }}>#{i + 1}</span>
            <span style={{
              width: "0.6rem", height: "0.6rem", borderRadius: "50%",
              background: STATUS_COLOR[m.status], flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontWeight: 600, color: "#e2e8f0", fontSize: "0.9rem" }}>{m.name}</span>
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>ile çalışıyor:</span>
            <span style={{ color: "#38bdf8", fontSize: "0.82rem", fontWeight: 500 }}>{m.partner}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─── Server Modal ───────────────────────────────── */
function ServerModal({ onClose }: { onClose: () => void }) {
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [newName, setNewName] = useState("");

  const addResource = () => {
    if (!newName.trim()) return;
    setResources(r => [...r, { id: randomId(), name: newName.trim(), type: "Dosya", size: "—" }]);
    setNewName("");
  };

  return (
    <Modal title="🖥️ Sunucu Odası — Kaynaklar" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Yeni kaynak adı..."
            style={{ flex: 1, background: "#0d1117", border: "1px solid rgba(99,179,237,0.2)", borderRadius: "0.5rem", padding: "0.55rem 0.75rem", color: "#e2e8f0", fontSize: "0.875rem", outline: "none" }}
            onKeyDown={e => e.key === "Enter" && addResource()}
          />
          <button onClick={addResource} style={{ padding: "0.55rem 1rem", background: "#3b82f6", color: "#fff", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: 600 }}>Ekle</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {resources.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 0.875rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "0.6rem" }}>
              <Server size={14} color="#60a5fa" style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, color: "#e2e8f0", fontSize: "0.85rem" }}>{r.name}</span>
              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>{r.type}</span>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{r.size}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/* ─── Staff List Sidebar ─────────────────────────── */
function StaffList({ staff, onAddClick }: { staff: Staff[]; onAddClick: () => void }) {
  return (
    <div style={{
      position: "absolute", top: "4.5rem", left: "1rem", zIndex: 20,
      width: "220px", background: "rgba(13,17,23,0.88)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(99,179,237,0.15)", borderRadius: "0.875rem",
      padding: "0.875rem", display: "flex", flexDirection: "column", gap: "0.5rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase" }}>Personeller</span>
        <button onClick={onAddClick} style={{ display: "flex", alignItems: "center", gap: "0.25rem", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "0.4rem", padding: "0.25rem 0.5rem", color: "#60a5fa", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>
          <UserPlus size={12} /> Ekle
        </button>
      </div>
      {staff.map(s => (
        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.4rem 0.5rem", background: "rgba(255,255,255,0.04)", borderRadius: "0.5rem" }}>
          <span style={{ fontSize: "1rem" }}>{s.avatar}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</div>
            <div style={{ fontSize: "0.68rem", color: "#64748b" }}>{s.role}</div>
          </div>
          <span style={{ width: "0.5rem", height: "0.5rem", borderRadius: "50%", background: STATUS_COLOR[s.status], flexShrink: 0 }} />
        </div>
      ))}
      {staff.length === 0 && <div style={{ color: "#475569", fontSize: "0.78rem", textAlign: "center", padding: "0.5rem" }}>Henüz personel yok</div>}
    </div>
  );
}

/* ─── Chat Panel ─────────────────────────────────── */
function AgentChatOverlay({ staff }: { staff: Staff[] }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>(MOCK_CHAT);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(m => [...m, { id: randomId(), from: "Sen", to: "Genel", text: input.trim(), ts: new Date().toLocaleTimeString("tr", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  return (
    <div style={{
      position: "absolute", bottom: "1.5rem", right: "1rem", zIndex: 20,
      width: "320px", display: "flex", flexDirection: "column", gap: "0.5rem",
    }}>
      {/* Conversation area */}
      <div style={{
        background: "rgba(13,17,23,0.72)", backdropFilter: "blur(14px)",
        border: "1px solid rgba(99,179,237,0.15)", borderRadius: "0.875rem",
        padding: "0.875rem", maxHeight: "260px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: "0.5rem",
      }}>
        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.25rem" }}>💬 Ajan Konuşmaları</span>
        {msgs.map(m => (
          <div key={m.id} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", gap: "0.4rem", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: m.from === "Sen" ? "#38bdf8" : "#a78bfa" }}>{m.from}</span>
                <span style={{ fontSize: "0.65rem", color: "#475569" }}>{m.ts}</span>
              </div>
              <div style={{ fontSize: "0.78rem", color: "#cbd5e1", lineHeight: 1.4, marginTop: "0.1rem" }}>{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {/* Query input */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        background: "rgba(13,17,23,0.88)", backdropFilter: "blur(14px)",
        border: "1px solid rgba(99,179,237,0.2)", borderRadius: "9999px",
        padding: "0.5rem 0.75rem",
      }}>
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ajanlara veya sisteme soru sor..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "0.82rem", color: "#e2e8f0" }}
        />
        <button onClick={send} style={{ background: "#3b82f6", border: "none", borderRadius: "50%", width: "1.75rem", height: "1.75rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          <Send size={13} color="#fff" />
        </button>
      </div>
    </div>
  );
}


/* ─── Main Shell ─────────────────────────────────── */
export function ContextMedShell() {
  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showMeeting, setShowMeeting] = useState(false);
  const [showServer, setShowServer] = useState(false);

  return (
    // Outermost: position context for all overlays
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden", background: "#000" }}>

      {/* ── 3D Office fills the entire screen, pointer-events fully on so 3D obje clicks work ── */}
      <RetroOffice3D 
        agents={[]} 
        onPhoneBoothClick={() => setShowPhone(true)}
        onServerRackClick={() => setShowServer(true)}
        onStandupStartRequested={() => setShowMeeting(true)}
      />

      {/* ── Overlay layer: pointer-events:none so clicks pass through to 3D, children opt-in ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 20, pointerEvents: "none" }}>

        {/* Top bar — pointer-events:auto so buttons work */}
        <header style={{
          position: "absolute", top: 0, left: 0, right: 0,
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.75rem 1.25rem",
          background: "rgba(13,17,23,0.8)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(99,179,237,0.12)",
          pointerEvents: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "2rem", height: "2rem", borderRadius: "0.4rem", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", fontWeight: 800, fontSize: "0.9rem", color: "#fff" }}>C</div>
          <h1 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "#e2e8f0" }}>Context-Med Karargahı</h1>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowAddModal(true)} style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.35)",
            borderRadius: "0.5rem", padding: "0.4rem 0.875rem", color: "#60a5fa",
            fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
          }}>
            <UserPlus size={15} /> Personel Ekle
          </button>
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {staff.slice(0, 5).map(s => (
              <div key={s.id} title={s.name} style={{ width: "1.85rem", height: "1.85rem", borderRadius: "50%", background: "rgba(30,41,59,0.9)", border: `2px solid ${STATUS_COLOR[s.status]}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", cursor: "default" }}>
                {s.avatar}
              </div>
            ))}
          </div>
        </header>

        {/* Staff list — pointer-events:auto */}
        <div style={{ pointerEvents: "auto" }}>
          <StaffList staff={staff} onAddClick={() => setShowAddModal(true)} />
        </div>

        {/* Agent chat — pointer-events:auto */}
        <div style={{ pointerEvents: "auto" }}>
          <AgentChatOverlay staff={staff} />
        </div>

      </div>

      {/* ── Modals (full-screen, must sit above everything) ── */}
      {showAddModal && (
        <StaffAddModal
          onClose={() => setShowAddModal(false)}
          onAdd={s => setStaff(prev => [...prev, s])}
        />
      )}
      {showPhone && <PhoneModal onClose={() => setShowPhone(false)} />}
      {showMeeting && <MeetingModal staff={staff} onClose={() => setShowMeeting(false)} />}
      {showServer && <ServerModal onClose={() => setShowServer(false)} />}
    </div>
  );
}
