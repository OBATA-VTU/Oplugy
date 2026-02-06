import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="relative w-auto my-6 mx-auto max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-lg shadow-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-solid border-gray-200 rounded-t">
          <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
          <button
            className="p-1 ml-auto bg-transparent border-0 text-gray-700 opacity-70 float-right text-3xl leading-none font-semibold outline-none focus:outline-none hover:opacity-100"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="bg-transparent text-gray-700 opacity-70 h-6 w-6 text-2xl block outline-none focus:outline-none">
              ×
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="relative p-6 flex-auto overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end p-6 border-t border-solid border-gray-200 rounded-b">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
