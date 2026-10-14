import React, { useState } from 'react';
import { Calculator, Printer, X, CheckCircle, Info, TrendingDown } from 'lucide-react';
import {
  hitungSimulasiBungaMenurun,
  formatRupiah,
} from '../../utils/loanCalculations';
import { useApp } from '../../context/AppContext';

interface SimulasiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulasiModal: React.FC<SimulasiModalProps> = ({ isOpen, onClose }) => {
  const { cabangConfig } = useApp();
  const [pokok, setPokok] = useState<number>(15000000);
  const [tenor, setTenor] = useState<number>(12);
  const bungaRate = 0.5; // 0.5% per bulan menurun

  if (!isOpen) return null;

  const hasil = hitungSimulasiBungaMenurun(pokok, tenor, bungaRate);

  // Perbandingan dengan bunga flat 0.5% flat untuk menunjukkan transparansi
  const bungaFlatTotal = Math.round(pokok * (bungaRate / 100) * tenor);
  const hematBunga = bungaFlatTotal - hasil.totalBunga;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs font-sans border border-gray-200">
        {/* Header (AdminLTE classic blue) */}
        <div className="bg-[#3c8dbc] text-white p-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-yellow-300" />
            <div>
              <h2 className="font-bold text-sm">
                Kalkulator & Tabel Simulasi Bunga 0,5% Menurun
              </h2>
              <div className="text-[11px] text-blue-100">
                {cabangConfig.namaKoperasi} &bull; {cabangConfig.namaCabang}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Controls Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-200">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Plafon Pinjaman (Pokok)
              </label>
              <input
                type="number"
                step={1000000}
                min={1000000}
                value={pokok}
                onChange={(e) => setPokok(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-blue-500 outline-none"
              />
              <div className="text-[10px] text-gray-500 mt-0.5">
                {formatRupiah(pokok)}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Jangka Waktu (Tenor)
              </label>
              <select
                value={tenor}
                onChange={(e) => setTenor(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value={6}>6 Bulan</option>
                <option value={10}>10 Bulan</option>
                <option value={12}>12 Bulan (1 Tahun)</option>
                <option value={18}>18 Bulan</option>
                <option value={24}>24 Bulan (2 Tahun)</option>
                <option value={36}>36 Bulan (3 Tahun)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Suku Bunga KSP Nubatukan
              </label>
              <div className="border border-emerald-300 bg-emerald-50 text-emerald-900 rounded px-2.5 py-1.5 text-xs font-bold flex items-center justify-between">
                <span>0,5% / Bulan</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.2 rounded">
                  Menurun (Declining)
                </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">
                Bunga dihitung dari sisa pokok berjalan
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-gray-500 font-semibold mr-1">Preset Nominal:</span>
            {[5000000, 10000000, 15000000, 25000000, 50000000].map((nom) => (
              <button
                key={nom}
                onClick={() => setPokok(nom)}
                className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                  pokok === nom
                    ? 'bg-[#3c8dbc] text-white border-[#3c8dbc] font-bold'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {formatRupiah(nom)}
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-blue-50 rounded border border-blue-200 text-center">
              <span className="text-gray-500 text-[10px] block">Angsuran Bulan ke-1</span>
              <span className="font-bold text-blue-800 text-sm">
                {formatRupiah(hasil.angsuranBulanPertama)}
              </span>
              <div className="text-[9px] text-gray-400 mt-0.5">Pokok + Bunga awal</div>
            </div>

            <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-center">
              <span className="text-gray-500 text-[10px] block">Angsuran Bulan Terakhir</span>
              <span className="font-bold text-emerald-700 text-sm">
                {formatRupiah(hasil.angsuranBulanTerakhir)}
              </span>
              <div className="text-[9px] text-emerald-600 mt-0.5">Semakin ringan setiap bulan!</div>
            </div>

            <div className="p-3 bg-amber-50 rounded border border-amber-200 text-center">
              <span className="text-gray-500 text-[10px] block">Total Bunga Selama {tenor} Bln</span>
              <span className="font-bold text-amber-700 text-sm">
                {formatRupiah(hasil.totalBunga)}
              </span>
              <div className="text-[9px] text-amber-600 mt-0.5">
                Efektif hanya ~{((hasil.totalBunga / pokok) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded border border-indigo-200 text-center">
              <span className="text-gray-500 text-[10px] block">Total Pengembalian</span>
              <span className="font-bold text-indigo-900 text-sm">
                {formatRupiah(hasil.totalPembayaran)}
              </span>
              <div className="text-[9px] text-indigo-600 mt-0.5">Pokok + Total Bunga</div>
            </div>
          </div>

          {/* Detail Amortization Table */}
          <div className="border border-gray-200 rounded overflow-hidden">
            <div className="bg-gray-100 p-2 border-b border-gray-200 flex justify-between items-center font-bold text-gray-800 text-xs">
              <span>Tabel Angsuran Lengkap Bulan ke-1 s/d Bulan ke-{tenor}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">
                Bunga Menurun (0,5% &times; Sisa Pokok)
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 border-b border-gray-200 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="p-2">Bulan Ke</th>
                    <th className="p-2">Sisa Pokok Awal</th>
                    <th className="p-2">Angsuran Pokok</th>
                    <th className="p-2 text-amber-700">Bunga (0,5%)</th>
                    <th className="p-2 font-bold text-emerald-800">Total Angsuran</th>
                    <th className="p-2">Sisa Pokok Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {hasil.jadwal.map((j) => (
                    <tr key={j.bulanKe} className="hover:bg-blue-50/40">
                      <td className="p-2 font-sans font-bold text-gray-700">Bln #{j.bulanKe}</td>
                      <td className="p-2">{formatRupiah(j.sisaPokokAwal)}</td>
                      <td className="p-2">{formatRupiah(j.angsuranPokok)}</td>
                      <td className="p-2 font-bold text-amber-700">
                        {formatRupiah(j.bungaBulanIni)}
                      </td>
                      <td className="p-2 font-bold text-emerald-700 bg-emerald-50/30">
                        {formatRupiah(j.totalAngsuran)}
                      </td>
                      <td className="p-2 text-gray-500">{formatRupiah(j.sisaPokokAkhir)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500">
            * Cetakan resmi ini dapat dilampirkan dalam akad perjanjian kredit nasabah.
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-4 py-1.5 rounded font-bold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Lembar Simulasi</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1.5 rounded font-medium text-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
