"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Search, Filter, ChevronRight, LayoutGrid, List, Trash2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatBanglaCurrency, formatBanglaNumber } from "@/lib/format";

const categoryLabels: Record<string, string> = {
  travel: "ভ্রমণ",
  utilities: "ইউটিলিটি",
  food: "খাবার",
  other: "অন্যান্য",
};

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [currentUserId, setCurrentUserId] = useState("");
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const toggleMembers = (groupId: string) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        setCurrentUserId(user.id || "");
      } catch {
        setCurrentUserId("");
      }
    }

    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/groups", { headers: { Authorization: `Bearer ${token}` } });
        setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`"${groupName}" গ্রুপটি মুছবেন? এতে সব খরচ, ধার, এবং সদস্য মুছে যাবে.`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/groups/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
      setGroups((prev: any) => prev.filter((group: any) => group.id !== groupId));
      router.refresh();
    } catch (err) {
      console.error("Delete group error:", err);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800 }}>আপনার গ্রুপসমূহ</h2>
          <p style={{ color: "var(--muted-foreground)", marginTop: "0.5rem" }}>আপনার যৌথ খরচ পরিচালনা ও ট্র্যাক করুন।</p>
        </div>
        <Link href="/groups/new">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              padding: "0.875rem 1.5rem", 
              background: "var(--primary)", 
              color: "black", 
              border: "none", 
              borderRadius: "14px", 
              fontWeight: 700, 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem",
              cursor: "pointer"
            }}
          >
            <Plus size={20} /> নতুন গ্রুপ তৈরি করুন
          </motion.button>
        </Link>
      </header>

      {/* Filters & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={20} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
          <input 
            placeholder="গ্রুপ খুঁজুন..." 
            style={{ width: "100%", padding: "0.875rem 1rem 0.875rem 3rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "white", outline: "none" }} 
          />
        </div>
        <div style={{ display: "flex", background: "var(--card)", borderRadius: "12px", padding: "0.25rem", border: "1px solid var(--border)" }}>
          <button onClick={() => setView("grid")} style={{ padding: "0.5rem", background: view === "grid" ? "rgba(45, 212, 191, 0.1)" : "transparent", color: view === "grid" ? "var(--primary)" : "var(--muted-foreground)", border: "none", borderRadius: "8px", cursor: "pointer" }}><LayoutGrid size={20} /></button>
          <button onClick={() => setView("list")} style={{ padding: "0.5rem", background: view === "list" ? "rgba(45, 212, 191, 0.1)" : "transparent", color: view === "list" ? "var(--primary)" : "var(--muted-foreground)", border: "none", borderRadius: "8px", cursor: "pointer" }}><List size={20} /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>আপনার গ্রুপ লোড হচ্ছে...</div>
      ) : groups.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: view === "grid" ? "repeat(auto-fill, minmax(260px, 1fr))" : "1fr", gap: "1rem" }}>
          {groups.map((g: any, i: number) => (
            <motion.div 
              key={g.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card"
                style={{ padding: "1.75rem", cursor: "pointer", transition: "border-color 0.2s", position: "relative" }}
                whileHover={{ borderColor: "rgba(45, 212, 191, 0.3)", y: -5 }}
                onClick={() => router.push(`/groups/${g.id}`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(45, 212, 191, 0.1)", borderRadius: "12px", display: "grid", placeItems: "center" }}>
                      <Users size={24} color="var(--primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: "1.25rem", fontWeight: 700 }}>{g.name}</h4>
                      <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{categoryLabels[g.category] || g.category} • {formatBanglaNumber(g.members.length)} সদস্য</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {(g.creatorId === currentUserId || g.members?.some((member: any) => member.userId === currentUserId && member.role === "admin")) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteGroup(g.id, g.name);
                        }}
                        style={{ padding: "0.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: "10px", color: "var(--destructive)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        aria-label={`${g.name} মুছুন`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <ChevronRight size={20} color="var(--muted-foreground)" />
                  </div>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "1.25rem", marginTop: "auto" }}>
                  <div style={{ display: "flex", WebkitUserSelect: "none", userSelect: "none" }}>
                    {g.members.slice(0, 3).map((m: any, idx: number) => (
                      <div key={idx} style={{ width: "28px", height: "28px", borderRadius: "50%", background: m.user.avatarColor, border: "2px solid var(--background)", marginLeft: idx === 0 ? 0 : "-10px", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: 800, color: "black" }}>
                        {m.user.name[0]}
                      </div>
                    ))}
                    {g.members.length > 3 && <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--muted)", border: "2px solid var(--background)", marginLeft: "-10px", display: "grid", placeItems: "center", fontSize: "10px", fontWeight: 700 }}>+{formatBanglaNumber(g.members.length - 3)}</div>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>মোট খরচ</p>
                    <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>{formatBanglaCurrency(g.expenses.reduce((acc: number, e: any) => acc + e.amount, 0))}</p>
                  </div>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleMembers(g.id);
                    }}
                    style={{ width: "100%", padding: "0.65rem 0.85rem", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: "10px", color: "var(--muted-foreground)", cursor: "pointer", fontWeight: 600, textAlign: "left" }}
                  >
                    {expandedMembers[g.id] ? "সদস্য লুকান" : "সদস্য দেখুন"}
                  </button>

                  <AnimatePresence>
                    {expandedMembers[g.id] && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}
                      >
                        {g.members.map((m: any) => (
                          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.45rem 0.55rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "8px" }}>
                            <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: m.user.avatarColor, fontSize: "10px", fontWeight: 800, color: "black", display: "grid", placeItems: "center" }}>
                              {m.user.name[0]}
                            </div>
                            <span style={{ fontSize: "0.88rem", color: "#fff" }}>{m.user.name}</span>
                            {m.role === "admin" && <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700 }}>অ্যাডমিন</span>}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "6rem", textAlign: "center", color: "var(--muted-foreground)" }}>
          <Users size={64} style={{ marginBottom: "1.5rem", opacity: 0.2 }} />
          <h3 style={{ fontSize: "1.5rem", color: "white", marginBottom: "0.5rem" }}>এখনও কোনো গ্রুপ নেই</h3>
          <p style={{ marginBottom: "2rem" }}>আপনার প্রথম গ্রুপ তৈরি করে বন্ধুদের সঙ্গে খরচ ভাগ করুন।</p>
        </div>
      )}
    </div>
  );
}
