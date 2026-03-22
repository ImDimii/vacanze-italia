export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};
export const scaleOnHover = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 }
};
export const slideFromLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};
export const pulseGold = {
  animate: {
    boxShadow: [
      '0 0 0px rgba(232,201,125,0)',
      '0 0 20px rgba(232,201,125,0.3)',
      '0 0 0px rgba(232,201,125,0)'
    ],
    transition: { duration: 2, repeat: Infinity }
  }
};
