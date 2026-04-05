"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { PieChart as PieIcon, BarChart3, TrendingUp, Wallet } from "lucide-react";
import axios from "axios";
import { formatBanglaCurrency, formatBanglaNumber } from "@/lib/format";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data: groups } = await axios.get("/api/groups", { headers: { Authorization: `Bearer ${token}` } });
        
        const categoryMap: any = {};
        const memberMap: any = {};
        let total = 0;

        groups.forEach((g: any) => {
          const groupTotal = g.expenses?.reduce((acc: number, e: any) => acc + e.amount, 0) || 0;
          categoryMap[g.category] = (categoryMap[g.category] || 0) + groupTotal;
          
          g.expenses?.forEach((e: any) => {
            total += e.amount;
            const name = e.paidBy?.name || "Unknown";
            memberMap[name] = (memberMap[name] || 0) + e.amount;
          });
        });

        const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
        const memberData = Object.entries(memberMap).map(([name, value]) => ({ name, value }));

        setData({ categoryData, memberData, total });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ["#2DD4BF", "#34D399", "#818CF8", "#F472B6", "#FB923C", "#FBBF24"];

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--muted-foreground)" }}>আপনার আর্থিক বিশ্লেষণ তৈরি হচ্ছে...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 800 }}>খরচের বিশ্লেষণ</h2>
        <p style={{ color: "var(--muted-foreground)", marginTop: "0.5rem" }}>আপনার যৌথ অর্থ ব্যবস্থাপনার সার্বিক চিত্র।</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ color: "var(--primary)", marginBottom: "1rem" }}><Wallet size={24} /></div>
          <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>মোট যৌথ খরচ</span>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "0.5rem" }}>{formatBanglaCurrency(data?.total || 0, 0)}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ color: "var(--primary)", marginBottom: "1rem" }}><TrendingUp size={24} /></div>
          <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>সক্রিয় বিভাগ</span>
          <div style={{ fontSize: "2.5rem", fontWeight: 800, marginTop: "0.5rem" }}>{formatBanglaNumber(data?.categoryData.length || 0)}</div>
        </motion.div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ padding: "2rem" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", fontWeight: 700 }}>
            <PieIcon size={20} color="var(--primary)" /> শীর্ষ বিভাগ
          </h4>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {data?.categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#0a0a0b", border: "1px solid var(--border)", borderRadius: "12px", color: "#fff" }}
                  formatter={(value: any) => [formatBanglaCurrency(Number(value), 0), "খরচ"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem", justifyContent: "center" }}>
            {data?.categoryData.map((c: any, i: number) => (
               <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
                 <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: COLORS[i % COLORS.length] }}></div>
                 <span style={{ textTransform: "capitalize" }}>{c.name}</span>
               </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: "2rem" }}>
          <h4 style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem", fontWeight: 700 }}>
            <BarChart3 size={20} color="var(--primary)" /> শীর্ষ অবদানকারী
          </h4>
          <div style={{ height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.memberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatBanglaCurrency(Math.round(Number(val)), 0)} />
                <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{ background: "#0a0a0b", border: "1px solid var(--border)", borderRadius: "12px", color: "#fff" }}
                  formatter={(value: any) => [formatBanglaCurrency(Number(value), 0), "দিয়েছেন"]}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
