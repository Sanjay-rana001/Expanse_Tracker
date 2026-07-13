import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  fullWidth = true,
  className = '',
  ...props 
}) => {
  return (
    <div className={`${styles.wrapper} ${fullWidth ? styles.fullWidth : ''} ${className}`}>
      {label && <label className={styles.label} htmlFor={props.id}>{label}</label>}
      <input 
        className={`${styles.input} ${error ? styles.inputError : ''}`} 
        {...props} 
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
