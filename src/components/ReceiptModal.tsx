
import React from 'react';
import { TransactionResponse } from '../types';
import Logo from './Logo';
import Modal from './Modal';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionResponse | null;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Receipt">
      <div className="p-4 sm:p-8 bg-white" id="receipt-content">
        <div className="flex flex-col items-center text-center mb-10">
          <Logo />
          <div className="mt-8 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Transaction Amount</p>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter">₦{transaction.amount.toLocaleString()}</h2>
            <div className={`inline-block px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 ${
              transaction.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {transaction.status}
            </div>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-gray-100 py-8 space-y-5">
          <ReceiptItem label="Service Type" value={transaction.type} highlight />
          <ReceiptItem label="Beneficiary" value={transaction.source} />
          <ReceiptItem label="Transaction ID" value={transaction.id} isCode />
          <ReceiptItem label="Timestamp" value={transaction.date_created?.seconds 
            ? new Date(transaction.date_created.seconds * 1000).toLocaleString() 
            : new Date(transaction.date_created).toLocaleString()} 
          />
          <ReceiptItem label="Remark" value={transaction.remarks || 'Electronic Fulfillment'} />
        </div>

        <div className="border-t-2 border-dashed border-gray-100 pt-8 mt-4 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Powering your digital lifestyle</p>
           <p className="text-[8px] font-bold text-gray-300 mt-2">© {new Date().getFullYear()} OBATA DIGITAL SOLUTIONS. NO REFUND ON COMPLETED ORDERS.</p>
        </div>
      </div>

      <div className="mt-8 flex gap-4 w-full">
        <button onClick={handlePrint} className="flex-1 bg-gray-900 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl">
          Print Receipt
        </button>
        <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-5 rounded-3xl font-black text-[10px] uppercase tracking-widest">
          Close
        </button>
      </div>
    </Modal>
  );
};

const ReceiptItem = ({ label, value, highlight, isCode }: { label: string; value: string; highlight?: boolean; isCode?: boolean }) => (
  <div className="flex justify-between items-start">
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{label}</span>
    <span className={`text-right font-black tracking-tight max-w-[200px] break-words ${
      highlight ? 'text-blue-600 text-lg' : isCode ? 'font-mono text-gray-500 text-xs' : 'text-gray-900'
    }`}>
      {value}
    </span>
  </div>
);

export default ReceiptModal;
