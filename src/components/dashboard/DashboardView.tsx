import React, { useState } from 'react';
import {
  TrendingUp,
  CreditCard,
  PiggyBank,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  ChevronRight,
  Filter,
  Layers,
  Award,
  FileText,
  DollarSign,
  BarChart2,
  PieChart,
  MessageSquare,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatRupiah, formatAngka } from '../../utils/loanCalculations';
import { dataProgres } from '../../data/initialData';

interface DashboardViewProps {
  onOpenSimulasi: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenSimulasi }) => {
  const {
    nasabahList,
    pinjamanList,
    simpananList,
    currentUser,
    setActiveMenu,
    cabangConfig,
    openWhatsAppReminder,
    kirimSemuaWaJatuhTempoOtomatis,
    waLogs,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'bulanan' | 'tahunan'>('bulanan');
  const [chartViewMode, setChartViewMode] = useState<'composed' | 'bar'>('composed');

  // Format data for Recharts (Simpanan vs Penyaluran Pinjaman Bulanan)
  const monthlyChartData = dataProgres.trenBulanan.map((item) => ({
    bulan: item.bulan,
    penyaluranJt: item.penyaluran,
    simpananJt: item.simpanan,
    targetPJt: item.targetP,
    targetSJt: item.targetS,
    penyaluranRp: item.penyaluran * 1000000,
    simpananRp: item.simpanan * 1000000,
    targetPRp: item.targetP * 1000000,
    targetSRp: item.targetS * 1000000,
  }));

  // Custom AdminLTE-styled Recharts Tooltip
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 text-white p-3 rounded shadow-xl border border-gray-700 text-xs min-w-[230px]">
          <div className="font-bold text-xs text-yellow-300 border-b border-gray-700 pb-1 mb-2 flex justify-between items-center">
            <span>Bulan {data.bulan} 2026</span>
            <span className="text-[10px] text-gray-400 font-normal">Cabang Nubatukan</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-blue-200">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3c8dbc] mr-1.5" />
                Penyaluran Pinjaman:
              </span>
              <span className="font-bold text-white font-mono">
                {formatRupiah(data.penyaluranRp)}
              </span>
            </div>
            <div className="flex justify-between items-center text-emerald-200">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a65a] mr-1.5" />
                Total Simpanan:
              </span>
              <span className="font-bold text-white font-mono">
                {formatRupiah(data.simpananRp)}
              </span>
            </div>
            <div className="pt-1.5 border-t border-gray-800 text-[10px] flex justify-between text-gray-400">
              <span>Rasio Simpanan / Pinjaman:</span>
              <span className="font-semibold text-emerald-400 font-mono">
                {((data.simpananRp / data.penyaluranRp) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Calculations
  const totalPinjamanBeredar = pinjamanList
    .filter((p) => p.status === 'disetujui_manager')
    .reduce((acc, curr) => acc + curr.sisaPokok, 0);

  const totalSimpananTerkumpul = simpananList.reduce((acc, curr) => {
    return curr.tipe === 'setor' ? acc + curr.jumlah : acc - curr.jumlah;
  }, 0);

  const pendingUnit = pinjamanList.filter((p) => p.status === 'menunggu_evaluasi').length;
  const pendingManager = pinjamanList.filter((p) => p.status === 'disetujui_unit').length;
  const nplDebitur = pinjamanList.filter((p) => p.kolektibilitas > 1).length;

  const overdueLoans = pinjamanList.filter(
    (p) =>
      p.status === 'disetujui_manager' &&
      (p.kolektibilitas > 1 || p.jadwal.some((j) => j.status === 'jatuh_tempo'))
  );

  const totalOverdueNominal = overdueLoans.reduce((acc, p) => {
    const overdueJadwal = p.jadwal.find(
      (j) => j.status === 'jatuh_tempo' || (p.kolektibilitas > 1 && j.status === 'belum_bayar')
    );
    return acc + (overdueJadwal?.totalAngsuran || 0);
  }, 0);

  const realisasiBulanPersen = Math.round(
    (dataProgres.realisasiBulananPenyaluran / dataProgres.targetBulananPenyaluran) * 100
  );
  const realisasiTahunPersen = Math.round(
    (dataProgres.realisasiTahunanPenyaluran / dataProgres.targetTahunanPenyaluran) * 100
  );

  return (
    <div className="space-y-4 font-sans">
      {/* Content Header (AdminLTE classic breadcrumb style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-1 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <span>Dashboard</span>
            <small className="font-light text-xs text-gray-500 ml-2.5">
              Control panel &bull; {cabangConfig.namaCabang}
            </small>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Sistem Informasi Koperasi Simpan Pinjam dengan Suku Bunga 0,5% Per Bulan Menurun
          </p>
        </div>
        <div className="text-xs text-gray-500 mt-2 sm:mt-0 flex items-center space-x-1">
          <span className="text-gray-400">Home</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Dashboard Progres</span>
        </div>
      </div>

      {/* Role Notice Card Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#3c8dbc] p-3 rounded shadow-xs flex flex-col md:flex-row md:items-center md:justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-[#3c8dbc] text-white flex items-center justify-center font-bold text-sm shrink-0">
            {currentUser?.role === 'petugas' && 'PL'}
            {currentUser?.role === 'kepala_unit' && 'KU'}
            {currentUser?.role === 'kepala_manager' && 'KM'}
            {currentUser?.role === 'admin' && 'AD'}
          </div>
          <div>
            <span className="font-bold text-gray-900">
              Selamat bertugas, {currentUser?.name}
            </span>
            <span className="text-gray-600 ml-1">
              (Role:{' '}
              <strong className="text-blue-700 uppercase">
                {currentUser?.role.replace('_', ' ')}
              </strong>
              ) &bull; Plafon suku bunga aktif: <strong className="text-emerald-700">0,5% Menurun/bln</strong>
            </span>
          </div>
        </div>
        <div className="mt-2 md:mt-0 flex items-center space-x-2">
          {currentUser?.role === 'petugas' && (
            <button
              onClick={() => setActiveMenu('petugas-input-nasabah')}
              className="bg-[#00c0ef] hover:bg-[#00a7d0] text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              + Input Peminjam Baru
            </button>
          )}
          {currentUser?.role === 'kepala_unit' && (
            <button
              onClick={() => setActiveMenu('unit-evaluasi')}
              className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              Evaluasi Permohonan ({pendingUnit})
            </button>
          )}
          {currentUser?.role === 'kepala_manager' && (
            <button
              onClick={() => setActiveMenu('manager-pengawasan')}
              className="bg-[#f39c12] hover:bg-[#e08e0b] text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              Otorisasi Manajerial ({pendingManager})
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveMenu('admin-users')}
              className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-2.5 py-1 rounded text-xs font-semibold cursor-pointer"
            >
              Kelola User Pengguna
            </button>
          )}
        </div>
      </div>

      {/* 4 SMALL STAT BOXES (Exact AdminLTE Replica: Aqua, Green, Yellow, Red) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Aqua (#00c0ef) - Pinjaman Berjalan / Realisasi */}
        <div className="bg-[#00c0ef] rounded text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-3.5 relative z-10">
            <h3 className="text-2xl font-black tracking-tight leading-none">
              {formatRupiah(totalPinjamanBeredar)}
            </h3>
            <p className="text-xs font-normal text-cyan-100 uppercase mt-1 tracking-wide">
              Pinjaman Berjalan ({pinjamanList.length} Debitur)
            </p>
          </div>
          {/* Background watermark icon */}
          <CreditCard className="w-20 h-20 text-black/10 absolute -right-2 top-2 z-0 pointer-events-none" />
          <button
            onClick={() => {
              if (currentUser?.role === 'petugas') setActiveMenu('petugas-pinjaman');
              else if (currentUser?.role === 'kepala_unit') setActiveMenu('unit-evaluasi');
              else if (currentUser?.role === 'kepala_manager') setActiveMenu('manager-pengawasan');
              else setActiveMenu('admin-cabang');
            }}
            className="w-full bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-[11px] py-1 px-3 flex items-center justify-center space-x-1 transition z-10 cursor-pointer"
          >
            <span>
              {currentUser?.role === 'petugas'
                ? 'Daftar Pinjaman'
                : currentUser?.role === 'kepala_unit'
                ? 'Evaluasi Pinjaman'
                : currentUser?.role === 'kepala_manager'
                ? 'Otorisasi Pinjaman'
                : 'Profil Cabang'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Box 2: Green (#00a65a) - Tingkat Kelancaran */}
        <div className="bg-[#00a65a] rounded text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-3.5 relative z-10">
            <h3 className="text-2xl font-black tracking-tight leading-none">
              98.4<sup className="text-lg font-bold">%</sup>
            </h3>
            <p className="text-xs font-normal text-emerald-100 uppercase mt-1 tracking-wide">
              Kolektibilitas Lancar (Kol-1)
            </p>
          </div>
          <TrendingUp className="w-20 h-20 text-black/10 absolute -right-2 top-2 z-0 pointer-events-none" />
          <button
            onClick={() => {
              if (currentUser?.role === 'petugas') setActiveMenu('petugas-angsuran');
              else if (currentUser?.role === 'kepala_unit') setActiveMenu('unit-npl');
              else if (currentUser?.role === 'kepala_manager') setActiveMenu('manager-kesehatan');
              else setActiveMenu('admin-users');
            }}
            className="w-full bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-[11px] py-1 px-3 flex items-center justify-center space-x-1 transition z-10 cursor-pointer"
          >
            <span>
              {currentUser?.role === 'petugas'
                ? 'Jadwal Angsuran'
                : currentUser?.role === 'kepala_unit'
                ? 'Evaluasi Kolektibilitas'
                : currentUser?.role === 'kepala_manager'
                ? 'Audit Kesehatan'
                : 'Kelola Pengguna'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Box 3: Yellow (#f39c12) - Simpanan Nasabah */}
        <div className="bg-[#f39c12] rounded text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-3.5 relative z-10">
            <h3 className="text-2xl font-black tracking-tight leading-none">
              {formatRupiah(totalSimpananTerkumpul)}
            </h3>
            <p className="text-xs font-normal text-amber-100 uppercase mt-1 tracking-wide">
              Total Simpanan Nasabah
            </p>
          </div>
          <PiggyBank className="w-20 h-20 text-black/10 absolute -right-2 top-2 z-0 pointer-events-none" />
          <button
            onClick={() => {
              if (currentUser?.role === 'petugas') setActiveMenu('petugas-simpanan');
              else if (currentUser?.role === 'kepala_unit') setActiveMenu('unit-monitoring');
              else if (currentUser?.role === 'kepala_manager') setActiveMenu('manager-pengawasan');
              else setActiveMenu('admin-users');
            }}
            className="w-full bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-[11px] py-1 px-3 flex items-center justify-center space-x-1 transition z-10 cursor-pointer"
          >
            <span>
              {currentUser?.role === 'petugas'
                ? 'Buku Simpanan'
                : currentUser?.role === 'kepala_unit'
                ? 'Monitoring Target'
                : currentUser?.role === 'kepala_manager'
                ? 'Pengawasan Kas'
                : 'Pengaturan User'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Box 4: Red (#dd4b39) - NPL / Macet */}
        <div className="bg-[#dd4b39] rounded text-white shadow-xs overflow-hidden relative flex flex-col justify-between">
          <div className="p-3.5 relative z-10">
            <h3 className="text-2xl font-black tracking-tight leading-none">
              1.6<sup className="text-lg font-bold">%</sup>
            </h3>
            <p className="text-xs font-normal text-rose-100 uppercase mt-1 tracking-wide">
              Rasio NPL ({nplDebitur} Debitur DPK)
            </p>
          </div>
          <AlertTriangle className="w-20 h-20 text-black/10 absolute -right-2 top-2 z-0 pointer-events-none" />
          <button
            onClick={() => {
              if (currentUser?.role === 'petugas') setActiveMenu('petugas-angsuran');
              else if (currentUser?.role === 'kepala_unit') setActiveMenu('unit-npl');
              else if (currentUser?.role === 'kepala_manager') setActiveMenu('manager-pembinaan');
              else setActiveMenu('admin-system');
            }}
            className="w-full bg-black/15 hover:bg-black/25 text-white/90 hover:text-white text-[11px] py-1 px-3 flex items-center justify-center space-x-1 transition z-10 cursor-pointer"
          >
            <span>
              {currentUser?.role === 'petugas'
                ? 'Daftar Tagihan'
                : currentUser?.role === 'kepala_unit'
                ? 'Pantau Debitur Kol 2'
                : currentUser?.role === 'kepala_manager'
                ? 'Memo Pembinaan'
                : 'Pemeliharaan'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PENGINGAT OTOMATIS WHATSAPP JATUH TEMPO (AdminLTE Callout Banner) */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded text-white p-4 shadow-xs border-l-4 border-[#25D366] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
            <MessageSquare className="w-5 h-5 text-gray-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm tracking-wide text-white">
                Sistem Notifikasi WhatsApp Otomatis Jatuh Tempo
              </h4>
              <span className="bg-[#25D366] text-gray-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                Aktif
              </span>
            </div>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
              {overdueLoans.length > 0 ? (
                <>
                  Ditemukan <strong className="text-yellow-300 font-bold">{overdueLoans.length} nasabah</strong> dengan kewajiban angsuran jatuh tempo/DPK (Total tagihan:{' '}
                  <strong className="text-white font-mono">{formatRupiah(totalOverdueNominal)}</strong>). Sistem otomatis menyiapkan pesan WhatsApp berformat resmi KSP Cabang Nubatukan untuk nasabah & kerabat penjamin.
                </>
              ) : (
                <>
                  Semua angsuran nasabah saat ini dalam kondisi tertib dan lancar (Kol-1). Sistem WhatsApp siap mengirimkan pengingat H-3 dan peringatan otomatis saat jatuh tempo tiba.
                </>
              )}
            </p>
            {waLogs.length > 0 && (
              <div className="text-[11px] text-emerald-200 mt-1.5 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                <span>
                  Pengiriman Terakhir: {waLogs[0].nasabahNama} ({waLogs[0].waktuKirim}) &bull; Total {waLogs.length} notifikasi WA terkirim
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          {currentUser?.role === 'petugas' ? (
            <>
              {overdueLoans.length > 0 && (
                <button
                  onClick={() => {
                    const firstOverdue = overdueLoans[0];
                    const firstJadwal =
                      firstOverdue.jadwal.find(
                        (j) => j.status === 'jatuh_tempo' || j.status === 'belum_bayar'
                      ) || firstOverdue.jadwal[0];
                    openWhatsAppReminder(firstOverdue, firstJadwal);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer border border-white/20"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Detail Debitur WA</span>
                </button>
              )}

              <button
                onClick={() => kirimSemuaWaJatuhTempoOtomatis()}
                className="bg-[#25D366] hover:bg-[#1ebd59] text-gray-950 px-4 py-2 rounded text-xs font-bold flex items-center space-x-1.5 shadow-md transition cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kirim WA Otomatis Sekarang</span>
              </button>
            </>
          ) : (
            <div className="bg-white/10 border border-white/20 rounded px-3 py-2 text-[11px] text-emerald-100 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Otoritas Kirim WA Otomatis: <strong>Petugas Lapangan</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* MAIN PROGRESS SECTION: Monthly & Annual Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Main Progress Area Graph (AdminLTE style Box) */}
        <div className="lg:col-span-2 bg-white rounded shadow-xs border-t-3 border-t-[#3c8dbc] border-x border-b border-gray-200">
          {/* Box Header with Tabs */}
          <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#3c8dbc]" />
              <h2 className="font-bold text-gray-800 text-sm">
                Grafik Progres Penyaluran & Simpanan Cabang Nubatukan
              </h2>
            </div>
            {/* Tab switch buttons */}
            <div className="flex items-center bg-gray-100 rounded p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('bulanan')}
                className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                  activeTab === 'bulanan'
                    ? 'bg-[#3c8dbc] text-white shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Progres Bulanan ({dataProgres.bulanBerjalan})
              </button>
              <button
                onClick={() => setActiveTab('tahunan')}
                className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                  activeTab === 'tahunan'
                    ? 'bg-[#3c8dbc] text-white shadow-xs font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Progres Tahunan ({dataProgres.tahunBerjalan})
              </button>
            </div>
          </div>

          {/* Box Body: Interactive SVG Chart */}
          <div className="p-4">
            {activeTab === 'bulanan' ? (
              <div className="space-y-4">
                {/* Metric Summary row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-blue-50/60 rounded border border-blue-200">
                    <div className="text-gray-500 flex justify-between">
                      <span>Target Penyaluran Bulan Ini:</span>
                      <span className="font-bold text-gray-800">
                        {formatRupiah(dataProgres.targetBulananPenyaluran)}
                      </span>
                    </div>
                    <div className="text-gray-500 flex justify-between mt-1">
                      <span>Realisasi Sampai Hari Ini:</span>
                      <span className="font-bold text-[#00a65a]">
                        {formatRupiah(dataProgres.realisasiBulananPenyaluran)} ({realisasiBulanPersen}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#00a65a] h-full rounded-full transition-all duration-500"
                        style={{ width: `${realisasiBulanPersen}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/60 rounded border border-amber-200">
                    <div className="text-gray-500 flex justify-between">
                      <span>Target Simpanan Bulan Ini:</span>
                      <span className="font-bold text-gray-800">
                        {formatRupiah(dataProgres.targetBulananSimpanan)}
                      </span>
                    </div>
                    <div className="text-gray-500 flex justify-between mt-1">
                      <span>Realisasi Simpanan Terkumpul:</span>
                      <span className="font-bold text-[#f39c12]">
                        {formatRupiah(dataProgres.realisasiBulananSimpanan)} (95%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#f39c12] h-full rounded-full transition-all duration-500"
                        style={{ width: `95%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* RECHARTS COMPONENT: Monthly Total Savings vs Loan Disbursements */}
                <div className="border border-gray-200 rounded p-3 bg-white shadow-xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-bold text-gray-800 text-xs flex items-center">
                        <TrendingUp className="w-3.5 h-3.5 text-[#3c8dbc] mr-1.5" />
                        Komparasi Realisasi Simpanan vs. Penyaluran Pinjaman Bulanan (2026)
                      </span>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Visualisasi interaktif Recharts &bull; Kantor Cabang Nubatukan, Kab. Lembata
                      </p>
                    </div>

                    {/* Chart Style Toggle: Area vs Bar */}
                    <div className="flex items-center bg-gray-100 p-0.5 rounded text-[11px]">
                      <button
                        type="button"
                        onClick={() => setChartViewMode('composed')}
                        className={`px-2.5 py-1 rounded font-medium flex items-center space-x-1 transition cursor-pointer ${
                          chartViewMode === 'composed'
                            ? 'bg-[#3c8dbc] text-white font-semibold shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <TrendingUp className="w-3 h-3" />
                        <span>Area Trend</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartViewMode('bar')}
                        className={`px-2.5 py-1 rounded font-medium flex items-center space-x-1 transition cursor-pointer ${
                          chartViewMode === 'bar'
                            ? 'bg-[#3c8dbc] text-white font-semibold shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <BarChart2 className="w-3 h-3" />
                        <span>Kolom Bar</span>
                      </button>
                    </div>
                  </div>

                  {/* Recharts Container */}
                  <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartViewMode === 'composed' ? (
                        <ComposedChart
                          data={monthlyChartData}
                          margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="colorPenyaluran" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3c8dbc" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#3c8dbc" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorSimpanan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00a65a" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#00a65a" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="bulan"
                            stroke="#6c757d"
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#6c757d"
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(val) => `Rp ${val}Jt`}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Legend
                            verticalAlign="top"
                            height={32}
                            wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="penyaluranJt"
                            name="Penyaluran Pinjaman (Juta Rp)"
                            stroke="#3c8dbc"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorPenyaluran)"
                          />
                          <Area
                            type="monotone"
                            dataKey="simpananJt"
                            name="Total Simpanan Nasabah (Juta Rp)"
                            stroke="#00a65a"
                            strokeWidth={2.5}
                            fillOpacity={1}
                            fill="url(#colorSimpanan)"
                          />
                          <Line
                            type="monotone"
                            dataKey="targetPJt"
                            name="Target Pinjaman (Juta Rp)"
                            stroke="#ff851b"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </ComposedChart>
                      ) : (
                        <ComposedChart
                          data={monthlyChartData}
                          margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis
                            dataKey="bulan"
                            stroke="#6c757d"
                            fontSize={11}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#6c757d"
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(val) => `Rp ${val}Jt`}
                          />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Legend
                            verticalAlign="top"
                            height={32}
                            wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
                          />
                          <Bar
                            dataKey="penyaluranJt"
                            name="Penyaluran Pinjaman (Juta Rp)"
                            fill="#3c8dbc"
                            radius={[3, 3, 0, 0]}
                          />
                          <Bar
                            dataKey="simpananJt"
                            name="Total Simpanan Nasabah (Juta Rp)"
                            fill="#00a65a"
                            radius={[3, 3, 0, 0]}
                          />
                          <Line
                            type="monotone"
                            dataKey="targetPJt"
                            name="Target Pinjaman (Juta Rp)"
                            stroke="#ff851b"
                            strokeDasharray="4 4"
                            strokeWidth={1.5}
                            dot={false}
                          />
                        </ComposedChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  {/* Summary badges below chart */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-gray-100 text-[11px]">
                    <div className="flex items-center justify-between p-1.5 bg-blue-50/70 rounded border border-blue-100">
                      <span className="text-gray-600 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#3c8dbc] mr-1.5" />
                        Rata-rata Pinjaman/Bln:
                      </span>
                      <span className="font-bold text-blue-900">Rp 96,5 Juta</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-emerald-50/70 rounded border border-emerald-100">
                      <span className="text-gray-600 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#00a65a] mr-1.5" />
                        Rata-rata Simpanan/Bln:
                      </span>
                      <span className="font-bold text-emerald-900">Rp 68,5 Juta</span>
                    </div>

                    <div className="flex items-center justify-between p-1.5 bg-amber-50/70 rounded border border-amber-100">
                      <span className="text-gray-600 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#f39c12] mr-1.5" />
                        Rasio Likuiditas Kas:
                      </span>
                      <span className="font-bold text-amber-900">71.0% (Sehat)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* PROGRES TAHUNAN */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                    <div className="flex justify-between text-gray-700">
                      <span>Target Penyaluran Tahun 2026:</span>
                      <span className="font-bold">
                        {formatRupiah(dataProgres.targetTahunanPenyaluran)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700 mt-1">
                      <span>Akumulasi Realisasi Q1-Q3:</span>
                      <span className="font-bold text-[#00a65a]">
                        {formatRupiah(dataProgres.realisasiTahunanPenyaluran)} ({realisasiTahunPersen}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#00a65a] h-full rounded-full transition-all duration-500"
                        style={{ width: `${realisasiTahunPersen}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex justify-between text-gray-700">
                      <span>Target Simpanan Tahun 2026:</span>
                      <span className="font-bold">
                        {formatRupiah(dataProgres.targetTahunanSimpanan)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700 mt-1">
                      <span>Akumulasi Simpanan Q1-Q3:</span>
                      <span className="font-bold text-[#3c8dbc]">
                        {formatRupiah(dataProgres.realisasiTahunanSimpanan)} (85.6%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-3 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#3c8dbc] h-full rounded-full transition-all duration-500"
                        style={{ width: `85.6%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Yearly Milestone Breakdown */}
                <div className="p-3 border border-gray-200 rounded text-xs space-y-2">
                  <h4 className="font-bold text-gray-800">
                    Evaluasi Pencapaian Kuartal Cabang Nubatukan 2026
                  </h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="text-[10px] text-gray-500">Kuartal 1 (Jan-Mar)</div>
                      <div className="font-bold text-emerald-600 mt-0.5">102%</div>
                      <div className="text-[10px] text-gray-400">Rp 247 Jt</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="text-[10px] text-gray-500">Kuartal 2 (Apr-Jun)</div>
                      <div className="font-bold text-emerald-600 mt-0.5">105%</div>
                      <div className="text-[10px] text-gray-400">Rp 305 Jt</div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <div className="text-[10px] text-gray-500">Kuartal 3 (Jul-Sep)</div>
                      <div className="font-bold text-emerald-600 mt-0.5">110%</div>
                      <div className="text-[10px] text-gray-400">Rp 330 Jt</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="text-[10px] text-blue-700 font-semibold">Kuartal 4 (Berjalan)</div>
                      <div className="font-bold text-blue-600 mt-0.5">29.3%</div>
                      <div className="text-[10px] text-blue-500">Rp 88 Jt / 300 Jt</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Box Footer with Simulation Callout */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs">
            <span className="text-gray-600">
              * Perhitungan bunga menggunakan rumus baku: <strong>0,5% &times; Sisa Pokok Pinjaman</strong> per bulan.
            </span>
            <button
              onClick={onOpenSimulasi}
              className="text-[#3c8dbc] hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>Uji Simulasi Bunga Menurun</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Col: Wilayah & Profil Portofolio Cabang Nubatukan */}
        <div className="space-y-4">
          {/* Card 1: Distribusi Kolektibilitas (Box Success) */}
          <div className="bg-white rounded shadow-xs border-t-3 border-t-[#00a65a] border-x border-b border-gray-200">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs flex items-center">
                <CheckCircle className="w-3.5 h-3.5 text-[#00a65a] mr-1.5" />
                Kualitas Kredit (Kolektibilitas)
              </h3>
              <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold">
                NPL 1.6% Sehat
              </span>
            </div>
            <div className="p-3 space-y-2 text-xs">
              {dataProgres.distribusiKolektibilitas.map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className="text-gray-600 font-mono">
                      {item.jumlahDebitur} orang ({item.persentase}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.persentase}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Wilayah Kerja Cabang Nubatukan */}
          <div className="bg-white rounded shadow-xs border-t-3 border-t-[#f39c12] border-x border-b border-gray-200">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs flex items-center">
                <Layers className="w-3.5 h-3.5 text-[#f39c12] mr-1.5" />
                Wilayah Sentra Binaan Nubatukan
              </h3>
              <span className="text-[10px] text-gray-400">Kabupaten Lembata</span>
            </div>
            <div className="p-3 text-xs space-y-2">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-medium text-gray-700">1. Pasar Pada / Lewoleba Barat</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded">
                  Dagang / Kelontong
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-medium text-gray-700">2. Pesisir Lamahora</span>
                <span className="bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.5 rounded">
                  Nelayan & Mesin Laut
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-medium text-gray-700">3. Sentra Tenun Waijarang</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded">
                  Pengrajin Tenun Ikat
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="font-medium text-gray-700">4. Perkebunan Rayuan</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded">
                  Petani Jagung & Sapi
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-medium text-gray-700">5. Selandoro & Kota Baru</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded">
                  Apotek, Jasa & UMKM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT LOANS & TRANSACTIONS TABLE (AdminLTE Box style) */}
      <div className="bg-white rounded shadow-xs border-t-3 border-t-[#3c8dbc] border-x border-b border-gray-200">
        <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-[#3c8dbc]" />
            <h3 className="font-bold text-gray-800 text-xs sm:text-sm">
              Daftar Permohonan & Penyaluran Pinjaman Terkini (Cabang Nubatukan)
            </h3>
          </div>
          <button
            onClick={() => {
              if (currentUser?.role === 'petugas') setActiveMenu('petugas-pinjaman');
              else if (currentUser?.role === 'kepala_unit') setActiveMenu('unit-evaluasi');
              else if (currentUser?.role === 'kepala_manager') setActiveMenu('manager-pengawasan');
              else setActiveMenu('admin-cabang');
            }}
            className="text-xs text-[#3c8dbc] hover:underline font-semibold cursor-pointer"
          >
            Lihat Semua Pinjaman &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200 uppercase text-[10px]">
                <th className="p-2.5">Kode</th>
                <th className="p-2.5">Nama Peminjam / NIK</th>
                <th className="p-2.5">Jumlah</th>
                <th className="p-2.5">Tenor</th>
                <th className="p-2.5">Bunga/Bln</th>
                <th className="p-2.5">Sisa Pokok</th>
                <th className="p-2.5">Status Persetujuan</th>
                <th className="p-2.5">Kolektibilitas</th>
                <th className="p-2.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pinjamanList.slice(0, 5).map((pinj) => {
                const badgeStatus =
                  pinj.status === 'disetujui_manager'
                    ? 'bg-[#00a65a] text-white'
                    : pinj.status === 'disetujui_unit'
                    ? 'bg-[#00c0ef] text-white'
                    : pinj.status === 'menunggu_evaluasi'
                    ? 'bg-[#f39c12] text-white'
                    : 'bg-[#dd4b39] text-white';

                const statusLabel =
                  pinj.status === 'disetujui_manager'
                    ? 'Disetujui Pimpinan'
                    : pinj.status === 'disetujui_unit'
                    ? 'Disetujui Unit'
                    : pinj.status === 'menunggu_evaluasi'
                    ? 'Menunggu Evaluasi'
                    : 'Ditolak';

                return (
                  <tr key={pinj.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-blue-700">{pinj.kodePinjaman}</td>
                    <td className="p-2.5">
                      <div className="font-semibold text-gray-900">{pinj.nasabahNama}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{pinj.nik}</div>
                    </td>
                    <td className="p-2.5 font-bold text-gray-800">
                      {formatRupiah(pinj.jumlahPinjaman)}
                    </td>
                    <td className="p-2.5">{pinj.tenorBulan} Bulan</td>
                    <td className="p-2.5 font-semibold text-[#00a65a]">0,5% Menurun</td>
                    <td className="p-2.5 font-semibold text-gray-700">
                      {formatRupiah(pinj.sisaPokok)}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeStatus}`}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          pinj.kolektibilitas === 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Kol-{pinj.kolektibilitas}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      {currentUser?.role === 'kepala_unit' && pinj.status === 'menunggu_evaluasi' ? (
                        <button
                          onClick={() => setActiveMenu('unit-evaluasi')}
                          className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Evaluasi 5C
                        </button>
                      ) : currentUser?.role === 'kepala_manager' && pinj.status === 'disetujui_unit' ? (
                        <button
                          onClick={() => setActiveMenu('manager-pengawasan')}
                          className="bg-[#f39c12] hover:bg-[#e08e0b] text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Otorisasi
                        </button>
                      ) : currentUser?.role === 'petugas' ? (
                        <button
                          onClick={() => setActiveMenu('petugas-angsuran')}
                          className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-2.5 py-1 rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Angsuran / Kwitansi
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveMenu('admin-cabang')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] cursor-pointer"
                        >
                          Detail
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
