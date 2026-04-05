"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Search, History, ArrowRight } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { formatBanglaCurrency, formatBanglaDate } from "@/lib/format";

export default function AllExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data: groups } = await axios.get("/api/groups", { headers: { Authorization: `Bearer ${token}` } });
        
        // Flatten expenses from all groups
        const all = groups.flatMap((g: any) => 
          g.expenses.map((e: any) => ({ ...e, groupName: g.name, groupId: g.id }))
        ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setExpenses(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllExpenses();
  }, []);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800 }}>লেনদেনের ইতিহাস</h2>
        <p style={{ color: "var(--muted-foreground)", marginTop: "0.5rem" }}>আপনার সব যৌথ খরচের পূর্ণ তালিকা।</p>
      </header>

      {loading ? (
        <div>আপনার ইতিহাস লোড হচ্ছে...</div>
      ) : expenses.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {expenses.map((exp: any, i: number) => (
            <motion.div 
              key={exp.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card" 
              style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ width: "45px", height: "45px", background: "rgba(45, 212, 191, 0.05)", borderRadius: "10px", display: "grid", placeItems: "center" }}>
                  <History size={20} color="var(--primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{exp.title}</h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                    {exp.groupName} {exp.paidBy?.name ? `• পরিশোধ করেছেন ${exp.paidBy.name}` : ""}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "2rem" }}>
                <div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800 }}>{formatBanglaCurrency(exp.amount)}</div>
                  <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{formatBanglaDate(exp.createdAt)}</p>
                </div>
                <Link href={`/groups/${exp.groupId}`} style={{ color: "var(--primary)" }}>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "6rem", textAlign: "center", color: "var(--muted-foreground)" }}>
           কোনো লেনদেন পাওয়া যায়নি। শুরু করতে একটি গ্রুপে প্রথম খরচ যোগ করুন!
        </div>
      )}
    </div>
  );
}
