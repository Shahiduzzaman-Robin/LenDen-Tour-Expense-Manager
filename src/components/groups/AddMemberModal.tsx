"use client";

import { useState } from "react";
import { UserPlus, Loader2, User } from "lucide-react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

export default function AddMemberModal({ isOpen, onClose, groupId, onSuccess }: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/groups/${groupId}/members`, { name }, { headers: { Authorization: `Bearer ${token}` } });
      onSuccess();
      onClose();
      setName("");
    } catch (err: any) {
        setError(err.response?.data?.error || "সদস্য যোগ করা যায়নি");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="সদস্য যোগ করুন">
      <form onSubmit={handleSubmit}>
        <Input 
          label="সদস্যের নাম" 
          placeholder="যেমন: জন ডো" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />
        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: "1.5rem" }}>
          এই ব্যক্তির সঙ্গে সঙ্গে খরচ ভাগ করতে পারবেন। তাদের সাইন আপ করতে হবে না।
        </p>

        {error && <p style={{ color: "var(--destructive)", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}
        
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
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={20} /> সদস্য যোগ করুন</>}
        </button>
      </form>
    </Modal>
  );
}
