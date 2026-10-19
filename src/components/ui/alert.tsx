import React from 'react';

interface AlertProps {
  type?: 'success' | 'error' | 'info';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message }) => {
  const styles = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  };

  return (
    <div className={`rounded border px-3 py-2 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
};
