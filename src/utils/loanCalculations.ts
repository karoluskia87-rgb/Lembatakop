import { JadwalAngsuran } from '../types';

/**
 * Menghitung jadwal angsuran dengan sistem bunga 0,5% per bulan menurun (declining balance).
 * 
 * Karakteristik Bunga Menurun:
 * 1. Angsuran Pokok tetap = Pokok Pinjaman / Tenor Bulan
 * 2. Bunga dihitung dari SISA POKOK pinjaman setiap bulannya = 0.5% * Sisa Pokok
 * 3. Total Angsuran per bulan mengecil setiap bulan karena sisa pokok pinjaman berkurang!
 */
export function hitungSimulasiBungaMenurun(
  pokokPinjaman: number,
  tenorBulan: number,
  bungaPersenPerBulan: number = 0.5,
  startDateStr: string = new Date().toISOString().split('T')[0]
): {
  jadwal: JadwalAngsuran[];
  totalPokok: number;
  totalBunga: number;
  totalPembayaran: number;
  angsuranBulanPertama: number;
  angsuranBulanTerakhir: number;
  bungaBulanPertama: number;
  bungaBulanTerakhir: number;
} {
  const angsuranPokokDasar = Math.floor(pokokPinjaman / tenorBulan);
  const sisaSelisih = pokokPinjaman - (angsuranPokokDasar * tenorBulan); // penyesuaian desimal di bulan terakhir
  
  const jadwal: JadwalAngsuran[] = [];
  let sisaPokokBerjalan = pokokPinjaman;
  let akumulasiBunga = 0;
  
  const startDate = new Date(startDateStr);

  for (let bulan = 1; bulan <= tenorBulan; bulan++) {
    const sisaPokokAwal = sisaPokokBerjalan;
    // Pada bulan terakhir, masukkan selisih pembulatan agar sisa pokok tepat 0
    const pokokBulanIni = (bulan === tenorBulan) 
      ? sisaPokokAwal 
      : angsuranPokokDasar;

    // Bunga 0.5% dihitung dari sisa pokok awal bulan
    const bungaBulanIni = Math.round(sisaPokokAwal * (bungaPersenPerBulan / 100));
    const totalAngsuran = pokokBulanIni + bungaBulanIni;
    const sisaPokokAkhir = Math.max(0, sisaPokokAwal - pokokBulanIni);
    
    // Tanggal jatuh tempo per bulan (tanggal yang sama setiap bulan berikutnya)
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + bulan);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    jadwal.push({
      bulanKe: bulan,
      sisaPokokAwal,
      angsuranPokok: pokokBulanIni,
      bungaBulanIni,
      totalAngsuran,
      sisaPokokAkhir,
      status: 'belum_bayar',
      tanggalJatuhTempo: dueDateStr,
    });

    akumulasiBunga += bungaBulanIni;
    sisaPokokBerjalan = sisaPokokAkhir;
  }

  return {
    jadwal,
    totalPokok: pokokPinjaman,
    totalBunga: akumulasiBunga,
    totalPembayaran: pokokPinjaman + akumulasiBunga,
    angsuranBulanPertama: jadwal[0]?.totalAngsuran || 0,
    angsuranBulanTerakhir: jadwal[jadwal.length - 1]?.totalAngsuran || 0,
    bungaBulanPertama: jadwal[0]?.bungaBulanIni || 0,
    bungaBulanTerakhir: jadwal[jadwal.length - 1]?.bungaBulanIni || 0,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAngka(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatTanggal(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function getKolektibilitasLabel(kol: number): { label: string; badge: string; color: string } {
  switch (kol) {
    case 1:
      return { label: 'Kol-1 (Lancar)', badge: 'bg-[#00a65a]', color: 'text-[#00a65a]' };
    case 2:
      return { label: 'Kol-2 (Dalam Perhatian Khusus)', badge: 'bg-[#00c0ef]', color: 'text-[#00c0ef]' };
    case 3:
      return { label: 'Kol-3 (Kurang Lancar)', badge: 'bg-[#f39c12]', color: 'text-[#f39c12]' };
    case 4:
      return { label: 'Kol-4 (Diragukan)', badge: 'bg-[#ff851b]', color: 'text-[#ff851b]' };
    case 5:
      return { label: 'Kol-5 (Macet / NPL)', badge: 'bg-[#dd4b39]', color: 'text-[#dd4b39]' };
    default:
      return { label: 'Normal', badge: 'bg-gray-500', color: 'text-gray-500' };
  }
}
