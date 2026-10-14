import React, { useState } from 'react';
import {
  User as UserIcon,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building,
  Key,
  CreditCard,
  ClipboardCheck,
  ShieldAlert,
  UserCog,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { login, quickSwitchRole, cabangConfig } = useApp();

  const [username, setUsername] = useState('petugas');
  const [password, setPassword] = useState('petugas123');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = login(username, password);
    if (!success) {
      setErrorMsg('Username atau password salah! Silakan coba lagi atau gunakan tombol login cepat.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    quickSwitchRole(role);
  };

  return (
    <div className="min-h-screen bg-[#d2d6de] flex flex-col justify-center items-center p-4 font-sans text-xs">
      {/* Brand Header */}
      <div className="mb-4 text-center">
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
          <b>KSP</b> <span className="font-light text-blue-700">NUBATUKAN</span>
        </div>
        <p className="text-xs text-gray-600 font-medium mt-1">
          {cabangConfig.namaKoperasi} &bull; {cabangConfig.namaCabang}
        </p>
        <div className="mt-1 inline-flex items-center space-x-1 bg-[#00a65a] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-xs">
          <Percent className="w-3 h-3" />
          <span>Suku Bunga 0,5% Per Bulan Menurun</span>
        </div>
      </div>

      {/* Main Login Box (AdminLTE classic login-box) */}
      <div className="w-full max-w-md bg-white rounded shadow-lg overflow-hidden border border-gray-200">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="text-center pb-2 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-800">
              Sign In untuk Memulai Sesi Kerja
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Masukkan kredensial akun Petugas, Unit, Manager, atau Admin
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Username Petugas / Pengguna
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Username (petugas / unit / manager / admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs pr-8 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-xs pr-8 focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-2.5 top-2.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#3c8dbc] hover:bg-[#367fa9] text-white py-2.5 rounded font-bold text-xs flex items-center justify-center space-x-2 shadow-xs cursor-pointer transition"
            >
              <span>SIGN IN KE SISTEM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-gray-400 uppercase font-semibold">
              Atau Pilih Akses Cepat (4 Peran Pengguna)
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* 4 Quick Access Buttons corresponding strictly to user brief */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {/* 1. Petugas Lapangan */}
            <button
              type="button"
              onClick={() => handleQuickLogin('petugas')}
              className="p-2.5 rounded border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 transition flex items-center space-x-2 text-cyan-950 cursor-pointer"
            >
              <CreditCard className="w-5 h-5 text-[#00c0ef] shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">1. Petugas Lapangan</div>
                <div className="text-[10px] text-cyan-800">Input Pinjaman & Simpanan</div>
              </div>
            </button>

            {/* 2. Kepala Unit */}
            <button
              type="button"
              onClick={() => handleQuickLogin('kepala_unit')}
              className="p-2.5 rounded border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 transition flex items-center space-x-2 text-emerald-950 cursor-pointer"
            >
              <ClipboardCheck className="w-5 h-5 text-[#00a65a] shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">2. Kepala Unit</div>
                <div className="text-[10px] text-emerald-800">Monitoring & Evaluasi 5C</div>
              </div>
            </button>

            {/* 3. Kepala Manager */}
            <button
              type="button"
              onClick={() => handleQuickLogin('kepala_manager')}
              className="p-2.5 rounded border border-amber-200 bg-amber-50/70 hover:bg-amber-100 transition flex items-center space-x-2 text-amber-950 cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 text-[#f39c12] shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">3. Kepala Manager</div>
                <div className="text-[10px] text-amber-800">Pembinaan & Pengawasan</div>
              </div>
            </button>

            {/* 4. Admin */}
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-2.5 rounded border border-rose-200 bg-rose-50/70 hover:bg-rose-100 transition flex items-center space-x-2 text-rose-950 cursor-pointer"
            >
              <UserCog className="w-5 h-5 text-[#dd4b39] shrink-0" />
              <div className="min-w-0">
                <div className="font-bold text-[11px] truncate">4. Admin Sistem</div>
                <div className="text-[10px] text-rose-800">Edit Password & User</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer info box */}
        <div className="bg-gray-100 p-3 border-t border-gray-200 text-center text-[10px] text-gray-500">
          <div>Kantor Cabang Nubatukan &bull; Kab. Lembata, Nusa Tenggara Timur</div>
          <div className="mt-0.5 text-gray-400">
            Perhitungan Bunga 0,5% Menurun Berdasarkan Sisa Pokok Pinjaman
          </div>
        </div>
      </div>
    </div>
  );
};
