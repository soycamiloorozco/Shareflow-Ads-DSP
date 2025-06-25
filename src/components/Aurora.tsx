import React from 'react';
import { motion } from 'framer-motion';

interface AuroraProps {
  className?: string;
  children?: React.ReactNode;
}

const Aurora: React.FC<AuroraProps> = ({ className = "", children }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Aurora background effect */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800" />
        
        {/* Animated aurora layers */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 40%, rgba(120, 255, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
        />
        
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 60% 20%, rgba(255, 200, 120, 0.2) 0%, transparent 60%)",
              "radial-gradient(circle at 20% 60%, rgba(120, 200, 255, 0.2) 0%, transparent 60%)",
              "radial-gradient(circle at 80% 80%, rgba(200, 120, 255, 0.2) 0%, transparent 60%)",
              "radial-gradient(circle at 60% 20%, rgba(255, 200, 120, 0.2) 0%, transparent 60%)"
            ]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute inset-0"
        />
        
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -40, -20],
              x: [-10 + i * 5, 10 - i * 3, -10 + i * 5],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5
            }}
            className={`absolute w-2 h-2 bg-white/30 rounded-full blur-sm`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
            }}
          />
        ))}
        
        {/* Subtle noise overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Aurora; 