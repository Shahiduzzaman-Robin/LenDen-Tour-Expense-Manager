"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div style={{ marginBottom: "1.5rem", width: "100%" }}>
      {label && <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{label}</label>}
      <input 
        style={{ 
          width: "100%", 
          padding: "0.75rem 1rem", 
          background: "var(--input)", 
          border: "1px solid var(--border)", 
          borderRadius: "var(--radius)", 
          color: "white", 
          outline: "none",
          fontSize: "1rem",
          transition: "border-color 0.2s"
        }} 
        onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
        onBlur={(e) => e.target.style.borderColor = "var(--border)"}
        {...props} 
      />
      {error && <p style={{ marginTop: "0.5rem", color: "var(--destructive)", fontSize: "0.75rem" }}>{error}</p>}
    </div>
  );
}
