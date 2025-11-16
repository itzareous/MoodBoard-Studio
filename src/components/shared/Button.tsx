import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border border-zinc-900 dark:border-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus:ring-zinc-900 dark:focus:ring-zinc-50',
    secondary: 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus:ring-zinc-500',
    ghost: 'hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-50'
  };
  
  const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2 text-sm',
    lg: 'px-8 py-3 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}