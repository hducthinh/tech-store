/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export const AlertContext = createContext<any>(null);

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showAlert = (message, type = "info") => {
    setAlertConfig({ message, type });
  };

  const closeAlert = () => setAlertConfig(null);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert, showToast }}>
      {children}
      {alertConfig && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200 shadow-xl relative">
            <button onClick={closeAlert} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              alertConfig.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
              alertConfig.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {alertConfig.type === 'success' ? <CheckCircle2 size={32} /> : 
               alertConfig.type === 'error' ? <AlertCircle size={32} /> : 
               <Info size={32} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{alertConfig.message}</p>
            <button 
              onClick={closeAlert}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
      
      {/* Toasts Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right-8 slide-in-from-bottom-2 fade-in duration-300 min-w-[280px]"
          >
            <div className={`shrink-0 ${toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : toast.type === 'error' ? <AlertCircle size={20} /> : <Info size={20} />}
            </div>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};
