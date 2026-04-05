"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, PieChart, LogOut, ChevronRight, Menu, X } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    setMobileOpen(false);
    router.replace("/login");
  };

  const handleCloseMobile = () => setMobileOpen(false);

  const links = [
    { name: "ড্যাশবোর্ড", href: "/dashboard", icon: <LayoutDashboard size={22} /> },
    { name: "গ্রুপ", href: "/groups", icon: <Users size={22} /> },
    { name: "খরচ", href: "/expenses", icon: <CreditCard size={22} /> },
    { name: "বিশ্লেষণ", href: "/analytics", icon: <PieChart size={22} /> },
  ];

  return (
    <>
      <div className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <div style={{ width: "30px", height: "30px", background: "var(--primary)", borderRadius: "8px", display: "grid", placeItems: "center" }}>
            <CreditCard color="black" size={16} />
          </div>
          <strong style={{ fontSize: "1rem" }}>লেনা-দেনা</strong>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          style={{ background: "transparent", border: "1px solid var(--border)", color: "white", width: "36px", height: "36px", borderRadius: "10px", display: "grid", placeItems: "center", cursor: "pointer" }}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen && <div className="mobile-sidebar-backdrop" onClick={handleCloseMobile} />}

      <aside className={`sidebar-shell${mobileOpen ? " mobile-open" : ""}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "3rem", paddingLeft: "0.5rem" }}>
        <div style={{ width: "40px", height: "40px", background: "var(--primary)", borderRadius: "10px", display: "grid", placeItems: "center" }}>
          <CreditCard color="black" size={24} />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(135deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>লেনা-দেনা</h1>
      </div>

      <nav style={{ flex: 1 }} suppressHydrationWarning>
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} onClick={handleCloseMobile}>
              <motion.div 
                whileHover={{ x: 5, background: "rgba(255,255,255,0.03)" }}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "1rem", 
                  padding: "0.875rem 1rem", 
                  borderRadius: "12px", 
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                  background: active ? "rgba(45, 212, 191, 0.08)" : "transparent",
                  marginBottom: "0.5rem",
                  transition: "color 0.2s"
                }}
                suppressHydrationWarning
              >
                {link.icon}
                <span style={{ fontWeight: 500 }} suppressHydrationWarning>{link.name}</span>
                {active && <motion.div layoutId="active" style={{ marginLeft: "auto" }}><ChevronRight size={18} /></motion.div>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem" }}>
        <button 
          onClick={handleLogout}
          suppressHydrationWarning
          style={{ 
          width: "100%", 
          display: "flex", 
          alignItems: "center", 
          gap: "1rem", 
          padding: "1rem", 
          color: "#EF4444", 
          background: "transparent", 
          border: "none", 
          cursor: "pointer", 
          fontSize: "1rem", 
          fontWeight: 600,
          opacity: 0.8
        }}>
          <LogOut size={22} /> লগ আউট
        </button>
      </div>
      </aside>
    </>
  );
}
