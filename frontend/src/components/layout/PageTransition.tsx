import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface Props { children: ReactNode; className?: string; }

const variants = {
  initial:  { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate:  { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:     { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.25, ease: 'easeIn' } },
};

export default function PageTransition({ children, className = '' }: Props) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`page-wrapper ${className}`}
    >
      {children}
    </motion.div>
  );
}
