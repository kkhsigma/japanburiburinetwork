"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UpdateCard } from "@/types";

interface UpdatePopupProps {
  card: UpdateCard | null;
  onOk: () => void;
  onDetails?: (alertId: string) => void;
}

const typeConfig = {
  emergency: {
    bg: "border-alert-red bg-red-950/80",
    icon: AlertTriangle,
    iconColor: "text-alert-red",
    label: "EMERGENCY",
    labelColor: "text-alert-red",
  },
  warning: {
    bg: "border-alert-yellow bg-yellow-950/80",
    icon: AlertCircle,
    iconColor: "text-alert-yellow",
    label: "WARNING",
    labelColor: "text-alert-yellow",
  },
  update: {
    bg: "border-alert-blue bg-blue-950/80",
    icon: Info,
    iconColor: "text-alert-blue",
    label: "UPDATE",
    labelColor: "text-alert-blue",
  },
};

export function UpdatePopup({ card, onOk, onDetails }: UpdatePopupProps) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`
              w-full max-w-md rounded-2xl border-2 p-6
              backdrop-blur-xl shadow-2xl
              ${typeConfig[card.type].bg}
            `}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="flex items-center gap-2 mb-4">
              {(() => {
                const Icon = typeConfig[card.type].icon;
                return <Icon size={20} className={typeConfig[card.type].iconColor} />;
              })()}
              <span className={`text-xs font-bold uppercase tracking-wider ${typeConfig[card.type].labelColor}`}>
                {typeConfig[card.type].label}
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>

            <p className="text-sm text-gray-400 mb-1">
              Date: <span className="text-gray-300">{card.date}</span>
            </p>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {card.impact.map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="flex gap-3">
              {card.alert_id && onDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDetails(card.alert_id!)}
                >
                  Details
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={onOk}
              >
                OK
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
