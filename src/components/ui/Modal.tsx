"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ 
              position: "fixed", 
              inset: 0, 
              background: "rgba(0,0,0,0.8)", 
              backdropFilter: "blur(8px)", 
              zIndex: 1000 
            }} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-40%" }}
            style={{ 
              position: "fixed", 
              top: "50%", 
              left: "50%", 
              width: "90%",
              maxWidth: "500px",
              background: "var(--card)",
              borderRadius: "24px",
              border: "1px solid var(--border)",
              padding: "2rem",
              zIndex: 1001,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{title}</h3>
              <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                <X size={24} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
