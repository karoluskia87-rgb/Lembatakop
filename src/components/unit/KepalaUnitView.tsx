import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  FileText,
  Star,
  Info,
  Sliders,
  DollarSign,
  Phone,
  Building,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatTanggal, getKolektibilitasLabel } from '../../utils/loanCalculations';
import { Pinjaman } from '../../types';

export const KepalaUnitView: React.FC = () => {
  const {
    pinjamanList,
    nasabahList,
    evaluasiList,
    evaluasiPinjamanOlehUnit,
    currentUser,
    users,
    activeMenu,
    setActiveMenu,
    addToast,
    openWhatsAppReminder,
    kirimSemuaWaJatuhTempoOtomatis,
  } = useApp();

  const getTabFromMenu = () => {
    if (activeMenu === 'unit-monitoring') return 'monitoring';
    if (activeMenu === 'unit-npl') return 'kolektibilitas';
    return 'evaluasi';
  };

  const [activeTab, setActiveTab] = useState<'monitoring' | 'evaluasi' | 'kolektibilitas'>(getTabFromMenu);

  useEffect(() => {
    setActiveTab(getTabFromMenu());
  }, [activeMenu]);

  // Selected Pinjaman to evaluate
  const pendingLoans = pinjamanList.filter((p) => p.status === 'menunggu_evaluasi');
  const [selectedLoanToEval, setSelectedLoanToEval] = useState<Pinjaman | null>(pendingLoans[0] || null);

  useEffect(() => {
    if (!selectedLoanToEval && pendingLoans.length > 0) {
      setSelectedLoanToEval(pendingLoans[0]);
    }
  }, [pendingLoans, selectedLoanToEval]);

  // 5C Scoring Form State
  const [charScore, setCharScore] = useState(85);
  const [capScore, setCapScore] = useState(85);
  const [capitalScore, setCapitalScore] = useState(80);
  const [collateralScore, setCollateralScore] = useState(90);
  const [conditionScore, setConditionScore] = useState(85);
  const [evalNotes, setEvalNotes] = useState('');
  const [evalError, setEvalError] = useState('');

  const avgScore = Math.round(
    (charScore + capScore + capitalScore + collateralScore + conditionScore) / 5
  );

  const handleEvaluate = (keputusan: 'disetujui' | 'ditolak') => {
    setEvalError('');
    if (!selectedLoanToEval) return;
    if (!evalNotes.trim()) {
      setEvalError('Mohon masukkan catatan evaluasi dan telaah kelayakan dari Kepala Unit.');
      addToast('Catatan evaluasi wajib diisi sebelum menyimpan keputusan.', 'error');
      return;
    }

    evaluasiPinjamanOlehUnit(
      selectedLoanToEval.id,
      charScore,
      capScore,
      capitalScore,
      collateralScore,
      conditionScore,
      evalNotes,
      keputusan
    );

    // switch to next or clear
    const remaining = pendingLoans.filter((p) => p.id !== selectedLoanToEval.id);
    setSelectedLoanToEval(remaining[0] || null);
    setEvalNotes('');
  };

  const handleSwitchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'monitoring') setActiveMenu('unit-monitoring');
    else if (tab === 'evaluasi') setActiveMenu('unit-evaluasi');
    else if (tab === 'kolektibilitas') setActiveMenu('unit-npl');
  };

  const petugasUsers = users.filter((u) => u.role === 'petugas');

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-1 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <span>Tugas Kepala Unit</span>
            <small className="font-light text-xs text-gray-500 ml-2.5">
              Monitoring Kinerja & Evaluasi Kelayakan Pinjaman 5C
            </small>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Wewenang Kepala Unit: Memonitoring kinerja petugas lapangan dan mengevaluasi seluruh permohonan pinjaman nasabah.
          </p>
        </div>
        <div className="text-xs text-gray-500 mt-2 sm:mt-0 flex items-center space-x-1">
          <span className="text-gray-400">Home</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Kepala Unit</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center bg-white border border-gray-200 rounded shadow-xs p-1 gap-1">
        <button
          onClick={() => handleSwitchTab('evaluasi')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'evaluasi'
              ? 'bg-[#00a65a] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5" />
          <span>1. Evaluasi Permohonan Pinjaman ({pendingLoans.length})</span>
        </button>

        <button
          onClick={() => handleSwitchTab('monitoring')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'monitoring'
              ? 'bg-[#3c8dbc] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>2. Monitoring Kinerja Petugas Lapangan</span>
        </button>

        <button
          onClick={() => handleSwitchTab('kolektibilitas')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'kolektibilitas'
              ? 'bg-[#f39c12] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>3. Monitoring Kolektibilitas & NPL</span>
        </button>
      </div>

      {/* TAB 1: EVALUASI PERMOHONAN PINJAMAN (5C) */}
      {activeTab === 'evaluasi' && (
        <div className="space-y-4">
          {evalError && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{evalError}</span>
            </div>
          )}

          {pendingLoans.length === 0 ? (
            <div className="bg-white p-8 rounded border border-gray-200 text-center text-gray-500">
              <CheckCircle className="w-12 h-12 text-[#00a65a] mx-auto mb-2" />
              <div className="font-bold text-gray-700 text-sm">Semua Permohonan Selesai Dievaluasi</div>
              <p className="text-xs text-gray-500 mt-1">
                Tidak ada permohonan pinjaman baru yang menunggu tindakan Kepala Unit saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Kolom Kiri: Daftar antrean pengajuan */}
              <div className="lg:col-span-1 bg-white rounded shadow-xs border-t-3 border-t-[#00a65a] border-x border-b border-gray-200">
                <div className="p-3 border-b border-gray-200 font-bold text-gray-800 text-xs">
                  Antrean Permohonan Masuk ({pendingLoans.length})
                </div>
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {pendingLoans.map((loan) => (
                    <button
                      key={loan.id}
                      onClick={() => setSelectedLoanToEval(loan)}
                      className={`w-full text-left p-3 hover:bg-blue-50/50 transition cursor-pointer ${
                        selectedLoanToEval?.id === loan.id ? 'bg-emerald-50/70 border-l-4 border-[#00a65a]' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-gray-900">{loan.nasabahNama}</span>
                        <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          {loan.kodePinjaman}
                        </span>
                      </div>
                      <div className="text-emerald-700 font-bold mt-1">
                        {formatRupiah(loan.jumlahPinjaman)} &bull; {loan.tenorBulan} Bln
                      </div>
                      <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                        <span>Petugas: {loan.petugasNama}</span>
                        <span>{formatTanggal(loan.tanggalPengajuan)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kolom Tengah & Kanan: Lembar Kerja Analisis 5C Kepala Unit */}
              {selectedLoanToEval && (
                <div className="lg:col-span-2 bg-white rounded shadow-xs border-t-3 border-t-[#00a65a] border-x border-b border-gray-200 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div>
                      <h2 className="font-bold text-gray-900 text-sm">
                        Analisis 5C & Evaluasi Pinjaman: {selectedLoanToEval.nasabahNama}
                      </h2>
                      <div className="text-gray-500 text-[11px]">
                        NIK: {selectedLoanToEval.nik} &bull; No HP: {selectedLoanToEval.noHp}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-blue-700 font-mono">
                        {selectedLoanToEval.kodePinjaman}
                      </div>
                      <div className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                        Suku Bunga 0.5% Menurun
                      </div>
                    </div>
                  </div>

                  {/* Detail Usaha & Jaminan */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                    <div>
                      <span className="text-gray-500 font-medium block">Tujuan Penggunaan Pinjaman:</span>
                      <span className="font-semibold text-gray-800">
                        {selectedLoanToEval.tujuanPinjaman}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-medium block">Agunan / Jaminan Fisik:</span>
                      <span className="font-semibold text-gray-800">{selectedLoanToEval.jaminan}</span>
                    </div>
                  </div>

                  {/* Formulir Penilaian 5C */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 text-xs flex items-center">
                        <Sliders className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                        Skor Prinsip Kelayakan 5C (Standar Analisis Kredit KSP)
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        Skor Rata-Rata: {avgScore} / 100 {avgScore >= 80 ? '(LAYAK)' : '(BERISIKO)'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Character */}
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>1. Character (Itikad & Kejujuran):</span>
                          <span className="text-blue-700 font-bold">{charScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={charScore}
                          onChange={(e) => setCharScore(Number(e.target.value))}
                          className="w-full mt-1 accent-emerald-600"
                        />
                      </div>

                      {/* Capacity */}
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>2. Capacity (Kemampuan Membayar):</span>
                          <span className="text-blue-700 font-bold">{capScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={capScore}
                          onChange={(e) => setCapScore(Number(e.target.value))}
                          className="w-full mt-1 accent-emerald-600"
                        />
                      </div>

                      {/* Capital */}
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>3. Capital (Permodalan Usaha):</span>
                          <span className="text-blue-700 font-bold">{capitalScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={capitalScore}
                          onChange={(e) => setCapitalScore(Number(e.target.value))}
                          className="w-full mt-1 accent-emerald-600"
                        />
                      </div>

                      {/* Collateral */}
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-200">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>4. Collateral (Kelayakan Agunan):</span>
                          <span className="text-blue-700 font-bold">{collateralScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={collateralScore}
                          onChange={(e) => setCollateralScore(Number(e.target.value))}
                          className="w-full mt-1 accent-emerald-600"
                        />
                      </div>

                      {/* Condition */}
                      <div className="p-2.5 bg-gray-50 rounded border border-gray-200 sm:col-span-2">
                        <div className="flex justify-between font-semibold text-gray-700">
                          <span>5. Condition (Prospek Pasar & Musim Usaha di Lembata):</span>
                          <span className="text-blue-700 font-bold">{conditionScore}</span>
                        </div>
                        <input
                          type="range"
                          min="40"
                          max="100"
                          value={conditionScore}
                          onChange={(e) => setConditionScore(Number(e.target.value))}
                          className="w-full mt-1 accent-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Catatan Evaluasi Kepala Unit */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Catatan Evaluasi & Rekomendasi Kepala Unit *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tuliskan telaah survei lapangan, analisis omzet, dan pertimbangan persetujuan..."
                      value={evalNotes}
                      onChange={(e) => setEvalNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-xs focus:ring-1 focus:ring-green-500 outline-none"
                    />
                  </div>

                  {/* Tombol Disposisi */}
                  <div className="pt-2 flex justify-end space-x-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleEvaluate('ditolak')}
                      className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-4 py-2 rounded font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak Permohonan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEvaluate('disetujui')}
                      className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-5 py-2 rounded font-bold text-xs flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Setujui (Disposisi ke Kepala Manager)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONITORING KINERJA PETUGAS LAPANGAN */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4">
          <div className="bg-white rounded shadow-xs border-t-3 border-t-[#3c8dbc] border-x border-b border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 text-sm flex items-center mb-3">
              <TrendingUp className="w-4 h-4 text-[#3c8dbc] mr-2" />
              Monitoring Kinerja & Target Petugas Lapangan (Cabang Nubatukan)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {petugasUsers.map((petugas) => {
                const nasabahPetugas = nasabahList.filter((n) => n.petugasId === petugas.id);
                const pinjamanPetugas = pinjamanList.filter((p) => p.petugasId === petugas.id);
                const totalNominal = pinjamanPetugas.reduce((acc, c) => acc + c.jumlahPinjaman, 0);

                return (
                  <div
                    key={petugas.id}
                    className="p-3.5 bg-gray-50 rounded border border-gray-200 space-y-2.5"
                  >
                    <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                      <img
                        src={petugas.avatar}
                        alt={petugas.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-xs">{petugas.name}</div>
                        <div className="text-[10px] text-gray-500">
                          Wilayah: Nubatukan Barat & Pesisir Lewoleba
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <div className="text-[10px] text-gray-400">Nasabah Binaan</div>
                        <div className="font-bold text-blue-700">{nasabahPetugas.length} Orang</div>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <div className="text-[10px] text-gray-400">Total Pinjaman</div>
                        <div className="font-bold text-emerald-700">{formatRupiah(totalNominal)}</div>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <div className="text-[10px] text-gray-400">Status Penagihan</div>
                        <div className="font-bold text-[#00a65a]">98.2% Lancar</div>
                      </div>
                    </div>

                    <div className="pt-1">
                      <div className="flex justify-between text-[11px] text-gray-600 mb-1">
                        <span>Pencapaian Target Penyaluran Bulanan:</span>
                        <span className="font-bold text-emerald-700">88%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#00a65a] h-full rounded-full" style={{ width: '88%' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MONITORING KOLEKTIBILITAS & NPL */}
      {activeTab === 'kolektibilitas' && (
        <div className="bg-white rounded shadow-xs border-t-3 border-t-[#f39c12] border-x border-b border-gray-200">
          <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm flex items-center">
                <AlertTriangle className="w-4 h-4 text-[#f39c12] mr-2" />
                Monitoring Tingkat Kolektibilitas Pinjaman (Kol 1 s/d Kol 5)
              </h3>
              <span className="text-[11px] text-gray-500">
                Pengawasan kredit berisiko & evaluasi penyelesaian kewajiban nasabah via WhatsApp
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                Tingkat NPL: 1,6%
              </span>
              <span className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-medium" title="Tugas penagihan & pengiriman WhatsApp debitur dilakukan oleh Petugas Lapangan">
                Otoritas Kirim WA: Petugas Lapangan
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200 text-[10px] uppercase">
                  <th className="p-2.5">Kode Pinjaman</th>
                  <th className="p-2.5">Nama Nasabah</th>
                  <th className="p-2.5">Sisa Pokok</th>
                  <th className="p-2.5">Angsuran / Tenor</th>
                  <th className="p-2.5">Tingkat Kolektibilitas</th>
                  <th className="p-2.5">Petugas Penanggung Jawab</th>
                  <th className="p-2.5">Status Evaluasi Unit</th>
                  <th className="p-2.5 text-right">Penanganan Debitur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pinjamanList.map((p) => {
                  const kol = getKolektibilitasLabel(p.kolektibilitas);
                  const unpaidJadwal =
                    p.jadwal.find((j) => j.status === 'jatuh_tempo' || j.status === 'belum_bayar') ||
                    p.jadwal[0];

                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-2.5 font-mono font-bold text-blue-700">{p.kodePinjaman}</td>
                      <td className="p-2.5 font-semibold text-gray-900">{p.nasabahNama}</td>
                      <td className="p-2.5 font-mono font-bold">{formatRupiah(p.sisaPokok)}</td>
                      <td className="p-2.5">
                        {p.angsuranTerbayar} / {p.totalAngsuranCount} Bulan
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`text-white text-[10px] px-2 py-0.5 rounded font-bold ${kol.badge}`}
                        >
                          {kol.label}
                        </span>
                      </td>
                      <td className="p-2.5 text-gray-600">{p.petugasNama}</td>
                      <td className="p-2.5 text-[11px] text-gray-700">
                        {p.catatanUnit || 'Belum ada catatan khusus'}
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="text-[10px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-medium inline-block" title="Penagihan WA ditangani oleh Petugas Lapangan: {p.petugasNama}">
                          Via Petugas Lapangan
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
