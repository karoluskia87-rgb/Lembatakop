/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { PetugasLapanganView } from './components/petugas/PetugasLapanganView';
import { KepalaUnitView } from './components/unit/KepalaUnitView';
import { KepalaManagerView } from './components/manager/KepalaManagerView';
import { AdminView } from './components/admin/AdminView';
import { SimulasiModal } from './components/modals/SimulasiModal';
import { KwitansiModal, KwitansiData } from './components/modals/KwitansiModal';
import { WhatsAppReminderModal } from './components/modals/WhatsAppReminderModal';
import { LoginView } from './components/auth/LoginView';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KSP Nubatukan App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#ecf0f5] flex items-center justify-center p-4 font-sans text-xs">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full border border-gray-200 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-gray-800">
              Terjadi Kesalahan pada Aplikasi
            </h2>
            <p className="text-gray-600 text-xs">
              {this.state.error?.message || 'Gagal memuat komponen aplikasi.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-4 py-2 rounded font-bold text-xs cursor-pointer"
            >
              Reset Data & Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => {
        const bg =
          toast.type === 'success'
            ? 'bg-[#00a65a] text-white border-green-600'
            : toast.type === 'error'
            ? 'bg-[#dd4b39] text-white border-red-600'
            : 'bg-[#00c0ef] text-white border-cyan-600';

        const Icon =
          toast.type === 'success'
            ? CheckCircle2
            : toast.type === 'error'
            ? AlertCircle
            : Info;

        return (
          <div
            key={toast.id}
            className={`${bg} p-3 rounded shadow-lg border flex items-start space-x-2 text-xs pointer-events-auto transition-all`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/80 hover:text-white p-0.5 cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentUser, activeMenu, whatsappModalData, closeWhatsAppReminder } = useApp();
  const [showSimulasi, setShowSimulasi] = useState(false);
  const [kwitansiData, setKwitansiData] = useState<KwitansiData | null>(null);

  if (!currentUser) {
    return (
      <>
        <ToastContainer />
        <LoginView />
      </>
    );
  }

  const role = currentUser.role;

  // Strict role enforcement for page views
  const renderContent = () => {
    if (activeMenu === 'dashboard') {
      return <DashboardView onOpenSimulasi={() => setShowSimulasi(true)} />;
    }

    // Menu Petugas Lapangan: Hanya bisa dibuka oleh Petugas Lapangan
    if (activeMenu.startsWith('petugas-')) {
      if (role !== 'petugas') {
        return <DashboardView onOpenSimulasi={() => setShowSimulasi(true)} />;
      }
      return (
        <PetugasLapanganView
          onPrintKwitansi={(data) => setKwitansiData(data)}
          onOpenSimulasi={() => setShowSimulasi(true)}
        />
      );
    }

    // Menu Kepala Unit: Hanya bisa dibuka oleh Kepala Unit
    if (activeMenu.startsWith('unit-')) {
      if (role !== 'kepala_unit') {
        return <DashboardView onOpenSimulasi={() => setShowSimulasi(true)} />;
      }
      return <KepalaUnitView />;
    }

    // Menu Kepala Manager: Hanya bisa dibuka oleh Kepala Manager
    if (activeMenu.startsWith('manager-')) {
      if (role !== 'kepala_manager') {
        return <DashboardView onOpenSimulasi={() => setShowSimulasi(true)} />;
      }
      return <KepalaManagerView />;
    }

    // Menu Admin: Hanya bisa dibuka oleh Admin
    if (activeMenu.startsWith('admin-')) {
      if (role !== 'admin') {
        return <DashboardView onOpenSimulasi={() => setShowSimulasi(true)} />;
      }
      return <AdminView />;
    }

    // Default fallback
    return <DashboardView onOpenSimulasi={() => setShowSimulasi(true)} />;
  };

  return (
    <div className="min-h-screen bg-[#ecf0f5] flex flex-col font-sans select-text">
      {/* Toast notifications */}
      <ToastContainer />

      {/* AdminLTE Top Navbar */}
      <Navbar onOpenSimulasi={() => setShowSimulasi(true)} />

      {/* Main Body Area: Sidebar + Content */}
      <div className="flex flex-1 min-h-[calc(100vh-50px)]">
        {/* Dark Sidebar with strict role filter */}
        <Sidebar onOpenSimulasi={() => setShowSimulasi(true)} />

        {/* Content Wrapper */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Interactive Declining Balance 0.5% Loan Simulation Modal */}
      <SimulasiModal isOpen={showSimulasi} onClose={() => setShowSimulasi(false)} />

      {/* Official Cooperative Receipt Print Modal */}
      <KwitansiModal data={kwitansiData} onClose={() => setKwitansiData(null)} />

      {/* Official WhatsApp Overdue & Installment Reminder Modal */}
      <WhatsAppReminderModal
        isOpen={whatsappModalData.isOpen}
        onClose={closeWhatsAppReminder}
        pinjaman={whatsappModalData.pinjaman}
        jadwal={whatsappModalData.jadwal}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
