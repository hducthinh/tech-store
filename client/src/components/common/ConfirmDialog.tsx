import React from "react";
import { Card, Btn } from "../../components/SharedUI";

export default function ConfirmDialog({ 
  isOpen, onClose, onConfirm, 
  title, children, 
  confirmText = "Xác nhận", cancelText = "Hủy", 
  isDestructive = true, isProcessing = false 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-sm max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ease-out p-0">
        <div className={`p-6 border-b border-gray-100 flex justify-between items-center ${isDestructive ? 'bg-red-50' : 'bg-green-50'}`}>
          <h3 className={`text-lg font-bold ${isDestructive ? 'text-red-700' : 'text-green-700'}`}>{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">×</button>
        </div>
        <div className="p-6">
          {children}
        </div>
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <Btn type="button" variant="outline" onClick={onClose}>{cancelText}</Btn>
          <Btn 
            type="button" 
            variant={isDestructive ? "danger" : "primary"} 
            className={!isDestructive ? "bg-green-600 hover:bg-green-700 border-none text-white" : ""}
            disabled={isProcessing} 
            onClick={onConfirm}
          >
            {isProcessing ? "Đang xử lý..." : confirmText}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
