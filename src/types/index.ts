export type UserRole = 'petugas' | 'kepala_unit' | 'kepala_manager' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'aktif' | 'nonaktif';
  lastLogin: string;
}

export interface Nasabah {
  id: string;
  nik: string;
  noKk: string;
  nama: string;
  alamat: string;
  desa: string;
  noHp: string;
  namaPenjamin: string;
  nikPenjamin: string;
  noHpKerabat: string;
  hubunganKerabat: string;
  pekerjaan: string;
  penghasilanBulanan: number;
  status: 'aktif' | 'nonaktif';
  tanggalDaftar: string;
  petugasId: string;
  petugasNama: string;
}

export type StatusPinjaman = 'menunggu_evaluasi' | 'disetujui_unit' | 'disetujui_manager' | 'ditolak' | 'lunas';

export interface JadwalAngsuran {
  bulanKe: number;
  sisaPokokAwal: number;
  angsuranPokok: number;
  bungaBulanIni: number; // 0.5% dari sisaPokokAwal
  totalAngsuran: number;
  sisaPokokAkhir: number;
  status: 'lunas' | 'belum_bayar' | 'jatuh_tempo';
  tanggalJatuhTempo: string;
  tanggalBayar?: string;
  kwitansiNo?: string;
}

export interface Pinjaman {
  id: string;
  kodePinjaman: string;
  nasabahId: string;
  nasabahNama: string;
  nik: string;
  noHp: string;
  tanggalPengajuan: string;
  tanggalDisetujui?: string;
  jumlahPinjaman: number;
  tenorBulan: number;
  sukuBungaPerBulan: number; // 0.5% menurun
  tujuanPinjaman: string;
  jaminan: string;
  status: StatusPinjaman;
  kolektibilitas: 1 | 2 | 3 | 4 | 5; // 1: Lancar, 2: DPK, 3: Kurang Lancar, 4: Diragukan, 5: Macet
  sisaPokok: number;
  angsuranTerbayar: number;
  totalAngsuranCount: number;
  petugasId: string;
  petugasNama: string;
  catatanUnit?: string;
  evaluatorUnit?: string;
  tanggalEvaluasiUnit?: string;
  catatanManager?: string;
  evaluatorManager?: string;
  tanggalApprovalManager?: string;
  jadwal: JadwalAngsuran[];
}

export type JenisSimpanan = 'pokok' | 'wajib' | 'sukarela';

export interface TransaksiSimpanan {
  id: string;
  kodeTransaksi: string;
  nasabahId: string;
  nasabahNama: string;
  jenisSimpanan: JenisSimpanan;
  tipe: 'setor' | 'tarik';
  jumlah: number;
  tanggal: string;
  keterangan: string;
  petugasId: string;
  petugasNama: string;
}

export interface EvaluasiUnit {
  id: string;
  pinjamanId: string;
  nasabahNama: string;
  tanggal: string;
  evaluator: string;
  characterScore: number; // 1-100
  capacityScore: number;  // 1-100
  capitalScore: number;   // 1-100
  collateralScore: number;// 1-100
  conditionScore: number; // 1-100
  rekomendasi: 'setuju' | 'tinjau_kembali' | 'tolak';
  catatanEvaluasi: string;
  limitDisarankan: number;
}

export interface PembinaanManager {
  id: string;
  tanggal: string;
  targetStaf: string; // Nama staf atau 'Semua Petugas Lapangan'
  perihal: string;
  kategori: 'mitigasi_risiko' | 'disiplin_kredit' | 'pembinaan_npl' | 'apresiasi_target' | 'kebijakan_operasional';
  isiArahan: string;
  statusTindakLanjut: 'dalam_proses' | 'selesai';
  dibuatOleh: string;
}

export interface CabangConfig {
  namaKoperasi: string;
  namaCabang: string;
  alamat: string;
  kabupaten: string;
  provinsi: string;
  telepon: string;
  email: string;
  kepalaCabang: string;
  bungaPerBulan: number; // default 0.5
  sistemBunga: string; // 'Bunga Menurun (Effective Rate)'
}

export type TipePesanWhatsApp = 'pengingat_h3' | 'jatuh_tempo_hari_h' | 'peringatan_terlambat';

export interface LogPesanWhatsApp {
  id: string;
  pinjamanId: string;
  nasabahNama: string;
  noHp: string;
  tipePenerima: 'peminjam' | 'kerabat';
  tipePesan: TipePesanWhatsApp;
  nominalAngsuran: number;
  bulanKe: number;
  tanggalJatuhTempo: string;
  isiPesan: string;
  waktuKirim: string;
  petugasPengirim: string;
  status: 'terkirim';
}
