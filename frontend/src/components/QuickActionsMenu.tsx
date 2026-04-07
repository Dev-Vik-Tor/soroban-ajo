import React, { useState } from 'react';
import { Plus, X, DollarSign, Users, UserPlus, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuickActions } from '../hooks/useQuickActions';
import { QuickActionButton } from './QuickActionButton';

export function QuickActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const actions = useQuickActions();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 space-y-2"
          >
            {actions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <QuickActionButton
                  icon={action.icon}
                  label={action.label}
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Plus size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
}