"use client";

import { useEffect, useRef } from "react";
import { Network } from "vis-network";
import { formatBanglaCurrency } from "@/lib/format";

interface DebtGraphProps {
  debts: any[];
  members: any[];
}

export default function DebtGraph({ debts, members }: DebtGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const graphFontFace = "Shurjo";

    const nodes = members.map((m) => ({
      id: m.userId,
      label: m.user.name,
      color: {
        background: m.user.avatarColor,
        border: "#fff",
        highlight: { background: "var(--primary)", border: "#fff" }
      },
      font: { color: "#fff", size: 16, face: graphFontFace, strokeWidth: 0 },
      shape: "dot",
      size: 25,
      borderWidth: 2,
    }));

    const edges = debts.map((d) => ({
      from: d.from,
      to: d.to,
      label: formatBanglaCurrency(Number(d.amount)),
      arrows: { to: { enabled: true, scaleFactor: 1.2, type: "arrow" } },
      width: Math.max(1, d.amount / 100), // Thicker lines for bigger debts
      color: { color: "rgba(255, 255, 255, 0.4)", highlight: "var(--primary)" },
      font: { 
        size: 16, 
        color: "#fff", 
        background: "rgba(10, 10, 11, 0.8)", 
        strokeWidth: 0,
        align: "top",
        face: graphFontFace
      },
      length: 250,
      smooth: { enabled: true, type: "curvedCW", roundness: 0.2 },
    }));

    const options = {
      nodes: {
        shadow: { enabled: true, color: "rgba(0,0,0,0.5)", size: 10, x: 5, y: 5 }
      },
      physics: {
        enabled: true,
        solver: "forceAtlas2Based",
        forceAtlas2Based: {
          gravitationalConstant: -100,
          centralGravity: 0.015,
          springLength: 200,
          springConstant: 0.08,
          damping: 0.4
        },
        stabilization: { iterations: 150 }
      },
      interaction: {
        hover: true,
        zoomView: true,
        dragView: true
      }
    };

    const network = new Network(containerRef.current, { nodes, edges }, options);

    if (typeof document !== "undefined" && document.fonts?.load) {
      document.fonts.load(`16px "${graphFontFace}"`).then(() => {
        network.redraw();
      }).catch(() => {
        // Keep default fallback font if the custom font fails to load.
      });
    }

    return () => network.destroy();
  }, [debts, members]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", background: "transparent" }} />;
}
