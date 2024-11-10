import * as React from 'react';

import { cn } from '@/utils/tailwind';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="relative mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
          aria-label="Close"
        >
          &times;
        </button>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">{title}</h2>
        <div className="text-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
