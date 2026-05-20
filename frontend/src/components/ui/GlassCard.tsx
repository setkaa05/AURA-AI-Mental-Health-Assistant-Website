import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children?: ReactNode;
  className?: string;
  glow?: string;
  hover?: boolean;
  onClick?: () => void;
  delay?: number;
  style?: React.CSSProperties;
}

export default function GlassCard({
  children, className = '', glow, hover = false, onClick, delay = 0, style
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      onClick={onClick}
      className={clsx(
        'glass rounded-2xl relative overflow-hidden transition-all duration-300',
        hover && 'cursor-pointer',
        className
      )}
      style={{
        ...style,
        ...(glow ? { boxShadow: `0 0 30px ${glow}25, inset 0 1px 0 rgba(255,255,255,0.06)` } : {})
      }}
    >
      {children}
    </motion.div>
  );
}
