import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, DollarSign, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PromoBannerProps {
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
  variant?: 'primary' | 'success';
}

export function PromoBanner({ 
  title, 
  description, 
  cta, 
  onClick,
  variant = 'primary'
}: PromoBannerProps) {
  const bgColor = variant === 'primary' ? 'bg-primary' : 'bg-[#ABFAA9]';
  const textColor = variant === 'primary' ? 'text-white' : 'text-[#181830]';
  const iconBgColor = variant === 'primary' ? 'bg-white/10' : 'bg-white';
  const iconColor = variant === 'primary' ? 'text-white' : 'text-[#181830]';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`w-full ${bgColor} rounded-xl p-6 ${textColor} cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center`}>
          {variant === 'primary' ? (
            <Sparkles className={`w-6 h-6 ${iconColor}`} />
          ) : (
            <DollarSign className={`w-6 h-6 ${iconColor}`} />
          )}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      <p className={variant === 'primary' ? 'text-white/80' : 'text-[#181830]/80'}>
        {description}
      </p>
      <Button
        variant={variant === 'primary' ? 'outline' : 'primary'}
        size="lg"
        icon={ChevronRight}
        className="mt-4"
      >
        {cta}
      </Button>
    </motion.div>
  );
}