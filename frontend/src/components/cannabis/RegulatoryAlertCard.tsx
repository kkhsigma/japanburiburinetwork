"use client";

import { motion } from "framer-motion";

type Severity = "info" | "warning" | "critical";

interface Alert {
  title: string;
  agency: string;
  date: string;
  severity: Severity;
}

const ALERTS: Alert[] = [
  {
    title: "Japan revises Cannabis Control Act — use crimes now punishable",
    agency: "厚生労働省 (MHLW)",
    date: "2026-03-01",
    severity: "critical",
  },
  {
    title: "Thailand tightening recreational cannabis regulation",
    agency: "Thai FDA",
    date: "2026-02-28",
    severity: "warning",
  },
  {
    title: "EU Commission discusses CBD novel food limits",
    agency: "European Commission",
    date: "2026-02-25",
    severity: "info",
  },
  {
    title: "HHCH and THCB added to Japan designated substances list",
    agency: "厚生労働省 (MHLW)",
    date: "2026-03-04",
    severity: "critical",
  },
  {
    title: "Germany considers expanding medical cannabis access",
    agency: "BfArM",
    date: "2026-02-20",
    severity: "info",
  },
];

const severityStyles: Record<Severity, { bg: string; text: string; label: string }> = {
  info: { bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-400", label: "INFO" },
  warning: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", label: "WARNING" },
  critical: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", label: "CRITICAL" },
};

function AlertCard({ alert, index }: { alert: Alert; index: number }) {
  const sev = severityStyles[alert.severity];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex-shrink-0 w-[320px] sm:w-[340px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-gray-500">{alert.date}</span>
        <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${sev.bg} ${sev.text}`}>
          {sev.label}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-gray-200 leading-snug">{alert.title}</h3>
      <p className="text-[11px] font-mono text-gray-500">{alert.agency}</p>
    </motion.div>
  );
}

export function RegulatoryAlerts() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-500/60 mb-2">
            Monitoring
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Latest Regulatory Alerts</h2>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {ALERTS.map((alert, i) => (
            <AlertCard key={i} alert={alert} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
