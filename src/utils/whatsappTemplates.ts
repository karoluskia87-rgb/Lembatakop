import { Pinjaman, JadwalAngsuran, TipePesanWhatsApp, CabangConfig } from '../types';
import { formatRupiah, formatTanggal } from './loanCalculations';

export function formatNomorWa(rawPhone: string): string {
  // Bersihkan karakter non-angka
  let clean = rawPhone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62')) {
    clean = '62' + clean;
  }
  return clean;
}

export function buatTemplatePesanWa({
  pinjaman,
  jadwal,
  tipePesan,
  cabangConfig,
  namaPenerima,
  hubungan = '',
  isKerabat = false,
}: {
  pinjaman: Pinjaman;
  jadwal: JadwalAngsuran;
  tipePesan: TipePesanWhatsApp;
  cabangConfig: CabangConfig;
  namaPenerima: string;
  hubungan?: string;
  isKerabat?: boolean;
}): string {
  const tanggalJatuhTempoFormat = formatTanggal(jadwal.tanggalJatuhTempo);
  const nominalTotal = formatRupiah(jadwal.totalAngsuran);
  const nominalPokok = formatRupiah(jadwal.angsuranPokok);
  const nominalBunga = formatRupiah(jadwal.bungaBulanIni);

  if (isKerabat) {
    return (
      `*PEMBERITAHUAN KSP SWASTI MANDIRI CABANG NUBATUKAN*\n\n` +
      `Yth. Bapak/Ibu *${namaPenerima}* (${hubungan} dari Saudara *${pinjaman.nasabahNama}*),\n\n` +
      `Semoga Bapak/Ibu sekeluarga dalam keadaan sehat.\n\n` +
      `Kami dari pengurus ${cabangConfig.namaKoperasi} Cabang Nubatukan bermaksud menginformasikan mengenai kewajiban angsuran pinjaman atas nama:\n\n` +
      `• *Peminjam:* ${pinjaman.nasabahNama}\n` +
      `• *No. Pinjaman:* ${pinjaman.kodePinjaman}\n` +
      `• *Angsuran Bulan ke:* ${jadwal.bulanKe} dari ${pinjaman.tenorBulan} Bulan\n` +
      `• *Total Kewajiban:* ${nominalTotal} (Pokok: ${nominalPokok} + Bunga 0,5% Menurun: ${nominalBunga})\n` +
      `• *Jatuh Tempo:* ${tanggalJatuhTempoFormat}\n\n` +
      `Mengingat kontak yang bersangkutan sedang sulit dihubungi, mohon kesediaan Bapak/Ibu dapat membantu mengingatkan Saudara ${pinjaman.nasabahNama} untuk segera menyelesaikan kewajiban tersebut demi menjaga reputasi kredit anggota.\n\n` +
      `Pembayaran dapat disetor melalui Petugas Lapangan kami (*${pinjaman.petugasNama}*) atau ke kantor cabang.\n\n` +
      `Terima kasih atas kerja sama dan perhatian Bapak/Ibu.\n\n` +
      `_Salam hormat,_\n` +
      `*${cabangConfig.namaCabang}*\n` +
      `Telp: ${cabangConfig.telepon}`
    );
  }

  if (tipePesan === 'pengingat_h3') {
    return (
      `*PENGINGAT JATUH TEMPO - KSP CABANG NUBATUKAN*\n\n` +
      `Yth. Anggota Koperasi, Bapak/Ibu *${namaPenerima}*,\n\n` +
      `Semoga aktivitas dan usaha Anda hari ini berjalan lancar dan penuh berkah.\n\n` +
      `Kami dari *${cabangConfig.namaKoperasi} ${cabangConfig.namaCabang}* ingin mengingatkan bahwa angsuran pinjaman Anda akan segera jatuh tempo dalam waktu dekat:\n\n` +
      `📋 *Rincian Angsuran:*\n` +
      `• No. Pinjaman: *${pinjaman.kodePinjaman}*\n` +
      `• Angsuran Bulan ke: *#${jadwal.bulanKe}* dari ${pinjaman.tenorBulan} Bulan\n` +
      `• Angsuran Pokok: ${nominalPokok}\n` +
      `• Jasa Bunga (0,5% Menurun): ${nominalBunga}\n` +
      `• *TOTAL PEMBAYARAN:* *${nominalTotal}*\n` +
      `• *Tanggal Jatuh Tempo:* *${tanggalJatuhTempoFormat}*\n\n` +
      `Pembayaran dapat diserahkan langsung kepada Petugas Lapangan binaan Anda:\n` +
      `👤 *${pinjaman.petugasNama}*\n` +
      `🏢 Kantor: ${cabangConfig.alamat}\n\n` +
      `Kwitansi resmi KSP akan langsung diterbitkan begitu setoran diterima. Pembayaran tepat waktu membantu mempertahankan tingkat kolektibilitas Anda tetap *Kol-1 (Lancar)*.\n\n` +
      `Terima kasih atas loyalitas dan komitmen Anda sebagai anggota Koperasi Swasti Mandiri Cabang Nubatukan.\n\n` +
      `_Pesan otomatis Sistem KSP Cabang Nubatukan_`
    );
  }

  if (tipePesan === 'jatuh_tempo_hari_h') {
    return (
      `*PEMBERITAHUAN HARI INI JATUH TEMPO - KSP CABANG NUBATUKAN*\n\n` +
      `Yth. Bapak/Ibu *${namaPenerima}*,\n\n` +
      `Diberitahukan bahwa hari ini, *${tanggalJatuhTempoFormat}*, adalah tanggal jatuh tempo angsuran pinjaman Anda di *${cabangConfig.namaCabang}*:\n\n` +
      `• No. Pinjaman: *${pinjaman.kodePinjaman}*\n` +
      `• Angsuran Bulan ke: *#${jadwal.bulanKe}* (${nominalTotal})\n` +
      `• Rincian: Pokok ${nominalPokok} + Bunga Menurun ${nominalBunga}\n\n` +
      `Petugas Lapangan kami (*${pinjaman.petugasNama}*) siap melayani penjemputan setoran angsuran di lokasi usaha/kediaman Anda, atau Anda dapat menyetor langsung ke Kantor KSP di Lewoleba.\n\n` +
      `Mohon segera selesaikan kewajiban hari ini agar tidak dikenakan catatan perhatian khusus.\n\n` +
      `Terima kasih,\n` +
      `*${cabangConfig.namaCabang}*\n` +
      `Kontor Layanan: ${cabangConfig.telepon}`
    );
  }

  // Peringatan lewat jatuh tempo (Kol 2 / DPK)
  return (
    `*PERINGATAN KETERLAMBATAN ANGSURAN - KSP CABANG NUBATUKAN*\n\n` +
    `Yth. Bapak/Ibu *${namaPenerima}*,\n\n` +
    `Berdasarkan data sistem *${cabangConfig.namaCabang}*, angsuran pinjaman Anda *${pinjaman.kodePinjaman}* bulan ke-#${jadwal.bulanKe} sebesar *${nominalTotal}* telah melewati tanggal jatuh tempo (${tanggalJatuhTempoFormat}).\n\n` +
    `⚠️ *Perhatian:*\n` +
    `Keterlambatan ini mempengaruhi kolektibilitas kredit Anda yang saat ini masuk kategori *Dalam Perhatian Khusus (Kol-2)*.\n\n` +
    `Kami mengimbau Bapak/Ibu untuk segera menghubungi Petugas Lapangan (*${pinjaman.petugasNama}*) atau datang ke kantor KSP untuk menyelesaikan kewajiban tersebut dalam 1x24 jam.\n\n` +
    `Jika menghadapi kendala usaha, silakan konsultasikan dengan Kepala Unit kami untuk opsi restrukturisasi.\n\n` +
    `Hormat kami,\n` +
    `*Manajemen ${cabangConfig.namaCabang}*\n` +
    `Alamat: ${cabangConfig.alamat}`
  );
}

export function generateWhatsAppUrl(phone: string, text: string): string {
  const cleanPhone = formatNomorWa(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
