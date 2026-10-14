import React, { useState } from 'react';
import {
  Menu,
  Bell,
  Mail,
  Flag,
  User as UserIcon,
  LogOut,
  Shield,
  Key,
  ChevronDown,
  Building,
  RefreshCw,
  Calculator,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenSimulasi: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSimulasi }) => {
  const {
    currentUser,
    logout,
    quickSwitchRole,
    toggleSidebar,
    pinjamanList,
    pembinaanList,
    setActiveMenu,
    openWhatsAppReminder,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const role = currentUser?.role;

  // Notifications calculation based on role
  const pendingPinjaman = pinjamanList.filter((p) => p.status === 'menunggu_evaluasi').length;
  const pendingUnitApproval = pinjamanList.filter((p) => p.status === 'disetujui_unit').length;
  const activePembinaan = pembinaanList.filter((p) => p.statusTindakLanjut === 'dalam_proses').length;
  const overdueInstallments = pinjamanList.filter((p) => p.kolektibilitas > 1).length;

  const roleLabels: Record<UserRole, { label: string; badge: string }> = {
    petugas: { label: 'Petugas Lapangan', badge: 'bg-[#00c0ef]' },
    kepala_unit: { label: 'Kepala Unit', badge: 'bg-[#00a65a]' },
    kepala_manager: { label: 'Kepala Manager', badge: 'bg-[#f39c12]' },
    admin: { label: 'Admin Sistem', badge: 'bg-[#dd4b39]' },
  };

  const getNotificationCount = () => {
    if (role === 'petugas') return overdueInstallments;
    if (role === 'kepala_unit') return pendingPinjaman + overdueInstallments;
    if (role === 'kepala_manager') return pendingUnitApproval + activePembinaan;
    if (role === 'admin') return 1;
    return 0;
  };

  const notifCount = getNotificationCount();

  return (
    <header className="bg-[#3c8dbc] text-white flex items-center justify-between h-[50px] shadow-sm select-none z-30 sticky top-0 px-0">
      {/* Left side: Logo & Toggle */}
      <div className="flex items-center">
        {/* AdminLTE style Logo Brand Header */}
        <div className="w-[230px] bg-[#367fa9] h-[50px] flex items-center px-4 font-bold text-lg tracking-wide shrink-0 transition-all border-r border-[#306f95]">
          <span className="font-extrabold text-white">KSP</span>
          <span className="font-light text-blue-100 ml-1.5">NUBATUKAN</span>
          <span className="text-[10px] ml-2 px-1.5 py-0.5 bg-[#00a65a] rounded text-white font-semibold">
            0.5%
          </span>
        </div>

        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="h-[50px] w-[50px] flex items-center justify-center hover:bg-[#367fa9] text-white transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Branch Title Badge */}
        <div className="hidden md:flex items-center ml-3 text-xs text-blue-100 bg-[#357ca5] px-2.5 py-1 rounded">
          <Building className="w-3.5 h-3.5 mr-1.5 text-blue-200" />
          <span>Kantor Cabang Nubatukan &bull; Kab. Lembata</span>
        </div>
      </div>

      {/* Right side items */}
      <div className="flex items-center space-x-1 pr-2">
        {/* Quick Loan Simulation Button */}
        <button
          onClick={onOpenSimulasi}
          className="hidden sm:flex items-center space-x-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs px-2.5 py-1.5 rounded transition shadow-xs cursor-pointer font-medium mr-1"
          title="Kalkulator Simulasi Bunga 0.5% Menurun"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Kalkulator 0.5%</span>
        </button>

        {/* Quick WhatsApp Jatuh Tempo Notification Button (Khusus Petugas Lapangan) */}
        {role === 'petugas' && overdueInstallments > 0 && (
          <button
            onClick={() => {
              const overdueLoan = pinjamanList.find((p) => p.kolektibilitas > 1);
              if (overdueLoan) {
                const unpaid =
                  overdueLoan.jadwal.find(
                    (j) => j.status === 'jatuh_tempo' || j.status === 'belum_bayar'
                  ) || overdueLoan.jadwal[0];
                openWhatsAppReminder(overdueLoan, unpaid);
              }
            }}
            className="flex items-center space-x-1.5 bg-[#25D366] hover:bg-[#1ebd59] text-gray-950 font-bold text-xs px-2.5 py-1.5 rounded transition shadow-xs cursor-pointer mr-1"
            title={`${overdueInstallments} nasabah jatuh tempo/DPK - Klik untuk kirim WhatsApp`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-gray-950" />
            <span className="hidden sm:inline">WA Jatuh Tempo</span>
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {overdueInstallments}
            </span>
          </button>
        )}

        {/* Quick Role Switcher pill (Allows switching user to test other accounts) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowUserDropdown(false);
              setShowNotifications(false);
            }}
            className="flex items-center text-xs bg-[#2f6f96] hover:bg-[#286082] px-2.5 py-1.5 rounded text-white transition cursor-pointer"
            title="Ganti Pengguna / Peran (Switch User)"
          >
            <Shield className="w-3.5 h-3.5 mr-1.5 text-yellow-300" />
            <span className="hidden lg:inline mr-1 text-blue-100">Login Sebagai:</span>
            <span className="font-bold">
              {currentUser ? roleLabels[currentUser.role]?.label : 'Pilih Peran'}
            </span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded shadow-lg border border-gray-200 py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-gray-100 font-bold text-gray-700 flex items-center justify-between">
                <span>Pilih Akun Pengguna</span>
                <span className="text-[10px] text-gray-400">4 User Khusus</span>
              </div>
              <button
                onClick={() => {
                  quickSwitchRole('petugas');
                  setShowRoleSwitcher(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer ${
                  currentUser?.role === 'petugas' ? 'bg-blue-50 font-semibold text-blue-700' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">1. Petugas Lapangan</div>
                  <div className="text-[11px] text-gray-500">Yohanes Bapa, S.E.</div>
                </div>
                <span className="px-1.5 py-0.5 bg-[#00c0ef] text-white rounded text-[10px]">Petugas</span>
              </button>
              <button
                onClick={() => {
                  quickSwitchRole('kepala_unit');
                  setShowRoleSwitcher(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer ${
                  currentUser?.role === 'kepala_unit' ? 'bg-blue-50 font-semibold text-blue-700' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">2. Kepala Unit</div>
                  <div className="text-[11px] text-gray-500">Maria Goreti Kewa, S.Ak.</div>
                </div>
                <span className="px-1.5 py-0.5 bg-[#00a65a] text-white rounded text-[10px]">Unit</span>
              </button>
              <button
                onClick={() => {
                  quickSwitchRole('kepala_manager');
                  setShowRoleSwitcher(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer ${
                  currentUser?.role === 'kepala_manager' ? 'bg-blue-50 font-semibold text-blue-700' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">3. Kepala Manager</div>
                  <div className="text-[11px] text-gray-500">Drs. Fransiskus Making</div>
                </div>
                <span className="px-1.5 py-0.5 bg-[#f39c12] text-white rounded text-[10px]">Manager</span>
              </button>
              <button
                onClick={() => {
                  quickSwitchRole('admin');
                  setShowRoleSwitcher(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between cursor-pointer ${
                  currentUser?.role === 'admin' ? 'bg-blue-50 font-semibold text-blue-700' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">4. Admin Sistem</div>
                  <div className="text-[11px] text-gray-500">Stefanus Ola</div>
                </div>
                <span className="px-1.5 py-0.5 bg-[#dd4b39] text-white rounded text-[10px]">Admin</span>
              </button>
            </div>
          )}
        </div>

        {/* Message / Arahan Pembinaan Notifications (Khusus Manager atau Staf) */}
        {role === 'kepala_manager' && (
          <div className="relative">
            <button
              onClick={() => {
                setActiveMenu('manager-pembinaan');
              }}
              className="h-[50px] px-3 flex items-center justify-center hover:bg-[#367fa9] text-white transition-colors relative cursor-pointer"
              title="Catatan Pembinaan Manager"
            >
              <Mail className="w-4 h-4" />
              {activePembinaan > 0 && (
                <span className="absolute top-2 right-1.5 bg-[#00a65a] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                  {activePembinaan}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleSwitcher(false);
              setShowUserDropdown(false);
            }}
            className="h-[50px] px-3 flex items-center justify-center hover:bg-[#367fa9] text-white transition-colors relative cursor-pointer"
            title="Notifikasi Tugas"
          >
            <Bell className="w-4 h-4" />
            {notifCount > 0 && (
              <span className="absolute top-2 right-1.5 bg-[#f39c12] text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded shadow-lg border border-gray-200 py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-gray-100 font-bold text-gray-700">
                Pemberitahuan ({role?.replace('_', ' ').toUpperCase()})
              </div>
              <div className="p-2 space-y-1">
                {role === 'kepala_unit' && pendingPinjaman > 0 && (
                  <button
                    onClick={() => {
                      setActiveMenu('unit-evaluasi');
                      setShowNotifications(false);
                    }}
                    className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-start space-x-2 text-gray-700 cursor-pointer"
                  >
                    <span className="w-2 h-2 mt-1 rounded-full bg-[#f39c12] shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {pendingPinjaman} Pinjaman Perlu Evaluasi Unit
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Menunggu analisis 5C oleh Kepala Unit
                      </div>
                    </div>
                  </button>
                )}

                {role === 'kepala_manager' && pendingUnitApproval > 0 && (
                  <button
                    onClick={() => {
                      setActiveMenu('manager-pengawasan');
                      setShowNotifications(false);
                    }}
                    className="w-full text-left p-2 hover:bg-green-50 rounded flex items-start space-x-2 text-gray-700 cursor-pointer"
                  >
                    <span className="w-2 h-2 mt-1 rounded-full bg-[#00a65a] shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {pendingUnitApproval} Pinjaman Siap Disetujui Manager
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Telah lolos evaluasi unit, butuh otorisasi pimpinan
                      </div>
                    </div>
                  </button>
                )}

                {role === 'petugas' && (
                  <button
                    onClick={() => {
                      setActiveMenu('petugas-angsuran');
                      setShowNotifications(false);
                    }}
                    className="w-full text-left p-2 hover:bg-blue-50 rounded flex items-start space-x-2 text-gray-700 cursor-pointer"
                  >
                    <span className="w-2 h-2 mt-1 rounded-full bg-[#00c0ef] shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Jadwal Penagihan Aktif
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Kunjungi debitur & cetak kwitansi angsuran
                      </div>
                    </div>
                  </button>
                )}

                {role === 'admin' && (
                  <button
                    onClick={() => {
                      setActiveMenu('admin-users');
                      setShowNotifications(false);
                    }}
                    className="w-full text-left p-2 hover:bg-red-50 rounded flex items-start space-x-2 text-gray-700 cursor-pointer"
                  >
                    <span className="w-2 h-2 mt-1 rounded-full bg-[#dd4b39] shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Manajemen User Cabang Nubatukan
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Kelola akun dan ubah password petugas
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Dropdown (AdminLTE Classic) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowRoleSwitcher(false);
              setShowNotifications(false);
            }}
            className="h-[50px] px-3 flex items-center space-x-2 hover:bg-[#367fa9] text-white transition-colors cursor-pointer"
          >
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name || 'User'}
              className="w-7 h-7 rounded-full object-cover border border-white/60"
            />
            <span className="hidden md:inline text-xs font-semibold max-w-[130px] truncate">
              {currentUser?.name || 'Petugas'}
            </span>
            <ChevronDown className="w-3 h-3 text-blue-200" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded shadow-xl border border-gray-200 z-50 text-xs overflow-hidden">
              {/* User Header in Dropdown (AdminLTE style dark blue banner) */}
              <div className="bg-[#3c8dbc] text-white p-4 text-center">
                <img
                  src={currentUser?.avatar}
                  alt={currentUser?.name}
                  className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white/80 shadow-sm mb-2"
                />
                <p className="font-bold text-sm">{currentUser?.name}</p>
                <p className="text-blue-100 text-[11px] capitalize">
                  {currentUser ? roleLabels[currentUser.role]?.label : ''} - Cabang Nubatukan
                </p>
                <div className="mt-1 text-[10px] text-blue-200">
                  Login: {currentUser?.lastLogin}
                </div>
              </div>

              {/* User Body details */}
              <div className="p-3 bg-gray-50 border-b border-gray-100 space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span className="text-gray-400">Username:</span>
                  <span className="font-semibold text-gray-700">{currentUser?.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Telepon:</span>
                  <span className="font-semibold text-gray-700">{currentUser?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sistem Bunga:</span>
                  <span className="font-semibold text-[#00a65a]">0,5% / Bulan Menurun</span>
                </div>
              </div>

              {/* User Footer with Buttons */}
              <div className="p-2.5 bg-gray-100 flex items-center justify-between">
                {role === 'admin' ? (
                  <button
                    onClick={() => {
                      setActiveMenu('admin-users');
                      setShowUserDropdown(false);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded text-xs font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Kelola User</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-500 italic">KSP Nubatukan</span>
                )}
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="px-3 py-1.5 bg-[#dd4b39] hover:bg-[#c23321] text-white rounded text-xs font-medium flex items-center space-x-1 cursor-pointer ml-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
