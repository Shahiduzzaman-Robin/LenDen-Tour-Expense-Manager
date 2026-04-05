"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, UserCheck } from "lucide-react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: any[];
  onSuccess: () => void;
}

export default function AddExpenseModal({ isOpen, onClose, groupId, members, onSuccess }: AddExpenseModalProps) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paidById, setPaidById] = useState(members[0]?.userId || "");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(members.map((m: any) => m.userId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelectedUserIds(members.map((m: any) => m.userId));
    setPaidById(members[0]?.userId || "");
    setError("");
  }, [isOpen, members]);

  const toggleSelectedUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsedAmount = Number(amount);

    if (!title.trim()) {
      setError("শিরোনাম লিখুন।");
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("সঠিক পরিমাণ দিন (০-এর বেশি)।");
      return;
    }
    if (selectedUserIds.length === 0) {
      setError("কমপক্ষে ১ জন সদস্য নির্বাচন করুন।");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const amtPerPerson = parsedAmount / selectedUserIds.length;
      
      const splits = selectedUserIds.map((userId) => ({
        userId,
        amount: amtPerPerson
      }));

      await axios.post(`/api/groups/${groupId}/expenses`, {
        title: title.trim(),
        amount: parsedAmount,
        paidById,
        splitType: "equal",
        splits
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      onSuccess();
      onClose();
      setTitle("");
      setAmount("");
      setSelectedUserIds(members.map((m: any) => m.userId));
    } catch (err) {
      console.error(err);
      setError("খরচ যোগ করা যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="নতুন খরচ যোগ করুন">
      <form onSubmit={handleSubmit}>
        <Input 
          label="শিরোনাম" 
          placeholder="এটি কীসের জন্য ছিল?" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <div style={{ position: "relative" }}>
            <Input 
              label="পরিমাণ (টাকা)" 
                type="number"
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
            />
            <div style={{ position: "absolute", right: "1rem", top: "3.2rem", color: "var(--primary)", fontWeight: 700, fontSize: "0.95rem" }}>টাকা</div>
        </div>

        <div style={{ marginBottom: "2rem" }}>
            <label style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", display: "block", marginBottom: "1rem" }}>পরিশোধ করেছেন:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {members.map((m: any) => (
                    <button 
                        key={m.id} 
                        type="button"
                        onClick={() => setPaidById(m.userId)}
                        style={{ 
                            padding: "0.6rem 1rem", 
                            background: paidById === m.userId ? "var(--primary)" : "rgba(255,255,255,0.05)", 
                            color: paidById === m.userId ? "black" : "white",
                            border: "1px solid",
                            borderColor: paidById === m.userId ? "var(--primary)" : "var(--border)",
                            borderRadius: "12px", 
                            fontSize: "0.875rem", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.5rem",
                            cursor: "pointer",
                            transition: "all 0.2s"
                        }}
                    >
                        <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: m.user.avatarColor, fontSize: "9px", fontWeight: 800, color: "black", display: "grid", placeItems: "center" }}>{m.user.name[0]}</div>
                        {m.user.name}
                        {paidById === m.userId && <UserCheck size={14} />}
                    </button>
                ))}
            </div>
        </div>

        <div style={{ marginBottom: "2rem", opacity: 0.7 }}>
            <label style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>যাদের সঙ্গে ভাগ করা হচ্ছে:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
                {members.map((m: any) => {
                  const selected = selectedUserIds.includes(m.userId);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleSelectedUser(m.userId)}
                      style={{
                        padding: "0.55rem 0.85rem",
                        background: selected ? "rgba(45, 212, 191, 0.14)" : "rgba(255,255,255,0.04)",
                        border: "1px solid",
                        borderColor: selected ? "var(--primary)" : "var(--border)",
                        borderRadius: "10px",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: m.user.avatarColor, fontSize: "9px", fontWeight: 800, color: "black", display: "grid", placeItems: "center" }}>
                        {m.user.name[0]}
                      </div>
                      <span style={{ fontSize: "0.8rem" }}>{m.user.name}</span>
                    </button>
                  );
                })}
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--primary)", marginTop: "0.5rem" }}>
              নির্বাচিত {selectedUserIds.length} জনের মধ্যে সমানভাবে ভাগ করা হবে।
            </p>
        </div>

        {error && (
          <p style={{ color: "var(--destructive)", marginBottom: "1rem", fontSize: "0.85rem" }}>
            {error}
          </p>
        )}

        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "1rem", 
            background: "var(--primary)", 
            color: "black", 
            border: "none", 
            borderRadius: "14px", 
            fontWeight: 700, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: "0.75rem",
            cursor: loading ? "not-allowed" : "pointer" 
          }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> খরচ যোগ করুন</>}
        </button>
      </form>
    </Modal>
  );
}
