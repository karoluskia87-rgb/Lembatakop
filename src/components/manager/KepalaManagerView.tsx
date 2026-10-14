import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Award,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  Send,
  CheckSquare,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggal } from '../../utils/loanCalculations';
import { Pinjaman } from '../../types';

export const KepalaManagerView: React.FC = () => {
  const {
    pinjamanList,
    pembinaanList,
    tambahArahanPembinaan,
    selesaikanPembinaan,
    approvalPinjamanOlehManager,
    currentUser,
    cabangConfig,
    nasabahList,
    activeMenu,
    setActiveMenu,
    addToast,
  } = useApp();

  const getTabFromMenu = () => {
    if (activeMenu === 'manager-pembinaan') return 'pembinaan';
    if (activeMenu === 'manager-kesehatan') return 'kesehatan_ksp';
    return 'pengawasan';
  };

  const [activeTab, setActiveTab] = useState<'pengawasan' | 'pembinaan' | 'kesehatan_ksp'>(getTabFromMenu);

  useEffect(() => {
    setActiveTab(getTabFromMenu());
  }, [activeMenu]);

  // Loans needing manager approval (status: 'disetujui_unit')
  const managerPendingLoans = pinjamanList.filter((p) => p.status === 'disetujui_unit');
  const [selectedLoan, setSelectedLoan] = useState<Pinjaman | null>(managerPendingLoans[0] || null);

  useEffect(() => {
    if (!selectedLoan && managerPendingLoans.length > 0) {
      setSelectedLoan(managerPendingLoans[0]);
    }
  }, [managerPendingLoans, selectedLoan]);

  const [managerNotes, setManagerNotes] = useState('');
  const [approvalError, setApprovalError] = useState('');

  // Pembinaan form state
  const [targetStaf, setTargetStaf] = useState('Semua Petugas Lapangan Cabang Nubatukan');
  const [perihal, setPerihal] = useState('');
  const [kategori, setKategori] = useState<
    'mitigasi_risiko' | 'disiplin_kredit' | 'pembinaan_npl' | 'apresiasi_target' | 'kebijakan_operasional'
  >('mitigasi_risiko');
  const [isiArahan, setIsiArahan] = useState('');
  const [pembinaanError, setPembinaanError] = useState('');

  const handleApproval = (keputusan: 'disetujui' | 'ditolak') => {
    setApprovalError('');
    if (!selectedLoan) return;
    if (!managerNotes.trim()) {
      setApprovalError('Mohon masukkan catatan pengawasan atau arahan kebijakan Kepala Manager.');
      addToast('Catatan manajerial wajib diisi sebelum otorisasi!', 'error');
      return;
    }

    approvalPinjamanOlehManager(selectedLoan.id, managerNotes, keputusan);

    const remaining = managerPendingLoans.filter((p) => p.id !== selectedLoan.id);
    setSelectedLoan(remaining[0] || null);
    setManagerNotes('');
  };

  const handleKirimPembinaan = (e: React.FormEvent) => {
    e.preventDefault();
    setPembinaanError('');
    if (!perihal.trim() || !isiArahan.trim()) {
      setPembinaanError('Mohon isi perihal dan isi instruksi pembinaan staf.');
      addToast('Perihal dan isi arahan memo tidak boleh kosong.', 'error');
      return;
    }

    tambahArahanPembinaan(targetStaf, perihal, kategori, isiArahan);
    setPerihal('');
    setIsiArahan('');
  };

  const handleSwitchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'pengawasan') setActiveMenu('manager-pengawasan');
    else if (tab === 'pembinaan') setActiveMenu('manager-pembinaan');
    else if (tab === 'kesehatan_ksp') setActiveMenu('manager-kesehatan');
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-1 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <span>Tugas Kepala Manager</span>
            <small className="font-light text-xs text-gray-500 ml-2.5">
              Pembinaan Staf & Pengawasan Menyeluruh Cabang Nubatukan
            </small>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Pimpinan Cabang bertugas mengawasi portofolio pembiayaan, memitigasi risiko kredit macet, dan membina staf lapangan.
          </p>
        </div>
        <div className="text-xs text-gray-500 mt-2 sm:mt-0 flex items-center space-x-1">
          <span className="text-gray-400">Home</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Kepala Manager</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center bg-white border border-gray-200 rounded shadow-xs p-1 gap-1">
        <button
          onClick={() => handleSwitchTab('pengawasan')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'pengawasan'
              ? 'bg-[#f39c12] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>1. Pengawasan & Otorisasi Pinjaman ({managerPendingLoans.length})</span>
        </button>

        <button
          onClick={() => handleSwitchTab('pembinaan')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'pembinaan'
              ? 'bg-[#3c8dbc] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>2. Memo & Instruksi Pembinaan Staf</span>
        </button>

        <button
          onClick={() => handleSwitchTab('kesehatan_ksp')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'kesehatan_ksp'
              ? 'bg-[#00a65a] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>3. Audit Kesehatan & Likuiditas Cabang</span>
        </button>
      </div>

      {/* TAB 1: PENGAWASAN & OTORISASI PINJAMAN */}
      {activeTab === 'pengawasan' && (
        <div className="space-y-4">
          {approvalError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{approvalError}</span>
            </div>
          )}

          {managerPendingLoans.length === 0 ? (
            <div className="bg-white p-8 rounded border border-gray-200 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 text-[#f39c12] mx-auto mb-2" />
              <div className="font-bold text-gray-700 text-sm">Semua Otorisasi Telah Selesai</div>
              <p className="text-xs text-gray-500 mt-1">
                Tidak ada permohonan pinjaman yang menunggu otorisasi akhir Kepala Manager.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Kolom Kiri: Daftar Pinjaman Lolos Unit */}
              <div className="lg:col-span-1 bg-white rounded shadow-xs border-t-3 border-t-[#f39c12] border-x border-b border-gray-200">
                <div className="p-3 border-b border-gray-200 font-bold text-gray-800 text-xs">
                  Antrean Otorisasi Manager ({managerPendingLoans.length})
                </div>
                <div className="divide-y divide-gray-100">
                  {managerPendingLoans.map((loan) => (
                    <button
                      key={loan.id}
                      onClick={() => setSelectedLoan(loan)}
                      className={`w-full text-left p-3 hover:bg-amber-50/50 transition cursor-pointer ${
                        selectedLoan?.id === loan.id ? 'bg-amber-50 border-l-4 border-[#f39c12]' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900">{loan.nasabahNama}</span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                          {loan.kodePinjaman}
                        </span>
                      </div>
                      <div className="text-emerald-700 font-bold mt-1">
                        {formatRupiah(loan.jumlahPinjaman)} &bull; {loan.tenorBulan} Bln
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1">
                        Disetujui Unit: {loan.evaluatorUnit}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kolom Kanan: Lembar Otorisasi Manager */}
              {selectedLoan && (
                <div className="lg:col-span-2 bg-white rounded shadow-xs border-t-3 border-t-[#f39c12] border-x border-b border-gray-200 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">
                        Otorisasi Pencairan Pinjaman: {selectedLoan.nasabahNama}
                      </h2>
                      <div className="text-gray-500 text-[11px]">
                        Kantor Cabang Nubatukan &bull; Suku Bunga 0,5% Menurun
                      </div>
                    </div>
                    <span className="bg-[#00c0ef] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      Rekomendasi Kepala Unit: Lolos
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Nominal Permohonan:</span>
                      <span className="font-bold text-gray-900 text-sm font-mono">
                        {formatRupiah(selectedLoan.jumlahPinjaman)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Jangka Waktu (Tenor):</span>
                      <span className="font-bold text-gray-800">
                        {selectedLoan.tenorBulan} Bulan (Angsuran menurun per bulan)
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Agunan & Jaminan:</span>
                      <span className="font-medium text-gray-700">{selectedLoan.jaminan}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px]">Tujuan Usaha:</span>
                      <span className="font-medium text-gray-700">{selectedLoan.tujuanPinjaman}</span>
                    </div>
                  </div>

                  {/* Catatan dari Kepala Unit */}
                  <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs">
                    <span className="font-bold text-emerald-900 block mb-0.5">
                      Catatan Evaluasi Kepala Unit ({selectedLoan.evaluatorUnit}):
                    </span>
                    <p className="text-emerald-800 italic">"{selectedLoan.catatanUnit}"</p>
                  </div>

                  {/* Input Arahan Kepala Manager */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Catatan Pengawasan & Arahan Manajerial (Wajib Diisi Pimpinan) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Contoh: Disetujui pencairan bertahap / Ingatkan petugas lapangan untuk monitoring rutin setiap tanggal 10..."
                      value={managerNotes}
                      onChange={(e) => setManagerNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex justify-end space-x-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleApproval('ditolak')}
                      className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-4 py-2 rounded font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak Otorisasi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproval('disetujui')}
                      className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-2 rounded font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Sahkan & Otorisasi Pencairan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MEMO & INSTRUKSI PEMBINAAN STAF */}
      {activeTab === 'pembinaan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Form Buat Memo Pembinaan */}
          <div className="lg:col-span-1 bg-white rounded shadow-xs border-t-3 border-t-[#3c8dbc] border-x border-b border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 text-sm flex items-center mb-3">
              <FileText className="w-4 h-4 text-[#3c8dbc] mr-2" />
              Terbitkan Arahan Pembinaan Staf
            </h2>

            {pembinaanError && (
              <div className="mb-3 p-2 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-1.5 text-[11px]">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{pembinaanError}</span>
              </div>
            )}

            <form onSubmit={handleKirimPembinaan} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Target Staf *</label>
                <select
                  value={targetStaf}
                  onChange={(e) => setTargetStaf(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="Semua Petugas Lapangan Cabang Nubatukan">
                    Semua Petugas Lapangan
                  </option>
                  <option value="Yohanes Bapa, S.E. (Petugas Lapangan 1)">
                    Yohanes Bapa, S.E. (Petugas 1)
                  </option>
                  <option value="Antonius Demon, S.P. (Petugas Lapangan 2)">
                    Antonius Demon, S.P. (Petugas 2)
                  </option>
                  <option value="Maria Goreti Kewa, S.Ak. (Kepala Unit)">
                    Maria Goreti Kewa (Kepala Unit)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Kategori Pembinaan *
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as any)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                >
                  <option value="mitigasi_risiko">Mitigasi Risiko Kredit</option>
                  <option value="disiplin_kredit">Disiplin SOP Verifikasi Dokumen</option>
                  <option value="pembinaan_npl">Pembinaan Debitur NPL / Kol 2</option>
                  <option value="apresiasi_target">Apresiasi Capaian Target</option>
                  <option value="kebijakan_operasional">Kebijakan Operasional Cabang</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Perihal Memo *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Evaluasi Kunjungan Wilayah Pesisir"
                  value={perihal}
                  onChange={(e) => setPerihal(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Isi Instruksi *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan petunjuk teknis pembinaan, target penagihan, atau catatan perbaikan..."
                  value={isiArahan}
                  onChange={(e) => setIsiArahan(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#3c8dbc] hover:bg-[#367fa9] text-white py-2 rounded font-bold text-xs flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Terbitkan Memo Pembinaan</span>
              </button>
            </form>
          </div>

          {/* Daftar Memo Pembinaan yang Berlaku */}
          <div className="lg:col-span-2 bg-white rounded shadow-xs border-t-3 border-t-[#3c8dbc] border-x border-b border-gray-200 p-4">
            <h3 className="font-bold text-gray-800 text-xs sm:text-sm mb-3">
              Riwayat Instruksi & Pembinaan Pimpinan Cabang Nubatukan
            </h3>

            <div className="space-y-3">
              {pembinaanList.map((memo) => (
                <div
                  key={memo.id}
                  className={`p-3 rounded border ${
                    memo.statusTindakLanjut === 'selesai'
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50/40 border-blue-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-1 pb-1 border-b border-gray-200/60">
                    <div>
                      <span className="font-bold text-gray-900 text-xs">{memo.perihal}</span>
                      <span className="text-[10px] text-gray-500 ml-2">
                        &bull; Kepada: <strong className="text-blue-700">{memo.targetStaf}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          memo.statusTindakLanjut === 'selesai'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {memo.statusTindakLanjut === 'selesai' ? 'Selesai' : 'Dalam Proses Tindak Lanjut'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {formatTanggal(memo.tanggal)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-xs mt-2 leading-relaxed">{memo.isiArahan}</p>

                  <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 italic">Diterbitkan oleh: {memo.dibuatOleh}</span>
                    {memo.statusTindakLanjut === 'dalam_proses' && (
                      <button
                        onClick={() => selesaikanPembinaan(memo.id)}
                        className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-2.5 py-1 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <CheckSquare className="w-3 h-3" />
                        <span>Tandai Selesai Tindak Lanjut</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT KESEHATAN & LIKUIDITAS CABANG */}
      {activeTab === 'kesehatan_ksp' && (
        <div className="bg-white rounded shadow-xs border-t-3 border-t-[#00a65a] border-x border-b border-gray-200 p-4 space-y-4">
          <h2 className="font-bold text-gray-800 text-sm flex items-center">
            <TrendingUp className="w-4 h-4 text-[#00a65a] mr-2" />
            Audit Rasio Keuangan & Pengawasan Likuiditas (KSP Cabang Nubatukan)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
              <span className="text-gray-500 text-[10px]">Non-Performing Loan (NPL)</span>
              <div className="text-xl font-black text-emerald-700 mt-0.5">1.6%</div>
              <p className="text-[10px] text-emerald-800 mt-1">Status: SANGAT SEHAT (Batas OJK/Kemenkop: maks 5%)</p>
            </div>

            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <span className="text-gray-500 text-[10px]">Loan to Deposit Ratio (LDR)</span>
              <div className="text-xl font-black text-blue-700 mt-0.5">82.4%</div>
              <p className="text-[10px] text-blue-800 mt-1">Status: LIKUIDITAS AMAN (Rentang ideal 80% - 90%)</p>
            </div>

            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <span className="text-gray-500 text-[10px]">Beban Operasional (BOPO)</span>
              <div className="text-xl font-black text-amber-700 mt-0.5">71.8%</div>
              <p className="text-[10px] text-amber-800 mt-1">Status: EFISIEN (Batas maksimal 85%)</p>
            </div>

            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <span className="text-gray-500 text-[10px]">Suku Bunga Kredit Kebijakan</span>
              <div className="text-xl font-black text-purple-700 mt-0.5">0.5% Menurun</div>
              <p className="text-[10px] text-purple-800 mt-1">Skema adil & diminati nasabah Lembata</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
