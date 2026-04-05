"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";
import Input from "@/components/ui/Input";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("/api/auth/register", { name, email, password });
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "নিবন্ধন ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", background: "radial-gradient(circle at bottom center, #0f172a, #000)" }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card"
        style={{ width: "100%", maxWidth: "450px", padding: "3rem", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
      >
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", padding: "1rem", borderRadius: "1rem", background: "rgba(45, 212, 191, 0.1)", marginBottom: "1.5rem" }}>
            <ShieldCheck size={40} color="#2DD4BF" />
          </div>
          <h2 style={{ fontSize: "2rem", fontWeight: 700 }}>লেনা-দেনা-এ যোগ দিন</h2>
          <p style={{ color: "var(--muted-foreground)", marginTop: "0.5rem" }}>আজ থেকেই সহজে খরচ ভাগ করা শুরু করুন।</p>
        </div>

        <form onSubmit={handleSignup}>
          <Input 
            label="পূর্ণ নাম" 
            placeholder="জন ডো" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          <Input 
            label="ইমেইল ঠিকানা" 
            type="email" 
            placeholder="name@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <Input 
            label="পাসওয়ার্ড" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          {error && <p style={{ color: "var(--destructive)", marginBottom: "1.5rem", fontSize: "0.875rem", textAlign: "center" }}>{error}</p>}

          <motion.button 
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ 
              width: "100%", 
              padding: "1rem", 
              background: "var(--primary)", 
              color: "black", 
              border: "none", 
              borderRadius: "var(--radius)", 
              fontWeight: 600, 
              fontSize: "1.1rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <>অ্যাকাউন্ট তৈরি করুন <ArrowRight size={20} /></>}
          </motion.button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
          আগে থেকেই অ্যাকাউন্ট আছে? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>লগ ইন</Link>
        </p>
      </motion.div>
    </main>
  );
}
