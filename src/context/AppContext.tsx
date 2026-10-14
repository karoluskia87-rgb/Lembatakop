import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Nasabah,
  Pinjaman,
  TransaksiSimpanan,
  EvaluasiUnit,
  PembinaanManager,
  CabangConfig,
  JadwalAngsuran,
  LogPesanWhatsApp,
} from '../types';
import {
  initialUsers,
  initialNasabah,
  initialPinjaman,
  initialSimpanan,
  initialEvaluasiUnit,
  initialPembinaanManager,
  initialCabangConfig,
} from '../data/initialData';
import { hitungSimulasiBungaMenurun } from '../utils/loanCalculations';
import { buatTemplatePesanWa } from '../utils/whatsappTemplates';

interface ToastNotice {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  nasabahList: Nasabah[];
  pinjamanList: Pinjaman[];
  simpananList: TransaksiSimpanan[];
  evaluasiList: EvaluasiUnit[];
  pembinaanList: PembinaanManager[];
  cabangConfig: CabangConfig;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toasts: ToastNotice[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Auth methods
  login: (username: string, password: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  quickSwitchRole: (role: UserRole) => void;

  // Petugas Lapangan methods
  tambahNasabah: (nasabah: Omit<Nasabah, 'id' | 'tanggalDaftar' | 'status' | 'petugasId' | 'petugasNama'>) => Nasabah;
  updateNasabah: (id: string, nasabahData: Partial<Nasabah>) => boolean;
  ajukanPinjaman: (
    nasabahId: string,
    jumlahPinjaman: number,
    tenorBulan: number,
    tujuanPinjaman: string,
    jaminan: string
  ) => Pinjaman;
  catatSimpanan: (
    nasabahId: string,
    jenisSimpanan: 'pokok' | 'wajib' | 'sukarela',
    tipe: 'setor' | 'tarik',
    jumlah: number,
    keterangan: string
  ) => TransaksiSimpanan;
  bayarAngsuran: (pinjamanId: string, bulanKe: number) => { success: boolean; kwitansiNo: string };

  // Kepala Unit methods
  evaluasiPinjamanOlehUnit: (
    pinjamanId: string,
    characterScore: number,
    capacityScore: number,
    capitalScore: number,
    collateralScore: number,
    conditionScore: number,
    catatan: string,
    keputusan: 'disetujui' | 'ditolak'
  ) => void;

  // Kepala Manager methods
  approvalPinjamanOlehManager: (pinjamanId: string, catatan: string, keputusan: 'disetujui' | 'ditolak') => void;
  tambahArahanPembinaan: (
    targetStaf: string,
    perihal: string,
    kategori: 'mitigasi_risiko' | 'disiplin_kredit' | 'pembinaan_npl' | 'apresiasi_target' | 'kebijakan_operasional',
    isiArahan: string
  ) => void;
  selesaikanPembinaan: (id: string) => void;

  // Admin methods
  tambahUser: (userData: Omit<User, 'id' | 'lastLogin'>) => User;
  updateUser: (userId: string, updated: Partial<User>) => void;
  hapusUser: (userId: string) => void;
  updateCabangConfig: (config: Partial<CabangConfig>) => void;
  resetDataKeAwal: () => void;

  // WhatsApp Reminder methods
  whatsappModalData: {
    isOpen: boolean;
    pinjaman: Pinjaman | null;
    jadwal: JadwalAngsuran | null;
  };
  openWhatsAppReminder: (pinjaman: Pinjaman, jadwal: JadwalAngsuran) => void;
  closeWhatsAppReminder: () => void;
  kirimSemuaWaJatuhTempoOtomatis: () => { count: number; debitorList: string[] };
  waLogs: LogPesanWhatsApp[];
  tambahWaLog: (log: LogPesanWhatsApp) => void;
  bersihkanWaLogs: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}:`, err);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => safeParse('ksp_nbt_users', initialUsers));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = safeParse<User | null>('ksp_nbt_current_user', null);
    // If not logged in yet, default to Petugas Lapangan so user can start testing immediately
    return saved || initialUsers[0];
  });
  const [nasabahList, setNasabahList] = useState<Nasabah[]>(() => safeParse('ksp_nbt_nasabah', initialNasabah));
  const [pinjamanList, setPinjamanList] = useState<Pinjaman[]>(() => safeParse('ksp_nbt_pinjaman', initialPinjaman));
  const [simpananList, setSimpananList] = useState<TransaksiSimpanan[]>(() => safeParse('ksp_nbt_simpanan', initialSimpanan));
  const [evaluasiList, setEvaluasiList] = useState<EvaluasiUnit[]>(() => safeParse('ksp_nbt_evaluasi', initialEvaluasiUnit));
  const [pembinaanList, setPembinaanList] = useState<PembinaanManager[]>(() => safeParse('ksp_nbt_pembinaan', initialPembinaanManager));
  const [cabangConfig, setCabangConfig] = useState<CabangConfig>(() => safeParse('ksp_nbt_cabang', initialCabangConfig));

  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  // WhatsApp Reminder State
  const [whatsappModalData, setWhatsappModalData] = useState<{
    isOpen: boolean;
    pinjaman: Pinjaman | null;
    jadwal: JadwalAngsuran | null;
  }>({
    isOpen: false,
    pinjaman: null,
    jadwal: null,
  });

  const [waLogs, setWaLogs] = useState<LogPesanWhatsApp[]>(() =>
    safeParse<LogPesanWhatsApp[]>('ksp_nbt_wa_logs', [])
  );

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem('ksp_nbt_users', JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('ksp_nbt_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('ksp_nbt_current_user');
      }
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('ksp_nbt_nasabah', JSON.stringify(nasabahList));
    } catch {}
  }, [nasabahList]);

  useEffect(() => {
    try {
      localStorage.setItem('ksp_nbt_pinjaman', JSON.stringify(pinjamanList));
    } catch {}
  }, [pinjamanList]);

  useEffect(() => {
    try {
      localStorage.setItem('ksp_nbt_simpanan', JSON.stringify(simpananList));
    } catch {}
  }, [simpananList]);

  useEffect(() => {
    try {
      localStorage.setItem('ksp_nbt_evaluasi', JSON.stringify(evaluasiList));
    } catch {}
  }, [evaluasiList]);

  useEffect(() => {
    try {
      localStorage.setItem('ksp_nbt_pembinaan', JSON.stringify(pembinaanList));
    } catch {}
  }, [pembinaanList]);

  useEffect(() => {
    try {
      localStorage.setItem('ksp_nbt_cabang', JSON.stringify(cabangConfig));
    } catch {}
  }, [cabangConfig]);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Auth
  const login = (username: string, pass: string): boolean => {
    const found = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === pass
    );
    if (found && found.status === 'aktif') {
      const now = new Date();
      const updatedUser = {
        ...found,
        lastLogin: `${now.getDate()} ${now.toLocaleString('id-ID', { month: 'short' })} ${now.getFullYear()}, ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`,
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
      setActiveMenu('dashboard');
      addToast(`Selamat datang, ${found.name}! Login berhasil sebagai ${found.role.replace('_', ' ').toUpperCase()}`, 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    addToast('Anda telah berhasil keluar dari sistem.', 'info');
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      addToast(`Beralih ke akun: ${found.name}`, 'info');
    }
  };

  const quickSwitchRole = (role: UserRole) => {
    const userRole = users.find((u) => u.role === role);
    if (userRole) {
      setCurrentUser(userRole);
      addToast(`Akses aktif diubah menjadi: ${userRole.name} (${userRole.role.replace('_', ' ').toUpperCase()})`, 'info');
    }
  };

  // Petugas Lapangan operations
  const tambahNasabah = (
    nasabahData: Omit<Nasabah, 'id' | 'tanggalDaftar' | 'status' | 'petugasId' | 'petugasNama'>
  ): Nasabah => {
    const newId = `NSB-${String(nasabahList.length + 1).padStart(3, '0')}`;
    const newNasabah: Nasabah = {
      ...nasabahData,
      id: newId,
      status: 'aktif',
      tanggalDaftar: new Date().toISOString().split('T')[0],
      petugasId: currentUser?.id || 'USR-001',
      petugasNama: currentUser?.name || 'Petugas Lapangan',
    };
    setNasabahList((prev) => [newNasabah, ...prev]);
    addToast(`Data nasabah ${newNasabah.nama} berhasil didaftarkan!`, 'success');
    return newNasabah;
  };

  const updateNasabah = (id: string, nasabahData: Partial<Nasabah>): boolean => {
    // Validasi otorisasi: Hanya Petugas Lapangan yang boleh mengubah data nasabah
    if (currentUser?.role !== 'petugas') {
      addToast(
        'Akses Ditolak: Hanya Petugas Lapangan yang memiliki hak akses untuk mengubah data nasabah.',
        'error'
      );
      return false;
    }

    const target = nasabahList.find((n) => n.id === id);
    if (!target) {
      addToast(`Data nasabah dengan ID ${id} tidak ditemukan.`, 'error');
      return false;
    }

    const updatedNasabah: Nasabah = {
      ...target,
      ...nasabahData,
      id: target.id,
      tanggalDaftar: target.tanggalDaftar,
      petugasId: target.petugasId,
      petugasNama: target.petugasNama,
    };

    setNasabahList((prev) =>
      prev.map((n) => (n.id === id ? updatedNasabah : n))
    );

    // Sinkronkan nama, NIK, dan noHp ke pinjaman yang terkait
    if (
      nasabahData.nama !== undefined ||
      nasabahData.nik !== undefined ||
      nasabahData.noHp !== undefined
    ) {
      setPinjamanList((prev) =>
        prev.map((p) => {
          if (p.nasabahId === id) {
            return {
              ...p,
              nasabahNama: updatedNasabah.nama,
              nik: updatedNasabah.nik,
              noHp: updatedNasabah.noHp,
            };
          }
          return p;
        })
      );
    }

    addToast(`Data nasabah ${updatedNasabah.nama} (${updatedNasabah.id}) berhasil diperbarui!`, 'success');
    return true;
  };

  const ajukanPinjaman = (
    nasabahId: string,
    jumlahPinjaman: number,
    tenorBulan: number,
    tujuanPinjaman: string,
    jaminan: string
  ): Pinjaman => {
    const nasabah = nasabahList.find((n) => n.id === nasabahId);
    const codeNum = String(pinjamanList.length + 1).padStart(3, '0');
    const simulation = hitungSimulasiBungaMenurun(jumlahPinjaman, tenorBulan, 0.5);

    const newPinjaman: Pinjaman = {
      id: `PINJ-2026-${codeNum}`,
      kodePinjaman: `PJ-NBT-${codeNum}`,
      nasabahId,
      nasabahNama: nasabah?.nama || 'Nasabah',
      nik: nasabah?.nik || '',
      noHp: nasabah?.noHp || '',
      tanggalPengajuan: new Date().toISOString().split('T')[0],
      jumlahPinjaman,
      tenorBulan,
      sukuBungaPerBulan: 0.5,
      tujuanPinjaman,
      jaminan,
      status: 'menunggu_evaluasi',
      kolektibilitas: 1,
      sisaPokok: jumlahPinjaman,
      angsuranTerbayar: 0,
      totalAngsuranCount: tenorBulan,
      petugasId: currentUser?.id || 'USR-001',
      petugasNama: currentUser?.name || 'Petugas Lapangan',
      jadwal: simulation.jadwal,
    };

    setPinjamanList((prev) => [newPinjaman, ...prev]);
    addToast(`Permohonan pinjaman ${newPinjaman.kodePinjaman} berhasil diajukan ke Kepala Unit!`, 'success');
    return newPinjaman;
  };

  const catatSimpanan = (
    nasabahId: string,
    jenisSimpanan: 'pokok' | 'wajib' | 'sukarela',
    tipe: 'setor' | 'tarik',
    jumlah: number,
    keterangan: string
  ): TransaksiSimpanan => {
    const nasabah = nasabahList.find((n) => n.id === nasabahId);
    const newTrx: TransaksiSimpanan = {
      id: `SMP-${Date.now()}`,
      kodeTransaksi: `TRX-SMP-${String(simpananList.length + 1).padStart(2, '0')}`,
      nasabahId,
      nasabahNama: nasabah?.nama || 'Nasabah',
      jenisSimpanan,
      tipe,
      jumlah,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan,
      petugasId: currentUser?.id || 'USR-001',
      petugasNama: currentUser?.name || 'Petugas Lapangan',
    };
    setSimpananList((prev) => [newTrx, ...prev]);
    addToast(`Transaksi simpanan ${newTrx.kodeTransaksi} berhasil dibukukan!`, 'success');
    return newTrx;
  };

  const bayarAngsuran = (
    pinjamanId: string,
    bulanKe: number
  ): { success: boolean; kwitansiNo: string } => {
    const kwitansiNo = `KWT-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const todayStr = new Date().toISOString().split('T')[0];

    let success = false;
    setPinjamanList((prev) =>
      prev.map((pinj) => {
        if (pinj.id !== pinjamanId) return pinj;

        let newTerbayar = pinj.angsuranTerbayar;
        let newSisaPokok = pinj.sisaPokok;

        const updatedJadwal = pinj.jadwal.map((item) => {
          if (item.bulanKe === bulanKe && item.status !== 'lunas') {
            success = true;
            newTerbayar += 1;
            newSisaPokok = item.sisaPokokAkhir;
            return {
              ...item,
              status: 'lunas' as const,
              tanggalBayar: todayStr,
              kwitansiNo,
            };
          }
          return item;
        });

        const isFullyPaid = newTerbayar >= pinj.totalAngsuranCount;

        return {
          ...pinj,
          jadwal: updatedJadwal,
          angsuranTerbayar: newTerbayar,
          sisaPokok: newSisaPokok,
          status: isFullyPaid ? ('lunas' as const) : pinj.status,
        };
      })
    );

    if (success) {
      addToast(`Angsuran bulan ke-${bulanKe} berhasil dibayar (Kwitansi: ${kwitansiNo})`, 'success');
    }

    return { success, kwitansiNo };
  };

  // Kepala Unit
  const evaluasiPinjamanOlehUnit = (
    pinjamanId: string,
    characterScore: number,
    capacityScore: number,
    capitalScore: number,
    collateralScore: number,
    conditionScore: number,
    catatan: string,
    keputusan: 'disetujui' | 'ditolak'
  ) => {
    const pinj = pinjamanList.find((p) => p.id === pinjamanId);
    const today = new Date().toISOString().split('T')[0];

    const newEval: EvaluasiUnit = {
      id: `EVL-${Date.now()}`,
      pinjamanId,
      nasabahNama: pinj?.nasabahNama || 'Nasabah',
      tanggal: today,
      evaluator: currentUser?.name || 'Kepala Unit',
      characterScore,
      capacityScore,
      capitalScore,
      collateralScore,
      conditionScore,
      rekomendasi: keputusan === 'disetujui' ? 'setuju' : 'tolak',
      catatanEvaluasi: catatan,
      limitDisarankan: pinj?.jumlahPinjaman || 0,
    };

    setEvaluasiList((prev) => [newEval, ...prev]);

    setPinjamanList((prev) =>
      prev.map((p) => {
        if (p.id !== pinjamanId) return p;
        return {
          ...p,
          status: keputusan === 'disetujui' ? ('disetujui_unit' as const) : ('ditolak' as const),
          catatanUnit: catatan,
          evaluatorUnit: currentUser?.name || 'Kepala Unit',
          tanggalEvaluasiUnit: today,
        };
      })
    );

    addToast(`Evaluasi pinjaman ${pinj?.kodePinjaman} telah disimpan (${keputusan.toUpperCase()})`, 'success');
  };

  // Kepala Manager
  const approvalPinjamanOlehManager = (
    pinjamanId: string,
    catatan: string,
    keputusan: 'disetujui' | 'ditolak'
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const pinj = pinjamanList.find((p) => p.id === pinjamanId);

    setPinjamanList((prev) =>
      prev.map((p) => {
        if (p.id !== pinjamanId) return p;
        return {
          ...p,
          status: keputusan === 'disetujui' ? ('disetujui_manager' as const) : ('ditolak' as const),
          catatanManager: catatan,
          evaluatorManager: currentUser?.name || 'Kepala Manager',
          tanggalApprovalManager: today,
          tanggalDisetujui: keputusan === 'disetujui' ? today : p.tanggalDisetujui,
        };
      })
    );

    addToast(`Otorisasi pinjaman ${pinj?.kodePinjaman} oleh Kepala Manager berhasil (${keputusan.toUpperCase()})`, 'success');
  };

  const tambahArahanPembinaan = (
    targetStaf: string,
    perihal: string,
    kategori: 'mitigasi_risiko' | 'disiplin_kredit' | 'pembinaan_npl' | 'apresiasi_target' | 'kebijakan_operasional',
    isiArahan: string
  ) => {
    const newPembinaan: PembinaanManager = {
      id: `PBN-${Date.now()}`,
      tanggal: new Date().toISOString().split('T')[0],
      targetStaf,
      perihal,
      kategori,
      isiArahan,
      statusTindakLanjut: 'dalam_proses',
      dibuatOleh: currentUser?.name || 'Drs. Fransiskus Making (Kepala Manager)',
    };
    setPembinaanList((prev) => [newPembinaan, ...prev]);
    addToast(`Memo pembinaan "${perihal}" berhasil diterbitkan!`, 'success');
  };

  const selesaikanPembinaan = (id: string) => {
    setPembinaanList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, statusTindakLanjut: 'selesai' } : item))
    );
    addToast('Status tindak lanjut pembinaan ditandai selesai.', 'info');
  };

  // Admin
  const tambahUser = (userData: Omit<User, 'id' | 'lastLogin'>): User => {
    const newId = `USR-${String(users.length + 1).padStart(3, '0')}`;
    const newUser: User = {
      ...userData,
      id: newId,
      lastLogin: '-',
    };
    setUsers((prev) => [...prev, newUser]);
    addToast(`Pengguna baru ${newUser.name} berhasil dibuat!`, 'success');
    return newUser;
  };

  const updateUser = (userId: string, updated: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const res = { ...u, ...updated };
          if (currentUser?.id === userId) {
            setCurrentUser(res);
          }
          return res;
        }
        return u;
      })
    );
    addToast('Data akun pengguna & password berhasil diperbarui!', 'success');
  };

  const hapusUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    addToast('Pengguna telah dihapus.', 'info');
  };

  const updateCabangConfig = (config: Partial<CabangConfig>) => {
    setCabangConfig((prev) => ({ ...prev, ...config }));
    addToast('Informasi profil Cabang Nubatukan berhasil disimpan.', 'success');
  };

  const resetDataKeAwal = () => {
    try {
      localStorage.clear();
    } catch {}
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setNasabahList(initialNasabah);
    setPinjamanList(initialPinjaman);
    setSimpananList(initialSimpanan);
    setEvaluasiList(initialEvaluasiUnit);
    setPembinaanList(initialPembinaanManager);
    setCabangConfig(initialCabangConfig);
    setActiveMenu('dashboard');
    addToast('Seluruh data simulasi berhasil direset ke kondisi awal standar.', 'info');
  };

  const openWhatsAppReminder = (pinjaman: Pinjaman, jadwal: JadwalAngsuran) => {
    // Validasi otorisasi: Pengiriman WhatsApp pengingat jatuh tempo hanya diizinkan untuk Petugas Lapangan
    if (currentUser?.role !== 'petugas') {
      addToast(
        'Akses Dibatasi: Pengiriman pesan WhatsApp penagihan/jatuh tempo hanya dapat dilakukan oleh Petugas Lapangan.',
        'info'
      );
      return;
    }

    setWhatsappModalData({
      isOpen: true,
      pinjaman,
      jadwal,
    });
  };

  const closeWhatsAppReminder = () => {
    setWhatsappModalData({
      isOpen: false,
      pinjaman: null,
      jadwal: null,
    });
  };

  const tambahWaLog = (log: LogPesanWhatsApp) => {
    setWaLogs((prev) => {
      const updated = [log, ...prev];
      try {
        localStorage.setItem('ksp_nbt_wa_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const bersihkanWaLogs = () => {
    setWaLogs([]);
    try {
      localStorage.removeItem('ksp_nbt_wa_logs');
    } catch {}
    addToast('Riwayat pengiriman WhatsApp berhasil dibersihkan.', 'info');
  };

  const kirimSemuaWaJatuhTempoOtomatis = (): { count: number; debitorList: string[] } => {
    // Validasi otorisasi: Pengiriman pesan WhatsApp otomatis hanya untuk Petugas Lapangan
    if (currentUser?.role !== 'petugas') {
      addToast(
        'Akses Ditolak: Fitur kirim pesan otomatis WhatsApp jatuh tempo hanya boleh diakses oleh Petugas Lapangan.',
        'error'
      );
      return { count: 0, debitorList: [] };
    }

    // Cari debitur yang pinjamannya aktif dan memiliki angsuran belum lunas / jatuh tempo
    // Catatan: Jika user petugas lapangan memiliki debitur binaan khusus, dapat difilter; defaultnya semua debitur jatuh tempo cabang yang ditugaskan kepada petugas lapangan
    const activeLoans = pinjamanList.filter(
      (p) =>
        p.status === 'disetujui_manager' &&
        p.sisaPokok > 0 &&
        (!currentUser?.id || !p.petugasId || p.petugasId === currentUser.id || p.petugasNama === currentUser.name || currentUser.role === 'petugas')
    );

    const generatedLogs: LogPesanWhatsApp[] = [];
    const debitorNames: string[] = [];

    activeLoans.forEach((pinj) => {
      // Cari angsuran pertama yang belum lunas
      const unpaidJadwal = pinj.jadwal.find(
        (j) => j.status === 'jatuh_tempo' || j.status === 'belum_bayar'
      );

      if (unpaidJadwal) {
        debitorNames.push(pinj.nasabahNama);
        const nasabah = nasabahList.find((n) => n.id === pinj.nasabahId);
        const phone = pinj.noHp || nasabah?.noHp || '081234567890';
        const isOverdue = pinj.kolektibilitas > 1 || unpaidJadwal.status === 'jatuh_tempo';
        const tipePesan = isOverdue ? 'peringatan_terlambat' : 'pengingat_h3';

        const text = buatTemplatePesanWa({
          pinjaman: pinj,
          jadwal: unpaidJadwal,
          tipePesan,
          cabangConfig,
          namaPenerima: pinj.nasabahNama,
          isKerabat: false,
        });

        const newLog: LogPesanWhatsApp = {
          id: `WA-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          pinjamanId: pinj.id,
          nasabahNama: pinj.nasabahNama,
          noHp: phone,
          tipePenerima: 'peminjam',
          tipePesan,
          nominalAngsuran: unpaidJadwal.totalAngsuran,
          bulanKe: unpaidJadwal.bulanKe,
          tanggalJatuhTempo: unpaidJadwal.tanggalJatuhTempo,
          isiPesan: text,
          waktuKirim: `${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA`,
          petugasPengirim: currentUser?.name || 'Sistem Otomatis KSP',
          status: 'terkirim',
        };

        generatedLogs.push(newLog);
      }
    });

    if (generatedLogs.length > 0) {
      setWaLogs((prev) => {
        const updated = [...generatedLogs, ...prev];
        try {
          localStorage.setItem('ksp_nbt_wa_logs', JSON.stringify(updated));
        } catch {}
        return updated;
      });
      addToast(
        `Pengingat WhatsApp otomatis dikirim ke ${generatedLogs.length} debitur: ${debitorNames.join(', ')}!`,
        'success'
      );
    } else {
      addToast('Tidak ada nasabah dengan kewajiban jatuh tempo saat ini. Semua kredit lancar!', 'info');
    }

    return { count: generatedLogs.length, debitorList: debitorNames };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        nasabahList,
        pinjamanList,
        simpananList,
        evaluasiList,
        pembinaanList,
        cabangConfig,
        activeMenu,
        setActiveMenu,
        sidebarCollapsed,
        toggleSidebar,
        searchTerm,
        setSearchTerm,
        toasts,
        addToast,
        removeToast,
        login,
        logout,
        switchUser,
        quickSwitchRole,
        tambahNasabah,
        updateNasabah,
        ajukanPinjaman,
        catatSimpanan,
        bayarAngsuran,
        evaluasiPinjamanOlehUnit,
        approvalPinjamanOlehManager,
        tambahArahanPembinaan,
        selesaikanPembinaan,
        tambahUser,
        updateUser,
        hapusUser,
        updateCabangConfig,
        resetDataKeAwal,
        whatsappModalData,
        openWhatsAppReminder,
        closeWhatsAppReminder,
        kirimSemuaWaJatuhTempoOtomatis,
        waLogs,
        tambahWaLog,
        bersihkanWaLogs,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
