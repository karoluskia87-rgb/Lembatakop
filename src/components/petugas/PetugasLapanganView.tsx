import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  CreditCard,
  PiggyBank,
  Receipt,
  Search,
  CheckCircle,
  AlertCircle,
  Printer,
  ChevronRight,
  Info,
  Calendar,
  Phone,
  ShieldCheck,
  Building,
  MessageSquare,
  Send,
  Edit3,
  FileText,
  Filter,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  UserCheck,
  MapPin,
  Plus,
  Users,
  CheckCircle2,
  ExternalLink,
  ArrowUpDown,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { EditNasabahModal } from '../modals/EditNasabahModal';
import { DetailNasabahModal } from '../modals/DetailNasabahModal';
import { useApp } from '../../context/AppContext';
import {
  formatRupiah,
  formatTanggal,
  hitungSimulasiBungaMenurun,
} from '../../utils/loanCalculations';
import { Nasabah, Pinjaman, JadwalAngsuran } from '../../types';

interface PetugasLapanganViewProps {
  onPrintKwitansi: (item: {
    tipe: 'angsuran' | 'simpanan';
    nomor: string;
    nama: string;
    nik: string;
    nominal: number;
    keterangan: string;
    tanggal: string;
    petugas: string;
    detailTambahan?: string;
  }) => void;
  onOpenSimulasi: () => void;
}

export const PetugasLapanganView: React.FC<PetugasLapanganViewProps> = ({
  onPrintKwitansi,
  onOpenSimulasi,
}) => {
  const {
    nasabahList,
    pinjamanList,
    simpananList,
    currentUser,
    activeMenu,
    setActiveMenu,
    tambahNasabah,
    updateNasabah,
    ajukanPinjaman,
    catatSimpanan,
    bayarAngsuran,
    addToast,
    openWhatsAppReminder,
    kirimSemuaWaJatuhTempoOtomatis,
    waLogs,
  } = useApp();

  // Map activeMenu from sidebar to sub-tabs
  const getTabFromMenu = () => {
    if (activeMenu === 'petugas-pinjaman') return 'input_pinjaman';
    if (activeMenu === 'petugas-simpanan') return 'input_simpanan';
    if (activeMenu === 'petugas-angsuran') return 'bayar_angsuran';
    if (activeMenu === 'petugas-data') return 'data_nasabah';
    return 'input_nasabah';
  };

  const [activeTab, setActiveTab] = useState<
    'input_nasabah' | 'input_pinjaman' | 'input_simpanan' | 'bayar_angsuran' | 'data_nasabah'
  >(getTabFromMenu);

  useEffect(() => {
    setActiveTab(getTabFromMenu());
  }, [activeMenu]);

  // Form State: Nasabah
  const [nik, setNik] = useState('');
  const [noKk, setNoKk] = useState('');
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [desa, setDesa] = useState('Lewoleba Barat');
  const [noHp, setNoHp] = useState('');
  const [namaPenjamin, setNamaPenjamin] = useState('');
  const [nikPenjamin, setNikPenjamin] = useState('');
  const [noHpKerabat, setNoHpKerabat] = useState('');
  const [hubunganKerabat, setHubunganKerabat] = useState('Kakak Kandung');
  const [pekerjaan, setPekerjaan] = useState('');
  const [penghasilanBulanan, setPenghasilanBulanan] = useState(5000000);
  const [formErrorNasabah, setFormErrorNasabah] = useState('');

  // Form State: Pinjaman
  const [selectedNasabahId, setSelectedNasabahId] = useState(nasabahList[0]?.id || '');
  const [jumlahPinjaman, setJumlahPinjaman] = useState(10000000);
  const [tenorBulan, setTenorBulan] = useState(12);
  const [tujuanPinjaman, setTujuanPinjaman] = useState('');
  const [jaminan, setJaminan] = useState('');
  const [formErrorPinjaman, setFormErrorPinjaman] = useState('');

  // Form State: Simpanan
  const [simpananNasabahId, setSimpananNasabahId] = useState(nasabahList[0]?.id || '');
  const [jenisSimpanan, setJenisSimpanan] = useState<'pokok' | 'wajib' | 'sukarela'>('wajib');
  const [tipeSimpanan, setTipeSimpanan] = useState<'setor' | 'tarik'>('setor');
  const [jumlahSimpanan, setJumlahSimpanan] = useState(100000);
  const [ketSimpanan, setKetSimpanan] = useState('');
  const [formErrorSimpanan, setFormErrorSimpanan] = useState('');

  // Angsuran State
  const [selectedPinjamanId, setSelectedPinjamanId] = useState(pinjamanList[0]?.id || '');

  // Search & Filter State for Data Nasabah
  const [searchFilter, setSearchFilter] = useState('');
  const [desaFilter, setDesaFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'nama_asc' | 'nama_desc' | 'terbaru' | 'penghasilan'>('nama_asc');
  const [nasabahViewMode, setNasabahViewMode] = useState<'tabel' | 'kartu'>('tabel');
  const [editingNasabah, setEditingNasabah] = useState<Nasabah | null>(null);
  const [detailNasabah, setDetailNasabah] = useState<Nasabah | null>(null);

  const desaNubatukan = [
    'Lewoleba Barat',
    'Lewoleba Timur',
    'Lewoleba Selatan',
    'Lamahora',
    'Waijarang',
    'Rayuan',
    'Selandoro',
    'Kota Baru',
    'Lite Ulunado',
    'Belobatang',
    'Paubokol',
  ];

  // Submit Handler: Tambah Nasabah (NO WINDOW.ALERT)
  const handleSubmitNasabah = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorNasabah('');

    if (!nik.trim() || !nama.trim() || !noKk.trim() || !noHp.trim() || !nikPenjamin.trim() || !noHpKerabat.trim()) {
      setFormErrorNasabah('Mohon lengkapi seluruh data identitas wajib: KTP Peminjam, KK, KTP Penjamin, No HP Peminjam & Kerabat.');
      addToast('Data identitas belum lengkap! Silakan lengkapi kolom bertanda bintang.', 'error');
      return;
    }

    tambahNasabah({
      nik,
      noKk,
      nama,
      alamat,
      desa,
      noHp,
      namaPenjamin,
      nikPenjamin,
      noHpKerabat,
      hubunganKerabat,
      pekerjaan,
      penghasilanBulanan: Number(penghasilanBulanan),
    });

    // reset form
    setNik('');
    setNoKk('');
    setNama('');
    setAlamat('');
    setNoHp('');
    setNamaPenjamin('');
    setNikPenjamin('');
    setNoHpKerabat('');
    setPekerjaan('');
  };

  // Submit Handler: Ajukan Pinjaman (NO WINDOW.ALERT)
  const handleSubmitPinjaman = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorPinjaman('');

    if (!selectedNasabahId || !jumlahPinjaman || !tenorBulan || !jaminan.trim()) {
      setFormErrorPinjaman('Mohon pilih nasabah, nominal pinjaman, tenor, dan data agunan jaminan.');
      addToast('Data pinjaman belum lengkap! Isi seluruh kolom wajib.', 'error');
      return;
    }

    ajukanPinjaman(
      selectedNasabahId,
      Number(jumlahPinjaman),
      Number(tenorBulan),
      tujuanPinjaman,
      jaminan
    );

    setTujuanPinjaman('');
    setJaminan('');
  };

  // Submit Handler: Catat Simpanan (NO WINDOW.ALERT)
  const handleSubmitSimpanan = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorSimpanan('');

    if (!simpananNasabahId || !jumlahSimpanan || jumlahSimpanan <= 0) {
      setFormErrorSimpanan('Mohon pilih nasabah dan isi nominal simpanan dengan benar.');
      addToast('Nominal simpanan tidak boleh kosong.', 'error');
      return;
    }

    const nsb = nasabahList.find((n) => n.id === simpananNasabahId);
    const trx = catatSimpanan(
      simpananNasabahId,
      jenisSimpanan,
      tipeSimpanan,
      Number(jumlahSimpanan),
      ketSimpanan || `Transaksi Simpanan ${jenisSimpanan.toUpperCase()} nasabah`
    );

    // Option to print receipt
    onPrintKwitansi({
      tipe: 'simpanan',
      nomor: trx.kodeTransaksi,
      nama: nsb?.nama || 'Nasabah',
      nik: nsb?.nik || '-',
      nominal: Number(jumlahSimpanan),
      keterangan: `${tipeSimpanan.toUpperCase()} Simpanan ${jenisSimpanan.toUpperCase()} (${trx.keterangan})`,
      tanggal: formatTanggal(trx.tanggal),
      petugas: currentUser?.name || 'Petugas Lapangan',
    });

    setKetSimpanan('');
  };

  // Handle Pay Installment
  const handlePayInstallment = (pinjId: string, bulanKe: number) => {
    const pinj = pinjamanList.find((p) => p.id === pinjId);
    const itemJadwal = pinj?.jadwal.find((j) => j.bulanKe === bulanKe);
    if (!pinj || !itemJadwal) return;

    const res = bayarAngsuran(pinjId, bulanKe);
    if (res.success) {
      onPrintKwitansi({
        tipe: 'angsuran',
        nomor: res.kwitansiNo,
        nama: pinj.nasabahNama,
        nik: pinj.nik,
        nominal: itemJadwal.totalAngsuran,
        keterangan: `Pembayaran Angsuran Bulan ke-${bulanKe} Pinjaman ${pinj.kodePinjaman} (Pokok: ${formatRupiah(
          itemJadwal.angsuranPokok
        )} + Bunga 0.5% Menurun: ${formatRupiah(itemJadwal.bungaBulanIni)})`,
        tanggal: formatTanggal(new Date().toISOString()),
        petugas: currentUser?.name || 'Petugas Lapangan',
        detailTambahan: `Sisa Pokok Setelah Bayar: ${formatRupiah(itemJadwal.sisaPokokAkhir)}`,
      });
    }
  };

  // Live simulation for loan form
  const liveSimulasi = hitungSimulasiBungaMenurun(Number(jumlahPinjaman) || 0, Number(tenorBulan) || 1);

  // Selected loan for installment view
  const currentSelectedPinjaman =
    pinjamanList.find((p) => p.id === selectedPinjamanId) || pinjamanList[0];

  const handleSwitchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'input_nasabah') setActiveMenu('petugas-input-nasabah');
    else if (tab === 'input_pinjaman') setActiveMenu('petugas-pinjaman');
    else if (tab === 'input_simpanan') setActiveMenu('petugas-simpanan');
    else if (tab === 'bayar_angsuran') setActiveMenu('petugas-angsuran');
    else if (tab === 'data_nasabah') setActiveMenu('petugas-data');
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-1 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <span>Tugas Petugas Lapangan</span>
            <small className="font-light text-xs text-gray-500 ml-2.5">
              Input Nasabah, Permohonan Pinjaman & Simpanan &bull; Cabang Nubatukan
            </small>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Petugas bertugas menghimpun data peminjam secara akurat (KTP, KK, KTP Penjamin, No HP) & mencatat transaksi simpan pinjam.
          </p>
        </div>
        <div className="text-xs text-gray-500 mt-2 sm:mt-0 flex items-center space-x-1">
          <span className="text-gray-400">Home</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Petugas Lapangan</span>
        </div>
      </div>

      {/* AdminLTE Nav Tabs Toolbar */}
      <div className="flex flex-wrap items-center bg-white border border-gray-200 rounded shadow-xs p-1 gap-1">
        <button
          onClick={() => handleSwitchTab('input_nasabah')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'input_nasabah'
              ? 'bg-[#00c0ef] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>1. Input Data Peminjam & KK</span>
        </button>

        <button
          onClick={() => handleSwitchTab('input_pinjaman')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'input_pinjaman'
              ? 'bg-[#00a65a] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>2. Permohonan Pinjaman (0,5% Menurun)</span>
        </button>

        <button
          onClick={() => handleSwitchTab('input_simpanan')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'input_simpanan'
              ? 'bg-[#f39c12] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span>3. Transaksi Simpanan</span>
        </button>

        <button
          onClick={() => handleSwitchTab('bayar_angsuran')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'bayar_angsuran'
              ? 'bg-[#3c8dbc] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>4. Bayar Angsuran & Kwitansi</span>
        </button>

        <button
          onClick={() => handleSwitchTab('data_nasabah')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'data_nasabah'
              ? 'bg-gray-800 text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Daftar Nasabah Binaan ({nasabahList.length})</span>
        </button>
      </div>

      {/* TAB 1: INPUT DATA PEMINJAM & PENJAMIN */}
      {activeTab === 'input_nasabah' && (
        <div className="bg-white rounded shadow-xs border-t-3 border-t-[#00c0ef] border-x border-b border-gray-200">
          <div className="p-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm flex items-center">
              <UserPlus className="w-4 h-4 text-[#00c0ef] mr-2" />
              Formulir Input Data Peminjam & Kerabat Penjamin (Wajib Dokumen Lengkap)
            </h2>
            <span className="text-[11px] text-gray-500">
              Petugas Pencatat: <strong>{currentUser?.name}</strong>
            </span>
          </div>

          {formErrorNasabah && (
            <div className="m-3 p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formErrorNasabah}</span>
            </div>
          )}

          <form onSubmit={handleSubmitNasabah} className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kolom Kiri: Data Peminjam */}
              <div className="space-y-3 bg-gray-50/60 p-3 rounded border border-gray-200">
                <div className="font-bold text-gray-700 border-b border-gray-200 pb-1 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                  A. Identitas Utama Peminjam
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nama Lengkap Peminjam *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Petrus Laba Lamak"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      KTP / NIK Peminjam (16 Digit) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="5308041505850001"
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Nomor KK Peminjam (16 Digit) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="5308042001100014"
                      value={noKk}
                      onChange={(e) => setNoKk(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nomor HP Peminjam (Aktif WhatsApp/Telepon) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0813-3987-1234"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Desa / Kelurahan di Nubatukan *
                    </label>
                    <select
                      value={desa}
                      onChange={(e) => setDesa(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {desaNubatukan.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Estimasi Penghasilan Bulanan
                    </label>
                    <input
                      type="number"
                      step={500000}
                      value={penghasilanBulanan}
                      onChange={(e) => setPenghasilanBulanan(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Alamat Lengkap Domisili (RT/RW/Patokan Rumah)
                  </label>
                  <input
                    type="text"
                    placeholder="Jl. Merdeka RT 04 / RW 02, Dekat Pelabuhan Lewoleba"
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Pekerjaan / Bidang Usaha Peminjam
                  </label>
                  <input
                    type="text"
                    placeholder="Pedagang Kelontong Pasar / Nelayan Tangkap / Petani"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Kolom Kanan: Data Penjamin & Kontak Kerabat */}
              <div className="space-y-3 bg-amber-50/40 p-3 rounded border border-amber-200">
                <div className="font-bold text-gray-700 border-b border-amber-200 pb-1 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
                  B. Data Penjamin & Kerabat Tidak Serumah
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nama Penjamin (Suami / Istri / Orang Tua) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Theresia Barek (Istri)"
                    value={namaPenjamin}
                    onChange={(e) => setNamaPenjamin(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    KTP / NIK Penjamin (16 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="5308045508880003"
                    value={nikPenjamin}
                    onChange={(e) => setNikPenjamin(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nomor HP Kerabat Tidak Serumah *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0821-4567-8910"
                    value={noHpKerabat}
                    onChange={(e) => setNoHpKerabat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Hubungan dengan Kerabat *
                  </label>
                  <select
                    value={hubunganKerabat}
                    onChange={(e) => setHubunganKerabat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                  >
                    <option value="Kakak Kandung">Kakak Kandung</option>
                    <option value="Adik Kandung">Adik Kandung</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Paman / Bibi">Paman / Bibi</option>
                    <option value="Mertua">Mertua</option>
                    <option value="Sepupu">Sepupu</option>
                  </select>
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    SOP Verifikasi Petugas Lapangan Cabang Nubatukan:
                  </div>
                  <div>
                    &bull; Pastikan nomor HP peminjam dan nomor kerabat dapat dihubungi saat disurvei.
                  </div>
                  <div>
                    &bull; KTP penjamin wajib dilampirkan foto fisik pada map arsip Cabang Nubatukan.
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-[#00c0ef] hover:bg-[#00a7d0] text-white px-5 py-2 rounded font-bold text-xs shadow-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Simpan Data Nasabah ke Database</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: PERMOHONAN PINJAMAN (BUNGA 0.5% MENURUN) */}
      {activeTab === 'input_pinjaman' && (
        <div className="space-y-4">
          <div className="bg-white rounded shadow-xs border-t-3 border-t-[#00a65a] border-x border-b border-gray-200">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-sm flex items-center">
                <CreditCard className="w-4 h-4 text-[#00a65a] mr-2" />
                Form Permohonan Pinjaman & Simulasi Otomatis (Bunga 0,5% Menurun)
              </h2>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                Suku Bunga 0.5% / Bulan Menurun
              </span>
            </div>

            {formErrorPinjaman && (
              <div className="m-3 p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formErrorPinjaman}</span>
              </div>
            )}

            <form onSubmit={handleSubmitPinjaman} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Input Fields */}
                <div className="space-y-3 md:col-span-1">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Pilih Calon Peminjam *
                    </label>
                    <select
                      value={selectedNasabahId}
                      onChange={(e) => setSelectedNasabahId(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 outline-none"
                    >
                      {nasabahList.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nama} ({n.desa}) - NIK: {n.nik}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Jumlah Pinjaman (Rp) *
                    </label>
                    <input
                      type="number"
                      step={500000}
                      min={1000000}
                      value={jumlahPinjaman}
                      onChange={(e) => setJumlahPinjaman(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-green-500 outline-none"
                    />
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Terbilang: {formatRupiah(jumlahPinjaman)}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Jangka Waktu / Tenor (Bulan) *
                    </label>
                    <select
                      value={tenorBulan}
                      onChange={(e) => setTenorBulan(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 outline-none"
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
                      Tujuan Penggunaan Pinjaman *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Contoh: Pembelian bibit jagung & modal operasional warung"
                      value={tujuanPinjaman}
                      onChange={(e) => setTujuanPinjaman(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Agunan / Jaminan Fisik *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Contoh: BPKB Motor Honda Vario & Surat Keterangan Tanah"
                      value={jaminan}
                      onChange={(e) => setJaminan(e.target.value)}
                      className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#00a65a] hover:bg-[#008d4c] text-white py-2 rounded font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Ajukan Permohonan ke Kepala Unit</span>
                  </button>
                </div>

                {/* Live Amortization Schedule Preview (2 Cols) */}
                <div className="md:col-span-2 bg-gray-50 p-3 rounded border border-gray-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <div>
                        <div className="font-bold text-gray-800">
                          Pratinjau Jadwal Angsuran Bunga 0,5% Menurun
                        </div>
                        <div className="text-[11px] text-gray-500">
                          Pokok: {formatRupiah(jumlahPinjaman)} &bull; Tenor: {tenorBulan} Bulan &bull; Bunga: 0,5% / Bulan Menurun
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenSimulasi}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[11px] font-semibold"
                      >
                        Buka Layar Penuh
                      </button>
                    </div>

                    {/* Ringkasan Biaya */}
                    <div className="grid grid-cols-3 gap-2 my-2 text-center text-[11px]">
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <span className="text-gray-400 block text-[10px]">Angsuran Bln ke-1</span>
                        <span className="font-bold text-blue-700">
                          {formatRupiah(liveSimulasi.angsuranBulanPertama)}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <span className="text-gray-400 block text-[10px]">Angsuran Bln Terakhir</span>
                        <span className="font-bold text-emerald-700">
                          {formatRupiah(liveSimulasi.angsuranBulanTerakhir)}
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded border border-gray-200">
                        <span className="text-gray-400 block text-[10px]">Total Bunga Selama Tenor</span>
                        <span className="font-bold text-amber-600">
                          {formatRupiah(liveSimulasi.totalBunga)}
                        </span>
                      </div>
                    </div>

                    {/* Mini table preview */}
                    <div className="max-h-56 overflow-y-auto border border-gray-200 rounded bg-white">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-gray-100 text-gray-600 sticky top-0">
                          <tr>
                            <th className="p-1.5">Bulan</th>
                            <th className="p-1.5">Sisa Pokok Awal</th>
                            <th className="p-1.5">Angsuran Pokok</th>
                            <th className="p-1.5 text-amber-700">Bunga (0.5%)</th>
                            <th className="p-1.5 font-bold">Total Angsuran</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {liveSimulasi.jadwal.map((j) => (
                            <tr key={j.bulanKe} className="hover:bg-blue-50/50">
                              <td className="p-1.5 font-bold text-gray-700">Bln #{j.bulanKe}</td>
                              <td className="p-1.5 font-mono">{formatRupiah(j.sisaPokokAwal)}</td>
                              <td className="p-1.5 font-mono">{formatRupiah(j.angsuranPokok)}</td>
                              <td className="p-1.5 font-mono text-amber-700 font-semibold">
                                {formatRupiah(j.bungaBulanIni)}
                              </td>
                              <td className="p-1.5 font-mono font-bold text-emerald-700">
                                {formatRupiah(j.totalAngsuran)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 mt-2">
                    * Bunga menurun menguntungkan nasabah karena bunga dihitung dari sisa pinjaman yang terus mengecil setiap bulannya.
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: INPUT SIMPANAN */}
      {activeTab === 'input_simpanan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 bg-white rounded shadow-xs border-t-3 border-t-[#f39c12] border-x border-b border-gray-200 p-4">
            <h2 className="font-bold text-gray-800 text-sm flex items-center mb-3">
              <PiggyBank className="w-4 h-4 text-[#f39c12] mr-2" />
              Catat Setoran / Penarikan Simpanan
            </h2>

            {formErrorSimpanan && (
              <div className="mb-3 p-2 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-1.5 text-[11px]">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formErrorSimpanan}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSimpanan} className="space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Pilih Nasabah Penyimpan *
                </label>
                <select
                  value={simpananNasabahId}
                  onChange={(e) => setSimpananNasabahId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 outline-none"
                >
                  {nasabahList.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.nama} - {n.desa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Jenis Simpanan *
                  </label>
                  <select
                    value={jenisSimpanan}
                    onChange={(e) => setJenisSimpanan(e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
                  >
                    <option value="pokok">Simpanan Pokok</option>
                    <option value="wajib">Simpanan Wajib</option>
                    <option value="sukarela">Simpanan Sukarela</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Jenis Transaksi *
                  </label>
                  <select
                    value={tipeSimpanan}
                    onChange={(e) => setTipeSimpanan(e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs font-semibold"
                  >
                    <option value="setor">Setor Simpanan</option>
                    <option value="tarik">Penarikan Dana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Jumlah Nominal (Rp) *
                </label>
                <input
                  type="number"
                  step={25000}
                  min={10000}
                  value={jumlahSimpanan}
                  onChange={(e) => setJumlahSimpanan(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Keterangan Transaksi
                </label>
                <input
                  type="text"
                  placeholder="Setoran wajib rutin bulan berjalan"
                  value={ketSimpanan}
                  onChange={(e) => setKetSimpanan(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#f39c12] hover:bg-[#e08e0b] text-white py-2 rounded font-bold text-xs shadow-xs flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Simpan & Cetak Bukti Kwitansi</span>
              </button>
            </form>
          </div>

          {/* Buku Transaksi Simpanan Terakhir */}
          <div className="lg:col-span-2 bg-white rounded shadow-xs border-t-3 border-t-[#f39c12] border-x border-b border-gray-200">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 text-xs">
                Buku Mutasi Simpanan Anggota KSP Nubatukan
              </h3>
              <span className="text-[10px] text-gray-500">
                {simpananList.length} Transaksi Tercatat
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200 text-[10px] uppercase">
                    <th className="p-2.5">No Kwitansi</th>
                    <th className="p-2.5">Tanggal</th>
                    <th className="p-2.5">Nama Nasabah</th>
                    <th className="p-2.5">Jenis</th>
                    <th className="p-2.5">Tipe</th>
                    <th className="p-2.5">Nominal</th>
                    <th className="p-2.5 text-right">Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {simpananList.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50">
                      <td className="p-2.5 font-mono font-bold text-blue-700">
                        {trx.kodeTransaksi}
                      </td>
                      <td className="p-2.5 text-gray-500">{formatTanggal(trx.tanggal)}</td>
                      <td className="p-2.5 font-semibold text-gray-800">{trx.nasabahNama}</td>
                      <td className="p-2.5 uppercase font-medium text-gray-600">
                        {trx.jenisSimpanan}
                      </td>
                      <td className="p-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            trx.tipe === 'setor'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {trx.tipe === 'setor' ? '+ Setoran' : '- Penarikan'}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold font-mono text-gray-900">
                        {formatRupiah(trx.jumlah)}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            const nsb = nasabahList.find((n) => n.id === trx.nasabahId);
                            onPrintKwitansi({
                              tipe: 'simpanan',
                              nomor: trx.kodeTransaksi,
                              nama: trx.nasabahNama,
                              nik: nsb?.nik || '-',
                              nominal: trx.jumlah,
                              keterangan: `Transaksi Simpanan ${trx.jenisSimpanan.toUpperCase()} (${trx.keterangan})`,
                              tanggal: formatTanggal(trx.tanggal),
                              petugas: trx.petugasNama,
                            });
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] font-semibold flex items-center space-x-1 ml-auto"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Cetak</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BAYAR ANGSURAN & KWITANSI */}
      {activeTab === 'bayar_angsuran' && (
        <div className="space-y-4">
          {/* Banner Pengingat Otomatis WhatsApp Jatuh Tempo */}
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded text-white p-3.5 shadow-xs border-l-4 border-[#25D366] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-gray-950 flex items-center justify-center shrink-0 shadow-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs flex items-center space-x-2">
                  <span>Sistem Notifikasi WhatsApp Otomatis Nasabah Jatuh Tempo</span>
                  <span className="bg-[#25D366] text-gray-950 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                    Aktif
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 mt-0.5 leading-snug">
                  Kirim pesan WhatsApp otomatis berisi rincian angsuran pokok + bunga 0,5% menurun dan tanggal jatuh tempo langsung ke nomor peminjam atau penjamin.
                </p>
                {waLogs.length > 0 && (
                  <div className="text-[10px] text-emerald-200 mt-1 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>Riwayat pengiriman: {waLogs.length} pesan WA telah tercatat terkirim di sistem</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => kirimSemuaWaJatuhTempoOtomatis()}
                className="bg-[#25D366] hover:bg-[#1ebd59] text-gray-950 px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim WA Otomatis Semua Debitur</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded shadow-xs border-t-3 border-t-[#3c8dbc] border-x border-b border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
              <div>
                <h2 className="font-bold text-gray-800 text-sm flex items-center">
                  <Receipt className="w-4 h-4 text-[#3c8dbc] mr-2" />
                  Pencatatan Angsuran & Kwitansi Resmi (Bunga 0,5% Menurun)
                </h2>
                <p className="text-gray-500 text-[11px]">
                  Bunga menurun dihitung otomatis dari sisa pokok berjalan setiap bulannya.
                </p>
              </div>

              {/* Selector Pinjaman */}
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">Pilih Rekening Pinjaman:</span>
                <select
                  value={selectedPinjamanId}
                  onChange={(e) => setSelectedPinjamanId(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-xs font-semibold"
                >
                  {pinjamanList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.kodePinjaman} - {p.nasabahNama} ({formatRupiah(p.jumlahPinjaman)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Kartu Status Pinjaman Terpilih */}
            {currentSelectedPinjaman && (
              <div className="my-4 p-3 bg-blue-50/50 rounded border border-blue-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px]">Nama Nasabah / NIK:</span>
                  <div className="font-bold text-gray-800">
                    {currentSelectedPinjaman.nasabahNama}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {currentSelectedPinjaman.nik}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px]">Plafon Pokok / Tenor:</span>
                  <div className="font-bold text-gray-800">
                    {formatRupiah(currentSelectedPinjaman.jumlahPinjaman)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {currentSelectedPinjaman.tenorBulan} Bulan (Bunga 0,5% Menurun)
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px]">Sisa Pokok Pinjaman:</span>
                  <div className="font-bold text-emerald-700 font-mono">
                    {formatRupiah(currentSelectedPinjaman.sisaPokok)}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Terbayar: {currentSelectedPinjaman.angsuranTerbayar} /{' '}
                    {currentSelectedPinjaman.totalAngsuranCount} Bulan
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px]">Status & Petugas Lapangan:</span>
                  <div className="font-bold text-blue-800 uppercase">
                    {currentSelectedPinjaman.status.replace('_', ' ')}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {currentSelectedPinjaman.petugasNama}
                  </div>
                </div>
              </div>
            )}

            {/* Tabel Jadwal Angsuran Pinjaman Terpilih */}
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Bulan Ke</th>
                    <th className="p-2.5">Sisa Pokok Awal</th>
                    <th className="p-2.5">Pokok</th>
                    <th className="p-2.5 text-amber-700">Bunga 0,5% (Menurun)</th>
                    <th className="p-2.5 font-bold">Total Angsuran</th>
                    <th className="p-2.5">Sisa Pokok Akhir</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSelectedPinjaman?.jadwal.map((jadwal) => (
                    <tr
                      key={jadwal.bulanKe}
                      className={jadwal.status === 'lunas' ? 'bg-emerald-50/30' : 'hover:bg-gray-50'}
                    >
                      <td className="p-2.5 font-bold text-gray-800">Bulan #{jadwal.bulanKe}</td>
                      <td className="p-2.5 font-mono">{formatRupiah(jadwal.sisaPokokAwal)}</td>
                      <td className="p-2.5 font-mono">{formatRupiah(jadwal.angsuranPokok)}</td>
                      <td className="p-2.5 font-mono font-bold text-amber-700">
                        {formatRupiah(jadwal.bungaBulanIni)}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-emerald-800">
                        {formatRupiah(jadwal.totalAngsuran)}
                      </td>
                      <td className="p-2.5 font-mono text-gray-600">
                        {formatRupiah(jadwal.sisaPokokAkhir)}
                      </td>
                      <td className="p-2.5">
                        {jadwal.status === 'lunas' ? (
                          <span className="bg-[#00a65a] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            Lunas ({jadwal.tanggalBayar})
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Belum Bayar
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-right">
                        {jadwal.status === 'lunas' ? (
                          <button
                            onClick={() =>
                              onPrintKwitansi({
                                tipe: 'angsuran',
                                nomor: jadwal.kwitansiNo || 'KWT-ANGS',
                                nama: currentSelectedPinjaman.nasabahNama,
                                nik: currentSelectedPinjaman.nik,
                                nominal: jadwal.totalAngsuran,
                                keterangan: `Angsuran Bulan ke-${jadwal.bulanKe} (Pokok: ${formatRupiah(
                                  jadwal.angsuranPokok
                                )}, Bunga: ${formatRupiah(jadwal.bungaBulanIni)})`,
                                tanggal: jadwal.tanggalBayar || formatTanggal(new Date().toISOString()),
                                petugas: currentSelectedPinjaman.petugasNama,
                                detailTambahan: `Sisa Pokok: ${formatRupiah(jadwal.sisaPokokAkhir)}`,
                              })
                            }
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] font-medium inline-flex items-center space-x-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Cetak Ulang</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => openWhatsAppReminder(currentSelectedPinjaman, jadwal)}
                              className="bg-[#25D366] hover:bg-[#1ebd59] text-white px-2.5 py-1 rounded text-[10px] font-bold inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                              title="Kirim pesan WhatsApp otomatis jatuh tempo ke nasabah ini"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Kirim WA</span>
                            </button>
                            <button
                              onClick={() =>
                                handlePayInstallment(currentSelectedPinjaman.id, jadwal.bulanKe)
                              }
                              className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1 rounded text-[10px] font-bold inline-flex items-center space-x-1 shadow-xs cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Terima Bayar</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DAFTAR NASABAH & DATA IDENTITAS LENGKAP */}
      {activeTab === 'data_nasabah' && (
        <div className="bg-white rounded shadow-xs border-t-3 border-t-gray-700 border-x border-b border-gray-200">
          <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-gray-800 text-xs sm:text-sm">
              Database Peminjam & Kerabat Penjamin KSP Cabang Nubatukan
            </h3>
            <div className="w-64">
              <input
                type="text"
                placeholder="Filter NIK, Nama, Desa..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200 text-[10px] uppercase">
                  <th className="p-2.5">ID / Nama Peminjam</th>
                  <th className="p-2.5">KTP & KK Peminjam</th>
                  <th className="p-2.5">No HP Peminjam</th>
                  <th className="p-2.5">Penjamin & KTP Penjamin</th>
                  <th className="p-2.5">No HP Kerabat</th>
                  <th className="p-2.5">Wilayah / Alamat</th>
                  <th className="p-2.5">Pekerjaan</th>
                  <th className="p-2.5">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {nasabahList
                  .filter(
                    (n) =>
                      n.nama.toLowerCase().includes(searchFilter.toLowerCase()) ||
                      n.nik.includes(searchFilter) ||
                      n.desa.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50">
                      <td className="p-2.5">
                        <div className="font-bold text-gray-900">{n.nama}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{n.id}</div>
                      </td>
                      <td className="p-2.5 font-mono text-[11px]">
                        <div>KTP: <span className="font-semibold text-gray-800">{n.nik}</span></div>
                        <div className="text-gray-500">KK: {n.noKk}</div>
                      </td>
                      <td className="p-2.5 font-mono text-gray-800">
                        <a href={`tel:${n.noHp}`} className="hover:underline flex items-center">
                          <Phone className="w-3 h-3 mr-1 text-emerald-600" />
                          {n.noHp}
                        </a>
                      </td>
                      <td className="p-2.5">
                        <div className="font-semibold text-gray-800">{n.namaPenjamin}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          NIK: {n.nikPenjamin}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono">
                        <div className="text-gray-800 font-semibold">{n.noHpKerabat}</div>
                        <div className="text-[10px] text-gray-500">{n.hubunganKerabat}</div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-semibold text-gray-800">{n.desa}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[150px]">
                          {n.alamat}
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div>{n.pekerjaan}</div>
                        <div className="text-[10px] text-gray-500">
                          {formatRupiah(n.penghasilanBulanan)}/bln
                        </div>
                      </td>
                      <td className="p-2.5 text-gray-600 text-[11px]">{n.petugasNama}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
