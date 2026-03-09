"use client";

import { motion } from "framer-motion";

interface Alert {
  title: string;
  date: string;
  severity: "critical" | "warning" | "info";
  summary: string;
}

const ALERTS: Alert[] = [
  {
    title: "オーストラリア：シロシビン・MDMAを医療承認",
    date: "2024.12",
    severity: "critical",
    summary: "世界初。治療抵抗性うつ病にシロシビン、PTSDにMDMAを正式承認。認定精神科医のみ処方可能。",
  },
  {
    title: "米国FDA：MDMA支援療法の承認審査延期",
    date: "2025.06",
    severity: "warning",
    summary: "Lykos Therapeutics社のMDMA-PTSD治療について追加データを要求。Phase 3試験の方法論に懸念。",
  },
  {
    title: "カナダ：シロシビン特別アクセスプログラム拡大",
    date: "2025.09",
    severity: "info",
    summary: "終末期患者以外にも治療抵抗性うつ病患者への特別アクセスを拡大。申請手続きを簡素化。",
  },
  {
    title: "日本：サイケデリクス研究ワーキンググループ設置",
    date: "2026.01",
    severity: "info",
    summary: "厚生労働省がサイケデリクス支援療法の国際動向調査を目的としたWGを設置。慎重な検討を開始。",
  },
  {
    title: "EU：エスケタミン適応拡大承認",
    date: "2025.11",
    severity: "warning",
    summary: "EMAがエスケタミン鼻腔スプレーの適応をMDD急性期にも拡大。自殺リスク低減のエビデンス。",
  },
];

const severityConfig = {
  critical: { color: "#ef4444", label: "重要" },
  warning:  { color: "#f59e0b", label: "注意" },
  info:     { color: "#a855f7", label: "情報" },
};

function AlertCard({ alert, index }: { alert: Alert; index: number }) {
  const sev = severityConfig[alert.severity];
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex-shrink-0 w-[320px] rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.1] hover:bg-white/[0.03] transition-colors duration-300"
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded"
          style={{ color: sev.color, backgroundColor: `${sev.color}15` }}
        >
          {sev.label}
        </span>
        <span className="text-[10px] font-mono text-gray-500">{alert.date}</span>
      </div>
      <h3 className="text-[13px] font-semibold text-gray-200 leading-snug mb-2">{alert.title}</h3>
      <p className="text-[11px] text-gray-500 leading-relaxed">{alert.summary}</p>
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
          className="mb-6"
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-500/60 mb-2">
            速報
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">規制アラート</h2>
        </motion.div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          {ALERTS.map((a, i) => (
            <AlertCard key={i} alert={a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
