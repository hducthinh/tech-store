import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">⚠️</div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Đã xảy ra lỗi hệ thống</h1>
            <p className="text-sm text-slate-500 mb-6">{this.state.error?.message || "Xin lỗi vì sự bất tiện này. Đội ngũ kỹ thuật đã được thông báo."}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition">
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}
