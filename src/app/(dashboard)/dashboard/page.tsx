"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet, Users, ChevronRight, PieChart } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { formatBanglaCurrency } from "@/lib/format";

const categoryLabels: Record<string, string> = {
  travel: "ভ্রমণ",
  utilities: "ইউটিলিটি",
  food: "খাবার",
  other: "অন্যান্য",
};

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, owe: 0, owed: 0 });

  const calculateStatsFromGroups = (groupList: any[]) => {
    const total = groupList.reduce((sum, group) => {
      const groupTotal = (group.expenses || []).reduce((expenseSum: number, expense: any) => {
        return expenseSum + Number(expense.amount || 0);
      }, 0);
      return sum + groupTotal;
    }, 0);

    // Owe/owed requires user-level split calculation; keep zero until per-user balance API is wired.
    return { total, owe: 0, owed: 0 };
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/groups", { headers: { Authorization: `Bearer ${token}` } });
        setGroups(data);
        setStats(calculateStatsFromGroups(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff" }} suppressHydrationWarning>শুভ সন্ধ্যা!</h2>
          <p style={{ color: "var(--muted-foreground)", marginTop: "0.5rem", fontSize: "1.1rem" }} suppressHydrationWarning>আপনার দৈনিক খরচের সারাংশ এখানে।</p>
        </div>
        <Link href="/groups/new">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            suppressHydrationWarning
            style={{ 
              padding: "0.875rem 1.75rem", 
              background: "var(--primary)", 
              color: "black", 
              border: "none", 
              borderRadius: "14px", 
              fontWeight: 700, 
              display: "flex", 
              alignItems: "center", 
              gap: "0.75rem",
              cursor: "pointer",
              boxShadow: "0 10px 20px rgba(45, 212, 191, 0.2)"
            }}
          >
            <Plus size={22} /> নতুন গ্রুপ
          </motion.button>
        </Link>
      </header>

      {/* Summary Cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
        <SummaryCard 
          icon={<Wallet color="#2DD4BF" />} 
          title="মোট ব্যালেন্স" 
          amount={stats.total} 
          color="#2DD4BF" 
        />
        <SummaryCard 
          icon={<ArrowDownCircle color="#EF4444" />} 
          title="আপনি দেন" 
          amount={stats.owe} 
          color="#EF4444" 
        />
        <SummaryCard 
          icon={<ArrowUpCircle color="#10B981" />} 
          title="আপনার পাওনা" 
          amount={stats.owed} 
          color="#10B981" 
        />
      </section>

      {/* Recent Groups */}
      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 700 }} suppressHydrationWarning>সক্রিয় গ্রুপ</h3>
          <Link href="/groups" style={{ color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }} suppressHydrationWarning>
            সব দেখুন <ChevronRight size={18} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {groups.length > 0 ? groups.map((g: any, i: number) => (
            <motion.div 
              key={g.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: "1.5rem", position: "relative", overflow: "hidden", cursor: "pointer" }}
            >
              <div style={{ position: "absolute", top: 0, right: 0, width: "100px", height: "100px", background: "linear-gradient(135deg, transparent, rgba(45, 212, 191, 0.05))", borderRadius: "0 0 0 100%" }}></div>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <h4 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.25rem" }}>{g.name}</h4>
                  <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem" }} suppressHydrationWarning>{categoryLabels[g.category] || g.category} • {g.members.length} জন সদস্য</p>
                </div>
                <div style={{ padding: "0.5rem 0.75rem", background: "rgba(45, 212, 191, 0.1)", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, color: "var(--primary)" }} suppressHydrationWarning>
                  সক্রিয়
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Users size={16} color="var(--muted-foreground)" />
                  <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }} suppressHydrationWarning>গ্রুপের দেনা মিটেছে</span>
                </div>
                <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{formatBanglaCurrency(0)}</span>
              </div>
            </motion.div>
          )) : (
            <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center", color: "var(--muted-foreground)" }}>
              <Users size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
              <p suppressHydrationWarning>কোনো সক্রিয় গ্রুপ পাওয়া যায়নি। শুরু করতে একটি তৈরি করুন!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon, title, amount, color }: { icon: React.ReactNode, title: string, amount: number, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, boxShadow: `0 15px 30px rgba(0,0,0,0.4)` }}
      className="glass-card" 
      style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem", position: "relative", overflow: "hidden" }}
    >
      <div style={{ borderLeft: `4px solid ${color}`, height: "100%", position: "absolute", left: 0, top: 0 }}></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px" }}>{icon}</div>
        <div style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", fontWeight: 500 }}>{title}</div>
      </div>
      <div style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "1rem", letterSpacing: "-0.03em" }}>
        {formatBanglaCurrency(amount)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)", marginTop: "0.5rem" }}>
        <PieChart size={14} /> গত মাসের তুলনায় +২.৪%
      </div>
    </motion.div>
  );
}
