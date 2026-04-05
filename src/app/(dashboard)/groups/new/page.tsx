"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowLeft, MoreVertical, DollarSign, History, LineChart, Loader2, Save } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";

const categories = [
  { label: "ভ্রমণ", value: "travel" },
  { label: "ইউটিলিটি", value: "utilities" },
  { label: "খাবার", value: "food" },
  { label: "অন্যান্য", value: "other" },
];

export default function NewGroup() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!name.trim()) {
      setError("গ্রুপের নাম আবশ্যক");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("গ্রুপ তৈরি করতে লগ ইন থাকতে হবে");
        setLoading(false);
        router.push("/login");
        return;
      }
      const { data } = await axios.post("/api/groups", { name, description, category }, { headers: { Authorization: `Bearer ${token}` } });
      router.push(`/groups/${data.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "গ্রুপ তৈরি করা যায়নি";
      setError(errorMessage);
      console.error("Create group error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <header style={{ marginBottom: "3rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link href="/groups" style={{ padding: "0.5rem", background: "rgba(255,255,255,0.05)", borderRadius: "10px", color: "var(--muted-foreground)" }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 style={{ fontSize: "2rem", fontWeight: 800 }}>নতুন গ্রুপ তৈরি করুন</h2>
          <p style={{ color: "var(--muted-foreground)", fontSize: "1rem" }}>বন্ধুদের সঙ্গে সহজে খরচ ভাগ করুন।</p>
        </div>
      </header>

      <form onSubmit={handleCreate} className="glass-card" style={{ padding: "3rem" }}>
        {error && (
          <div style={{ 
            padding: "1rem", 
            marginBottom: "1.5rem", 
            background: "rgba(239, 68, 68, 0.1)", 
            border: "1px solid rgba(239, 68, 68, 0.3)", 
            borderRadius: "8px", 
            color: "#ff6b6b" 
          }}>
            {error}
          </div>
        )}
        
        <div style={{ display: "grid", placeItems: "center", width: "80px", height: "80px", borderRadius: "20px", background: "rgba(45, 212, 191, 0.1)", marginBottom: "2.5rem" }}>
          <Users size={40} color="var(--primary)" />
        </div>

          <Input 
          label="গ্রুপের নাম" 
          placeholder="যেমন: স্কি ট্রিপ ২০২৬" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
          <Input 
          label="বিবরণ (ঐচ্ছিক)" 
          placeholder="এই গ্রুপটি কীসের জন্য?" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />

        <div style={{ marginBottom: "2.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>বিভাগ</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
            {categories.map((cat) => (
              <button 
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                style={{ 
                  padding: "0.875rem", 
                  background: category === cat.value ? "rgba(45, 212, 191, 0.1)" : "var(--input)", 
                  border: category === cat.value ? "1px solid var(--primary)" : "1px solid var(--border)", 
                  borderRadius: "12px", 
                  color: category === cat.value ? "var(--primary)" : "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <motion.button 
          type="submit"
          disabled={loading || !name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ 
            width: "100%", 
            padding: "1rem", 
            background: loading || !name.trim() ? "var(--muted-foreground)" : "var(--primary)", 
            color: "black", 
            border: "none", 
            borderRadius: "var(--radius)", 
            fontWeight: 700, 
            fontSize: "1.1rem",
            cursor: (loading || !name.trim()) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            opacity: (loading || !name.trim()) ? 0.6 : 1
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> গ্রুপ তৈরি করুন</>}
        </motion.button>
      </form>
    </div>
  );
}
