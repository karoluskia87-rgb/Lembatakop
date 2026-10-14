import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  PiggyBank,
  ClipboardCheck,
  ShieldAlert,
  UserCog,
  Calculator,
  Search,
  ChevronRight,
  ChevronDown,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  onOpenSimulasi: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSimulasi }) => {
  const {
    currentUser,
    activeMenu,
    setActiveMenu,
    sidebarCollapsed,
    searchTerm,
    setSearchTerm,
    pinjamanList,
    nasabahList,
  } = useApp();

  // Collapsible sub-tree state
  const [openSubTree, setOpenSubTree] = useState(true);

  const pendingUnitCount = pinjamanList.filter((p) => p.status === 'menunggu_evaluasi').length;
  const pendingManagerCount = pinjamanList.filter((p) => p.status === 'disetujui_unit').length;
  const nplCount = pinjamanList.filter((p) => p.kolektibilitas > 1).length;

  const role = currentUser?.role;

  if (sidebarCollapsed) {
    return (
      <aside className="w-[50px] bg-[#222d32] text-[#b8c7ce] flex flex-col shrink-0 select-none py-3 items-center space-y-4 min-h-[calc(100vh-50px)]">
        <button
          onClick={() => setActiveMenu('dashboard')}
          title="Dashboard Progres"
          className={`p-2 rounded hover:text-white hover:bg-[#1e282c] ${
            activeMenu === 'dashboard' ? 'text-white bg-[#1e282c]' : ''
          }`}
        >
          <LayoutDashboard className="w-5 h-5 text-[#00c0ef]" />
        </button>

        {role === 'petugas' && (
          <button
            onClick={() => setActiveMenu('petugas-input-nasabah')}
            title="Menu Petugas Lapangan"
            className={`p-2 rounded hover:text-white hover:bg-[#1e282c] ${
              activeMenu.startsWith('petugas-') ? 'text-white bg-[#1e282c]' : ''
            }`}
          >
            <CreditCard className="w-5 h-5 text-[#00c0ef]" />
          </button>
        )}

        {role === 'kepala_unit' && (
          <button
            onClick={() => setActiveMenu('unit-evaluasi')}
            title="Menu Kepala Unit"
            className={`p-2 rounded hover:text-white hover:bg-[#1e282c] ${
              activeMenu.startsWith('unit-') ? 'text-white bg-[#1e282c]' : ''
            }`}
          >
            <ClipboardCheck className="w-5 h-5 text-[#00a65a]" />
          </button>
        )}

        {role === 'kepala_manager' && (
          <button
            onClick={() => setActiveMenu('manager-pengawasan')}
            title="Menu Kepala Manager"
            className={`p-2 rounded hover:text-white hover:bg-[#1e282c] ${
              activeMenu.startsWith('manager-') ? 'text-white bg-[#1e282c]' : ''
            }`}
          >
            <ShieldAlert className="w-5 h-5 text-[#f39c12]" />
          </button>
        )}

        {role === 'admin' && (
          <button
            onClick={() => setActiveMenu('admin-users')}
            title="Menu Admin Sistem"
            className={`p-2 rounded hover:text-white hover:bg-[#1e282c] ${
              activeMenu.startsWith('admin-') ? 'text-white bg-[#1e282c]' : ''
            }`}
          >
            <UserCog className="w-5 h-5 text-[#dd4b39]" />
          </button>
        )}

        <button
          onClick={onOpenSimulasi}
          title="Kalkulator Simulasi Kredit"
          className="p-2 rounded hover:text-white hover:bg-[#1e282c]"
        >
          <Calculator className="w-5 h-5 text-yellow-400" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-[230px] bg-[#222d32] text-[#b8c7ce] flex flex-col shrink-0 select-none text-xs min-h-[calc(100vh-50px)] font-sans border-r border-[#1a2226]">
      {/* User Panel (AdminLTE Classic) */}
      <div className="p-3 bg-[#1a2226]/50 flex items-center space-x-3 border-b border-[#1e282c]">
        <img
          src={currentUser?.avatar}
          alt={currentUser?.name}
          className="w-10 h-10 rounded-full object-cover border border-[#4b646f]"
        />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate text-xs leading-tight">
            {currentUser?.name || 'Pengguna'}
          </p>
          <div className="flex items-center text-[10px] text-gray-400 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#00a65a] mr-1.5 animate-pulse" />
            <span className="capitalize font-medium text-emerald-400">
              {role?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="p-2.5">
        <div className="flex items-center bg-[#374850] rounded px-2.5 py-1.5 text-white">
          <input
            type="text"
            placeholder="Cari menu / data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs outline-none w-full text-white placeholder-gray-400"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </div>
      </div>

      {/* Navigation Header */}
      <div className="px-3 py-2 text-[10px] font-bold text-[#4b646f] tracking-wider uppercase">
        MAIN NAVIGATION
      </div>

      {/* Menu Tree List */}
      <div className="flex-1 overflow-y-auto space-y-0.5 pb-6">
        {/* Dashboard (Selalu Tampil untuk Semua User) */}
        <button
          onClick={() => setActiveMenu('dashboard')}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left cursor-pointer ${
            activeMenu === 'dashboard'
              ? 'bg-[#1e282c] text-white border-l-4 border-[#3c8dbc] font-medium'
              : 'hover:bg-[#1e282c] hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <LayoutDashboard className="w-4 h-4 text-[#00c0ef]" />
            <span>Dashboard Progres</span>
          </div>
          <span className="px-1.5 py-0.5 bg-[#00a65a] text-white text-[10px] font-semibold rounded">
            Live
          </span>
        </button>

        {/* 1. HANYA UNTUK USER: PETUGAS LAPANGAN */}
        {role === 'petugas' && (
          <div>
            <button
              onClick={() => setOpenSubTree(!openSubTree)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left cursor-pointer ${
                activeMenu.startsWith('petugas-')
                  ? 'bg-[#1e282c] text-white border-l-4 border-[#00c0ef]'
                  : 'hover:bg-[#1e282c] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <CreditCard className="w-4 h-4 text-[#00c0ef]" />
                <span className="font-medium text-gray-200">Menu Petugas Lapangan</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="px-1.5 py-0.2 bg-[#00c0ef] text-white text-[10px] rounded font-bold">
                  {nasabahList.length}
                </span>
                {openSubTree ? (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </button>

            {openSubTree && (
              <div className="bg-[#2c3b41] py-1 text-[11px] space-y-0.5">
                <button
                  onClick={() => setActiveMenu('petugas-input-nasabah')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'petugas-input-nasabah'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-300" />
                  <span>Input Data Peminjam & KK</span>
                </button>

                <button
                  onClick={() => setActiveMenu('petugas-pinjaman')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'petugas-pinjaman'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 text-green-300" />
                  <span>Permohonan Pinjaman</span>
                </button>

                <button
                  onClick={() => setActiveMenu('petugas-simpanan')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'petugas-simpanan'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <PiggyBank className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Input Transaksi Simpanan</span>
                </button>

                <button
                  onClick={() => setActiveMenu('petugas-angsuran')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'petugas-angsuran'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bayar Angsuran & Kwitansi</span>
                </button>

                <button
                  onClick={() => setActiveMenu('petugas-data')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'petugas-data'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-gray-300" />
                  <span>Daftar Nasabah Binaan</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. HANYA UNTUK USER: KEPALA UNIT */}
        {role === 'kepala_unit' && (
          <div>
            <button
              onClick={() => setOpenSubTree(!openSubTree)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left cursor-pointer ${
                activeMenu.startsWith('unit-')
                  ? 'bg-[#1e282c] text-white border-l-4 border-[#00a65a]'
                  : 'hover:bg-[#1e282c] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ClipboardCheck className="w-4 h-4 text-[#00a65a]" />
                <span className="font-medium text-gray-200">Menu Kepala Unit</span>
              </div>
              <div className="flex items-center space-x-1">
                {pendingUnitCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#f39c12] text-white text-[10px] rounded font-bold">
                    {pendingUnitCount}
                  </span>
                )}
                {openSubTree ? (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </button>

            {openSubTree && (
              <div className="bg-[#2c3b41] py-1 text-[11px] space-y-0.5">
                <button
                  onClick={() => setActiveMenu('unit-evaluasi')}
                  className={`w-full flex items-center justify-between px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'unit-evaluasi'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span>Evaluasi Pinjaman (5C)</span>
                  </div>
                  {pendingUnitCount > 0 && (
                    <span className="bg-[#dd4b39] text-white text-[9px] px-1 rounded font-bold">
                      {pendingUnitCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveMenu('unit-monitoring')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'unit-monitoring'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Monitoring Target Lapangan</span>
                </button>

                <button
                  onClick={() => setActiveMenu('unit-npl')}
                  className={`w-full flex items-center justify-between px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'unit-npl'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Evaluasi NPL / Kolektibilitas</span>
                  </div>
                  {nplCount > 0 && (
                    <span className="bg-[#f39c12] text-white text-[9px] px-1 rounded font-bold">
                      {nplCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 3. HANYA UNTUK USER: KEPALA MANAGER */}
        {role === 'kepala_manager' && (
          <div>
            <button
              onClick={() => setOpenSubTree(!openSubTree)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left cursor-pointer ${
                activeMenu.startsWith('manager-')
                  ? 'bg-[#1e282c] text-white border-l-4 border-[#f39c12]'
                  : 'hover:bg-[#1e282c] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-[#f39c12]" />
                <span className="font-medium text-gray-200">Menu Kepala Manager</span>
              </div>
              <div className="flex items-center space-x-1">
                {pendingManagerCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-[#00a65a] text-white text-[10px] rounded font-bold">
                    {pendingManagerCount}
                  </span>
                )}
                {openSubTree ? (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </button>

            {openSubTree && (
              <div className="bg-[#2c3b41] py-1 text-[11px] space-y-0.5">
                <button
                  onClick={() => setActiveMenu('manager-pengawasan')}
                  className={`w-full flex items-center justify-between px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'manager-pengawasan'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Pengawasan & Otorisasi</span>
                  </div>
                  {pendingManagerCount > 0 && (
                    <span className="bg-[#00a65a] text-white text-[9px] px-1 rounded font-bold">
                      {pendingManagerCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveMenu('manager-pembinaan')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'manager-pembinaan'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-orange-300" />
                  <span>Memo Pembinaan Staf</span>
                </button>

                <button
                  onClick={() => setActiveMenu('manager-kesehatan')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'manager-kesehatan'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Audit Kesehatan & Likuiditas</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. HANYA UNTUK USER: ADMIN SISTEM */}
        {role === 'admin' && (
          <div>
            <button
              onClick={() => setOpenSubTree(!openSubTree)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 transition-colors text-left cursor-pointer ${
                activeMenu.startsWith('admin-')
                  ? 'bg-[#1e282c] text-white border-l-4 border-[#dd4b39]'
                  : 'hover:bg-[#1e282c] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <UserCog className="w-4 h-4 text-[#dd4b39]" />
                <span className="font-medium text-gray-200">Menu Admin Sistem</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="px-1.5 py-0.2 bg-[#dd4b39] text-white text-[10px] rounded font-bold">
                  Admin
                </span>
                {openSubTree ? (
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </button>

            {openSubTree && (
              <div className="bg-[#2c3b41] py-1 text-[11px] space-y-0.5">
                <button
                  onClick={() => setActiveMenu('admin-users')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'admin-users'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <UserCog className="w-3.5 h-3.5 text-red-300" />
                  <span>Edit User & Password</span>
                </button>

                <button
                  onClick={() => setActiveMenu('admin-cabang')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'admin-cabang'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-red-300" />
                  <span>Profil Cabang Nubatukan</span>
                </button>

                <button
                  onClick={() => setActiveMenu('admin-system')}
                  className={`w-full flex items-center space-x-2.5 px-6 py-2 transition text-left cursor-pointer ${
                    activeMenu === 'admin-system'
                      ? 'text-white bg-[#1e282c] font-semibold'
                      : 'text-gray-300 hover:text-white hover:bg-[#202d33]'
                  }`}
                >
                  <Percent className="w-3.5 h-3.5 text-red-300" />
                  <span>Pemeliharaan & Reset Data</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Simulasi Kredit Shortcut (Tampil untuk Semua User) */}
        <button
          onClick={onOpenSimulasi}
          className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-[#1e282c] hover:text-white transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Calculator className="w-4 h-4 text-yellow-400" />
            <span>Simulasi Bunga 0.5% Menurun</span>
          </div>
          <span className="px-1.5 py-0.5 bg-[#f39c12] text-white text-[9px] rounded font-bold">
            Simulasi
          </span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#1a2226] text-[10px] text-gray-400 border-t border-[#1e282c]">
        <div className="font-semibold text-gray-300">KSP Swasti Mandiri</div>
        <div>Cabang Nubatukan, Lembata</div>
        <div className="text-[9px] text-[#00c0ef] mt-1 font-mono">Bunga 0.5% / bln menurun</div>
      </div>
    </aside>
  );
};
