import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Users,
  Copy,
  ExternalLink,
  Shield,
  FileText,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { Pinjaman, JadwalAngsuran, Nasabah, TipePesanWhatsApp, LogPesanWhatsApp } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  formatNomorWa,
  buatTemplatePesanWa,
  generateWhatsAppUrl,
} from '../../utils/whatsappTemplates';
import { formatRupiah, formatTanggal } from '../../utils/loanCalculations';

interface WhatsAppReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pinjaman: Pinjaman | null;
  jadwal: JadwalAngsuran | null;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  isOpen,
  onClose,
  pinjaman,
  jadwal,
}) => {
  const { cabangConfig, currentUser, nasabahList, addToast, tambahWaLog, waLogs } = useApp();

  const [tipePesan, setTipePesan] = useState<TipePesanWhatsApp>('peringatan_terlambat');
  const [targetPenerima, setTargetPenerima] = useState<'peminjam' | 'kerabat'>('peminjam');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && pinjaman && jadwal) {
      const overdue = pinjaman.kolektibilitas > 1 || jadwal.status === 'jatuh_tempo';
      setTipePesan(overdue ? 'peringatan_terlambat' : 'pengingat_h3');
      setTargetPenerima('peminjam');
      setCustomText('');
      setCopied(false);
    }
  }, [isOpen, pinjaman?.id, jadwal?.bulanKe, pinjaman?.kolektibilitas, jadwal?.status]);

  if (!isOpen || !pinjaman || !jadwal || currentUser?.role !== 'petugas') return null;

  const nasabah = nasabahList.find((n) => n.id === pinjaman.nasabahId);
  const isOverdue = pinjaman.kolektibilitas > 1 || jadwal.status === 'jatuh_tempo';

  const activePhone = targetPenerima === 'peminjam'
    ? pinjaman.noHp || nasabah?.noHp || ''
    : nasabah?.noHpKerabat || '';

  const activeName = targetPenerima === 'peminjam'
    ? pinjaman.nasabahNama
    : nasabah?.namaPenjamin || 'Kerabat Peminjam';

  // Generate dynamic message
  const defaultGeneratedMessage = buatTemplatePesanWa({
    pinjaman,
    jadwal,
    tipePesan,
    cabangConfig,
    namaPenerima: activeName,
    hubungan: nasabah?.hubunganKerabat || 'Kerabat',
    isKerabat: targetPenerima === 'kerabat',
  });

  const finalMessage = customText || defaultGeneratedMessage;
  const whatsappUrl = generateWhatsAppUrl(activePhone, finalMessage);

  const handleCopyText = () => {
    navigator.clipboard.writeText(finalMessage);
    setCopied(true);
    addToast('Teks pesan WhatsApp berhasil disalin ke clipboard!', 'info');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLogSent = () => {
    const newLog: LogPesanWhatsApp = {
      id: `WA-${Date.now()}`,
      pinjamanId: pinjaman.id,
      nasabahNama: pinjaman.nasabahNama,
      noHp: activePhone,
      tipePenerima: targetPenerima,
      tipePesan,
      nominalAngsuran: jadwal.totalAngsuran,
      bulanKe: jadwal.bulanKe,
      tanggalJatuhTempo: jadwal.tanggalJatuhTempo,
      isiPesan: finalMessage,
      waktuKirim: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WITA',
      petugasPengirim: currentUser?.name || 'Petugas Lapangan',
      status: 'terkirim',
    };

    tambahWaLog(newLog);
    addToast(`Notifikasi WhatsApp ke ${activeName} (${activePhone}) berhasil dicatat sebagai terkirim!`, 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs font-sans border border-gray-300">
        {/* Header Modal - WhatsApp Green Theme (#25D366 / #128C7E) */}
        <div className="bg-[#128C7E] text-white p-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm flex items-center">
                <span>Pengiriman Pesan WhatsApp Otomatis Jatuh Tempo</span>
                <span className="ml-2 text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-bold">
                  Official KSP
                </span>
              </h2>
              <div className="text-[11px] text-emerald-100">
                Peringatan Kewajiban Angsuran &bull; {cabangConfig.namaCabang}
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
        <div className="p-4 overflow-y-auto space-y-4 flex-1 bg-gray-50/50">
          {/* Ringkasan Kewajiban Debitur */}
          <div className="bg-white p-3.5 rounded border border-gray-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-400 block text-[10px]">Nama Nasabah / NIK:</span>
              <div className="font-bold text-gray-900">{pinjaman.nasabahNama}</div>
              <div className="text-[10px] font-mono text-gray-500">{pinjaman.nik}</div>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">No. Pinjaman / Angsuran:</span>
              <div className="font-bold text-blue-800 font-mono">{pinjaman.kodePinjaman}</div>
              <div className="text-[10px] text-gray-600">
                Bulan Ke-#{jadwal.bulanKe} dari {pinjaman.tenorBulan} Bln
              </div>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Kewajiban Harus Dibayar:</span>
              <div className="font-bold text-emerald-700 text-sm font-mono">
                {formatRupiah(jadwal.totalAngsuran)}
              </div>
              <div className="text-[10px] text-gray-500">
                Pokok {formatRupiah(jadwal.angsuranPokok)} + Bunga 0,5%
              </div>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Tanggal Jatuh Tempo:</span>
              <div className="font-bold text-rose-700 font-mono">
                {formatTanggal(jadwal.tanggalJatuhTempo)}
              </div>
              <span
                className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5 ${
                  isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {isOverdue ? 'Lewat Jatuh Tempo' : 'Mendekati Jatuh Tempo'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kolom Kiri: Pilihan Template & Pengaturan Penerima */}
            <div className="space-y-3 bg-white p-3.5 rounded border border-gray-200 shadow-xs">
              <div className="font-bold text-gray-800 border-b border-gray-100 pb-2 flex items-center justify-between">
                <span>1. Pilih Penerima & Format Pesan</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>

              {/* Pilihan Penerima: Peminjam atau Kerabat */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Tujuan Pengiriman WhatsApp:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetPenerima('peminjam');
                      setCustomText('');
                    }}
                    className={`p-2 rounded border text-left cursor-pointer transition ${
                      targetPenerima === 'peminjam'
                        ? 'border-[#128C7E] bg-emerald-50/70 text-emerald-950 font-semibold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-bold text-[11px]">Nasabah Peminjam</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 mt-1 truncate">
                      {pinjaman.noHp || 'No HP Belum Diisi'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetPenerima('kerabat');
                      setCustomText('');
                    }}
                    className={`p-2 rounded border text-left cursor-pointer transition ${
                      targetPenerima === 'kerabat'
                        ? 'border-[#128C7E] bg-emerald-50/70 text-emerald-950 font-semibold'
                        : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span className="font-bold text-[11px]">Kerabat / Penjamin</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 mt-1 truncate">
                      {nasabah?.noHpKerabat || 'No HP Kerabat'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Template Jenis Pesan */}
              {targetPenerima === 'peminjam' ? (
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Jenis Pengingat Jatuh Tempo:
                  </label>
                  <div className="space-y-1.5">
                    <label className="flex items-center space-x-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="tipePesan"
                        value="pengingat_h3"
                        checked={tipePesan === 'pengingat_h3'}
                        onChange={() => {
                          setTipePesan('pengingat_h3');
                          setCustomText('');
                        }}
                        className="accent-[#128C7E]"
                      />
                      <div>
                        <div className="font-bold text-gray-800 text-[11px]">
                          1. Pengingat Ramah (H-3 s/d H-1 Jatuh Tempo)
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Informasi santun nomor pinjaman & rincian nominal total
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="tipePesan"
                        value="jatuh_tempo_hari_h"
                        checked={tipePesan === 'jatuh_tempo_hari_h'}
                        onChange={() => {
                          setTipePesan('jatuh_tempo_hari_h');
                          setCustomText('');
                        }}
                        className="accent-[#128C7E]"
                      />
                      <div>
                        <div className="font-bold text-gray-800 text-[11px]">
                          2. Hari-H Jatuh Tempo Hari Ini
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Pengingat batas akhir penyetoran hari ini kepada petugas
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center space-x-2 p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="tipePesan"
                        value="peringatan_terlambat"
                        checked={tipePesan === 'peringatan_terlambat'}
                        onChange={() => {
                          setTipePesan('peringatan_terlambat');
                          setCustomText('');
                        }}
                        className="accent-[#128C7E]"
                      />
                      <div>
                        <div className="font-bold text-rose-800 text-[11px]">
                          3. Peringatan Menunggak (Kol-2 DPK / Lewat Jatuh Tempo)
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Peringatan status kolektibilitas dan imbauan 1x24 jam
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center">
                    <Shield className="w-3.5 h-3.5 mr-1 text-amber-700" />
                    Pemberitahuan Kerabat Tidak Serumah:
                  </div>
                  <div>
                    Pesan khusus yang dikirimkan kepada kontak kerabat ({nasabah?.hubunganKerabat}) untuk membantu mengingatkan debitur secara bijak dan kekeluargaan.
                  </div>
                </div>
              )}

              {/* Data Petugas Lapangan Pengirim */}
              <div className="pt-1 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                <span>Petugas Penghubung:</span>
                <span className="font-semibold text-gray-900">{pinjaman.petugasNama}</span>
              </div>
            </div>

            {/* Kolom Kanan: Pratinjau Gelembung Chat WhatsApp */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="bg-[#efeae2] p-3.5 rounded border border-[#d1d7db] shadow-inner flex flex-col h-[320px] overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-black/10 text-[11px] text-gray-700">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#25D366]" />
                    <span className="font-bold">Pratinjau Pesan WhatsApp</span>
                  </div>
                  <span className="font-mono text-[10px] text-gray-600">
                    Ke: +{formatNomorWa(activePhone)}
                  </span>
                </div>

                {/* WhatsApp Chat Bubble */}
                <div className="flex-1 overflow-y-auto my-2 pr-1">
                  <div className="bg-[#d9fdd3] text-gray-900 p-3 rounded-lg shadow-xs text-[11px] leading-relaxed whitespace-pre-line border border-[#b2e2a7] font-sans">
                    {finalMessage}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 border-t border-black/5">
                  <span>* Format teks tebal (*) dan miring (_) terbaca otomatis di WhatsApp</span>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
                  </button>
                </div>
              </div>

              {/* Tombol Eksekusi Pengiriman */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  {/* Direct Link to WhatsApp (standard <a> tag avoids window.open restriction in iframe) */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleLogSent}
                    className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-3 rounded font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition cursor-pointer text-center"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Pesan WhatsApp Sekarang</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleLogSent}
                    className="bg-[#128C7E] hover:bg-[#0e7064] text-white py-2.5 px-3 rounded font-bold text-xs flex items-center space-x-1 shadow-sm transition cursor-pointer"
                    title="Tandai pengingat sudah terkirim tanpa membuka WhatsApp"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Tandai Terkirim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Log Pengingat WA Terkirim */}
          {waLogs.length > 0 && (
            <div className="bg-white p-3 rounded border border-gray-200 shadow-xs space-y-2">
              <div className="font-bold text-gray-800 text-xs flex items-center justify-between">
                <span>Riwayat Pengingat WhatsApp Terkirim ({waLogs.length} Catatan)</span>
                <span className="text-[10px] text-gray-400">Tersimpan di Sistem</span>
              </div>
              <div className="max-h-28 overflow-y-auto divide-y divide-gray-100 text-[11px]">
                {waLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="py-1.5 flex justify-between items-center text-gray-700">
                    <div>
                      <span className="font-bold text-gray-900">{log.nasabahNama}</span>
                      <span className="text-gray-500 ml-2">({log.noHp})</span>
                      <span className="text-emerald-700 font-semibold ml-2">
                        &bull; Bulan #{log.bulanKe} ({formatRupiah(log.nominalAngsuran)})
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono flex items-center space-x-2">
                      <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                        Terkirim
                      </span>
                      <span>{log.waktuKirim}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-gray-500">
            * Pesan resmi menggunakan format baku KSP Swasti Mandiri Cabang Nubatukan.
          </div>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1.5 rounded font-medium text-xs cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
