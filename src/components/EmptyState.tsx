'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon, title, message, action }: EmptyStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        gridColumn: '1 / -1', // Ensures it spans full width if inside a CSS grid
        width: '100%'
      }}
    >
      <motion.div
        animate={{ 
          y: [0, -15, 0],
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-bg-base)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          color: 'var(--color-text-secondary)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
      >
        {icon}
      </motion.div>
      <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '300px', marginBottom: action ? '24px' : '0' }}>
        {message}
      </p>
      {action && (
        <div style={{ marginTop: '8px' }}>
          {action}
        </div>
      )}
    </motion.div>
  );
};
