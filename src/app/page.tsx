"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PieChart, Users, Zap, Shield } from "lucide-react";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem", background: "radial-gradient(circle at top right, #1e1b4b, #000000)" }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: "center", maxWidth: "800px" }}
      >
        <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 5rem)", fontWeight: 800, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
          বিল ভাগ করুন, <span className="gradient-text">বন্ধুত্ব বজায় রাখুন।</span>
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--muted-foreground)", marginBottom: "3rem", lineHeight: 1.6 }}>
          গ্রুপের খরচ পরিচালনার সবচেয়ে উন্নত উপায়টি উপভোগ করুন।
          স্মার্ট ঋণ সরলীকরণ, ভিজ্যুয়াল সম্পর্ক গ্রাফ, এবং সহজ ভাগাভাগি।
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/signup">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                padding: "1rem 2rem", 
                background: "var(--primary)", 
                color: "black", 
                border: "none", 
                borderRadius: "99px", 
                fontWeight: 600, 
                fontSize: "1.1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              শুরু করুন <ArrowRight size={20} />
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              style={{ 
                padding: "1rem 2rem", 
                background: "transparent", 
                color: "white", 
                border: "1px solid rgba(255,255,255,0.2)", 
                borderRadius: "99px", 
                fontWeight: 600, 
                fontSize: "1.1rem",
                cursor: "pointer"
              }}
            >
              লগ ইন
            </motion.button>
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ 
          marginTop: "6rem", 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
          gap: "2rem", 
          width: "100%", 
          maxWidth: "1200px" 
        }}
      >
        <FeatureCard 
          icon={<Zap color="#2DD4BF" />} 
          title="তাৎক্ষণিক ভাগ" 
          desc="কয়েক সেকেন্ডে ভাগ, শতাংশ, বা নির্দিষ্ট অঙ্কে ভাগ করুন।" 
        />
        <FeatureCard 
          icon={<Shield color="#8B5CF6" />} 
          title="ঋণ সরলীকরণ" 
          desc="আমাদের অ্যালগরিদম প্রয়োজনীয় পেমেন্টের সংখ্যা কমিয়ে আনে।" 
        />
        <FeatureCard 
          icon={<PieChart color="#F59E0B" />} 
          title="ভিজ্যুয়াল অন্তর্দৃষ্টি" 
          desc="আপনার খরচের অভ্যাস ট্র্যাক করার জন্য সুন্দর চার্ট ও গ্রাফ।" 
        />
      </motion.div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass-card"
      style={{ padding: "2rem", textAlign: "left" }}
    >
      <div style={{ marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{title}</h3>
      <p style={{ color: "var(--muted-foreground)", lineHeight: 1.5 }}>{desc}</p>
    </motion.div>
  );
}
