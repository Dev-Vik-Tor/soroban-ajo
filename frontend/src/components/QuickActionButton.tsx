import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export function QuickActionButton({ icon: Icon, label, onClick }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-md hover:shadow-lg"
      aria-label={label}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Icon size={20} className="text-gray-700" />
      </div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </motion.button>
  );
}