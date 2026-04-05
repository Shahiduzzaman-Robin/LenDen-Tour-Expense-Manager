"use client";

import { useEffect, useState, Suspense, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Plus, Users, ArrowLeft, MoreVertical, DollarSign, History, LineChart, Loader2, UserPlus, CheckCircle2, Trash2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import dynamic from "next/dynamic";
import AddExpenseModal from "@/components/groups/AddExpenseModal";
import AddMemberModal from "@/components/groups/AddMemberModal";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatBanglaCurrency, formatBanglaDate, formatBanglaNumber } from "@/lib/format";

const DebtGraph = dynamic(() => import("@/components/charts/DebtGraph"), { ssr: false });
const categoryLabels: Record<string, string> = {
  travel: "ভ্রমণ",
  utilities: "ইউটিলিটি",
  food: "খাবার",
  other: "অন্যান্য",
};
const tabLabels: Record<string, string> = {
  expenses: "খরচ",
  balances: "ব্যালেন্স",
  visual: "ভিজ্যুয়াল",
};

export default function GroupDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [group, setGroup] = useState<any>(null);
  const [debts, setDebts] = useState<any>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>({});
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [borrowFromId, setBorrowFromId] = useState("");
  const [borrowToId, setBorrowToId] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [borrowDescription, setBorrowDescription] = useState("");
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowError, setBorrowError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  const contributionData = group?.members?.map((member: any) => ({
    name: member.user.name,
    value: group.expenses.reduce((total: number, expense: any) => {
      return expense.paidBy?.id === member.user.id ? total + expense.amount : total;
    }, 0),
    color: member.user.avatarColor,
  })) || [];

  const fetchData = async () => {
    if (!id) return;
    console.log("Fetching group for ID:", id);
    try {
      const token = localStorage.getItem("token");
      const [{ data: groupData }, { data: debtData }, { data: borrowingsData }] = await Promise.all([
        axios.get(`/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/groups/${id}/simplify`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/groups/${id}/borrowings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      console.log("Group Data Received:", groupData);
      setGroup(groupData);
      setDebts(debtData.simplified);
      setBorrowings(Array.isArray(borrowingsData) ? borrowingsData : []);
      setBalances(debtData.balances);
      setSummary({
          total: debtData.totalExpense,
          perPerson: debtData.perPersonShare,
          splitShareByUser: debtData.splitShareByUser || {},
      });

      if (groupData?.members?.length > 1 && !borrowFromId && !borrowToId) {
        const first = groupData.members[0].user.id;
        const second = groupData.members[1].user.id;
        setBorrowFromId(first);
        setBorrowToId(second);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return;

    try {
      const parsed = JSON.parse(rawUser);
      setCurrentUserId(parsed?.id || "");
    } catch {
      setCurrentUserId("");
    }
  }, []);

  const handleSettle = async (fromId: string, toId: string, amount: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/groups/${id}/settle`, { fromId, toId, amount }, { headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) {
      console.error("Settle up error:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে এই গ্রুপটি মুছতে চান? সব খরচ মুছে যাবে.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/groups/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      router.push("/groups");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (expenseId: string, title: string) => {
    if (!confirm(`"${title}" খরচটি মুছবেন? এটি আর ফেরানো যাবে না.`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/groups/${id}/expenses?expenseId=${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error("Delete expense error:", err);
    }
  };

  const handleAddBorrowing = async (e: React.FormEvent) => {
    e.preventDefault();
    setBorrowError("");

    const amount = Number(borrowAmount);
    if (!borrowFromId || !borrowToId) {
      setBorrowError("Please select both people.");
      return;
    }
    if (borrowFromId === borrowToId) {
      setBorrowError("Borrower and lender must be different people.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setBorrowError("Please enter a valid amount greater than 0.");
      return;
    }

    try {
      setBorrowLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/groups/${id}/borrowings`,
        {
          amount,
          fromId: borrowFromId,
          toId: borrowToId,
          description: borrowDescription || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBorrowAmount("");
      setBorrowDescription("");
      await fetchData();
    } catch (err: any) {
      setBorrowError(err.response?.data?.error || "Failed to add borrowing entry.");
      console.error("Add borrowing error:", err);
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleDeleteBorrowing = async (borrowingId: string) => {
    if (!confirm("এই ব্যক্তিগত ধার/ভাড়া এন্ট্রি মুছতে চান?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/groups/${id}/borrowings?borrowingId=${borrowingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchData();
    } catch (err) {
      console.error("Delete borrowing error:", err);
    }
  };

  if (loading) return (
    <div style={{ height: "80vh", display: "grid", placeItems: "center" }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary)" />
    </div>
  );

  if (!group) return <div>গ্রুপ পাওয়া যায়নি</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link href="/groups" style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px", color: "var(--muted-foreground)" }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>{group.name}</h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "1rem" }}>{categoryLabels[group.category] || group.category} • {formatBanglaNumber(group.members.length)} জন সদস্য</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", position: "relative", flexWrap: "wrap" }}>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsMemberOpen(true)}
            style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "12px", color: "white", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
          >
            <UserPlus size={20} /> সদস্য যোগ করুন
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsExpenseOpen(true)}
            style={{ padding: "0.75rem 1.25rem", background: "var(--primary)", color: "black", border: "none", borderRadius: "12px", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
          >
            <Plus size={20} /> খরচ যোগ করুন
          </motion.button>
          <button onClick={() => setShowMenu(!showMenu)} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "none", color: "white", cursor: "pointer" }}>
            <MoreVertical size={20} />
          </button>
          
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ position: "absolute", top: "110%", right: 0, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0.5rem", zIndex: 10, width: "200px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
                <button onClick={handleDelete} style={{ width: "100%", textAlign: "left", padding: "0.75rem 1rem", background: "transparent", border: "none", color: "var(--destructive)", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}>গ্রুপ মুছুন</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2rem", borderBottom: "1px solid var(--border)", marginBottom: "3rem" }}>
        {["expenses", "balances", "visual"].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: "1rem 0.5rem", 
              background: "transparent", 
              border: "none", 
              borderBottom: activeTab === tab ? "2px solid var(--primary)" : "none",
              color: activeTab === tab ? "var(--primary)" : "var(--muted-foreground)",
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "capitalize",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {tabLabels[tab] || tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "expenses" && (
          <motion.div key="expenses" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {group.expenses.length > 0 ? group.expenses.map((exp: any) => (
              <div key={exp.id} className="glass-card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flex: 1, minWidth: "250px" }}>
                  <div style={{ width: "50px", height: "50px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <History size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{exp.title}</h4>
                    <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>পরিশোধ করেছেন <span style={{ color: "#fff" }}>{exp.paidBy.name}</span></p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "2rem", alignItems: "center", justifyContent: "space-between", minWidth: "200px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{formatBanglaCurrency(exp.amount)}</div>
                    <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{formatBanglaDate(exp.createdAt)}</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteExpense(exp.id, exp.title)}
                    style={{ padding: "0.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", color: "var(--destructive)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}
                  >
                    <Trash2 size={16} /> মুছুন
                  </motion.button>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted-foreground)" }}>এখনও কোনো খরচ রেকর্ড হয়নি।</div>
            )}
          </motion.div>
        )}

        {activeTab === "balances" && (
          <motion.div key="balances" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            {(() => {
              const myBalance = currentUserId && balances[currentUserId] ? balances[currentUserId].balance : 0;
              const unsettledTotal = debts.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);

              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                  <div className="glass-card" style={{ padding: "1.25rem", borderLeft: "4px solid var(--primary)" }}>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>আপনার অবস্থা</p>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "0.3rem", color: myBalance >= 0 ? "var(--primary)" : "var(--destructive)" }}>
                      {myBalance >= 0 ? "পাবেন" : "দেবেন"} {formatBanglaCurrency(Math.abs(myBalance))}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: "1.25rem" }}>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>বাকি লেনদেন</p>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "0.3rem" }}>{formatBanglaNumber(debts.length)} টি</div>
                  </div>
                  <div className="glass-card" style={{ padding: "1.25rem" }}>
                    <p style={{ color: "var(--muted-foreground)", fontSize: "0.8rem" }}>মিটাতে হবে মোট</p>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "0.3rem" }}>{formatBanglaCurrency(unsettledTotal)}</div>
                  </div>
                </div>
              );
            })()}

            <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>সদস্যভিত্তিক নিট ব্যালেন্স</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "4rem" }}>
              {Object.entries(balances).map(([userId, info]: [string, any]) => (
                <div key={userId} className="glass-card" style={{ padding: "1.5rem", borderLeft: `4px solid ${info.balance > 0 ? "var(--primary)" : info.balance < 0 ? "var(--destructive)" : "var(--muted)"}`, border: userId === currentUserId ? "1px solid rgba(45, 212, 191, 0.4)" : undefined }}>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>{info.name}</p>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0.5rem 0" }}>{info.balance > 0 ? "+" : ""}{formatBanglaCurrency(info.balance)}</div>
                  <p style={{ fontSize: "0.875rem", color: info.balance > 0 ? "var(--primary)" : info.balance < 0 ? "var(--destructive)" : "var(--muted-foreground)" }}>
                    {info.balance > 0 ? "সামগ্রিকভাবে পাওনা" : info.balance < 0 ? "সামগ্রিকভাবে দেনা" : "সব মিটে গেছে"}
                  </p>
                  {userId === currentUserId && <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600 }}>এটি আপনার হিসাব</p>}
                </div>
              ))}
            </div>

            <details className="glass-card" style={{ padding: "1.25rem", marginBottom: "2rem", border: "1px solid rgba(45, 212, 191, 0.2)" }}>
              <summary style={{ cursor: "pointer", fontWeight: 700, color: "var(--primary)", marginBottom: "1rem" }}>হিসাব কীভাবে হলো (সহজ ব্যাখ্যা)</summary>

              <p style={{ color: "var(--muted-foreground)", marginTop: "1rem", marginBottom: "0.5rem", lineHeight: 1.6 }}>
                সহজভাবে: <span style={{ color: "#fff", fontWeight: 600 }}>যে যত দিয়েছে</span> আর <span style={{ color: "#fff", fontWeight: 600 }}>তার নিজের ভাগ যত</span> -
                এই দুইটার পার্থক্য থেকেই কে পাবে আর কে দেবে ঠিক হয়।
              </p>

              <div style={{ marginTop: "1rem" }}>
                <h5 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>১) কে মোট কত টাকা দিয়েছেন</h5>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {Object.entries(balances).map(([userId, b]: [string, any]) => {
                    const paidExpenses = (group?.expenses || []).filter((exp: any) => exp.paidBy?.id === userId);
                    const paidParts = paidExpenses.map((exp: any) => {
                      const title = exp.title || "খরচ";
                      return `${title} ${formatBanglaCurrency(Number(exp.amount || 0))}`;
                    });
                    const paidEquation = paidParts.join(" + ");

                    return (
                      <div key={userId} style={{ color: "var(--muted-foreground)", padding: "0.55rem 0.7rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                        <div>
                          <span style={{ color: "#fff", fontWeight: 600 }}>{b.name}</span> = <span style={{ color: "#EFD2B0", fontWeight: 700 }}>{formatBanglaCurrency(b.totalPaid)}</span>
                          {Number(b.totalPaid || 0) > 0 && paidParts.length > 0 && (
                            <span style={{ marginLeft: "0.4rem", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                              ({paidEquation})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p style={{ marginTop: "1rem", fontWeight: 700, fontSize: "1.1rem" }}>
                  মোট = {Object.values(balances).map((b: any) => formatBanglaNumber(b.totalPaid, 2)).join(" + ")} = {formatBanglaCurrency(summary?.total || 0)}
                </p>
              </div>

              <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                <h5 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>২) কার নিজের ভাগ কত</h5>
                <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem", fontSize: "0.9rem" }}>যে খরচে যাদের নির্বাচন করা হয়েছে, শুধু তাদের উপরই সেই ভাগ গেছে।</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {Object.entries(balances).map(([userId, b]: [string, any]) => (
                    <div key={userId} style={{ color: "var(--muted-foreground)", padding: "0.5rem 0.7rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                      <span style={{ color: "#fff", fontWeight: 600 }}>{b.name}</span> = {formatBanglaCurrency(summary?.splitShareByUser?.[userId] || 0)}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                <h5 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>৩) শেষ ফলাফল (কে পাবে / কে দেবে)</h5>
                <p style={{ color: "var(--muted-foreground)", marginBottom: "1rem", fontSize: "0.9rem" }}>সূত্র: <span style={{ color: "#fff" }}>পরিশোধ</span> - <span style={{ color: "#fff" }}>নিজের ভাগ</span> = <span style={{ color: "#fff" }}>নিট</span></p>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "1rem" }}>সদস্য</th>
                        <th style={{ padding: "1rem" }}>দিয়েছেন</th>
                        <th style={{ padding: "1rem" }}>নিজের ভাগ</th>
                        <th style={{ padding: "1rem" }}>শেষ অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(balances).map(([userId, b]: [string, any], i: number) => {
                        const owedShare = summary?.splitShareByUser?.[userId] || 0;
                        const diff = b.totalPaid - owedShare;
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}>
                            <td style={{ padding: "1rem", fontWeight: 600 }}>{b.name}</td>
                            <td style={{ padding: "1rem" }}>{formatBanglaCurrency(b.totalPaid)}</td>
                            <td style={{ padding: "1rem" }}>{formatBanglaCurrency(owedShare)}</td>
                            <td style={{ padding: "1rem", color: diff > 0 ? "var(--primary)" : diff < 0 ? "var(--destructive)" : "inherit", fontWeight: 700 }}>
                              {diff > 0 ? "+" : ""}{formatBanglaCurrency(diff)} {diff > 0 ? "(পাবে)" : diff < 0 ? "(দেবে)" : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>

            <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>এখন কী করবেন</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
              {debts.length > 0 ? debts.map((d: any, i: number) => (
                <div key={i} className="glass-card" style={{ padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontWeight: 700 }}>
                    <span>{d.fromName}</span>
                    <ArrowLeft size={16} color="var(--muted-foreground)" style={{ transform: "rotate(180deg)" }} />
                    <span>{d.toName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>{formatBanglaCurrency(Number(d.amount))}</div>
                    <button
                      onClick={() => handleSettle(d.from, d.to, d.amount)}
                      style={{ padding: "0.45rem 0.8rem", background: "rgba(45,212,191,0.12)", border: "1px solid var(--primary)", borderRadius: "8px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}
                    >
                      মিটিয়ে দিন
                    </button>
                  </div>
                </div>
              )) : (
                <div className="glass-card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted-foreground)" }}>সব মিটে গেছে। কোনো pending দেনা নেই।</div>
              )}
            </div>

            <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem" }}>প্রতি সদস্যের অবদান</h4>
              <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>এই গ্রুপে প্রতিটি সদস্য কত টাকা পরিশোধ করেছেন।</p>
              <div style={{ height: "320px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatBanglaCurrency(Math.round(Number(val)), 0)} />
                    <Tooltip
                      cursor={false}
                      contentStyle={{ background: "#0a0a0b", border: "1px solid var(--border)", borderRadius: "12px", color: "#fff" }}
                      formatter={(value: any) => [formatBanglaCurrency(Number(value)), "অবদান"]}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} activeBar={{ fillOpacity: 0.85 }}>
                      {contributionData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || "var(--primary)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
              <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>ব্যক্তিগত ধার/ভাড়া</h4>
              <p style={{ color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
                যৌথ খরচের বাইরে ব্যক্তিগত ধার বা ভাড়ার পেমেন্ট যোগ করুন।
              </p>

              {group.members.length < 2 ? (
                <p style={{ color: "var(--muted-foreground)" }}>ব্যক্তিভেদে ধার রেকর্ড করতে অন্তত ২ জন সদস্য যোগ করুন।</p>
              ) : (
                <form onSubmit={handleAddBorrowing} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", alignItems: "end", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>ধারগ্রহীতা</label>
                    <select className="soft-select" value={borrowFromId} onChange={(e) => setBorrowFromId(e.target.value)}>
                      {group.members.map((m: any) => (
                        <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>ধারদাতা</label>
                    <select className="soft-select" value={borrowToId} onChange={(e) => setBorrowToId(e.target.value)}>
                      {group.members.map((m: any) => (
                        <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>পরিমাণ</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={borrowAmount}
                      onChange={(e) => setBorrowAmount(e.target.value)}
                      placeholder="যেমন: ৪০"
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--input)", color: "white" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>বিবরণ</label>
                    <input
                      type="text"
                      value={borrowDescription}
                      onChange={(e) => setBorrowDescription(e.target.value)}
                      placeholder="ভাড়া, ধার, টিকিট..."
                      style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--input)", color: "white" }}
                    />
                  </div>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={borrowLoading}
                    style={{ padding: "0.8rem 1rem", borderRadius: "10px", border: "none", background: "var(--primary)", color: "black", fontWeight: 700, cursor: borrowLoading ? "not-allowed" : "pointer", opacity: borrowLoading ? 0.7 : 1 }}
                  >
                    {borrowLoading ? "যোগ করা হচ্ছে..." : "এন্ট্রি যোগ করুন"}
                  </motion.button>
                </form>
              )}

              {borrowError && <p style={{ color: "var(--destructive)", marginBottom: "0.75rem" }}>{borrowError}</p>}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {borrowings.length === 0 ? (
                  <p style={{ color: "var(--muted-foreground)" }}>এখনও কোনো ব্যক্তিগত ধার/ভাড়ার রেকর্ড নেই।</p>
                ) : (
                  borrowings.map((entry: any) => (
                    <div key={entry.id} style={{ padding: "0.85rem 1rem", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.95rem" }}>
                        <strong>{entry.from?.name || "অজানা"}</strong> <strong>{entry.to?.name || "অজানা"}</strong>-এর কাছে দেনা
                        {" "}বিবরণ: {entry.description || "ব্যক্তিগত ধার"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ fontWeight: 700 }}>{formatBanglaCurrency(Number(entry.amount))}</div>
                        <button
                          type="button"
                          onClick={() => handleDeleteBorrowing(entry.id)}
                          style={{ padding: "0.45rem", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.35)", borderRadius: "8px", color: "var(--destructive)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          aria-label="ধার/ভাড়া এন্ট্রি মুছুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        )}

        {activeTab === "visual" && (
          <motion.div key="visual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card" style={{ height: "600px", padding: "1rem", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 10 }}>
                <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>সম্পর্কের হিটম্যাপ</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>নোডগুলো সদস্যদের দেখায়, আর এজগুলো নিট দেনা দেখায়।</p>
            </div>
              <Suspense fallback={<div>গ্রাফ লোড হচ্ছে...</div>}>
                <DebtGraph debts={debts} members={group.members} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      <AddExpenseModal isOpen={isExpenseOpen} onClose={() => setIsExpenseOpen(false)} groupId={id} members={group.members} onSuccess={fetchData} />
      <AddMemberModal isOpen={isMemberOpen} onClose={() => setIsMemberOpen(false)} groupId={id} onSuccess={fetchData} />
    </div>
  );
}
