import React from 'react';
import {
  X,
  User,
  Shield,
  Phone,
  Home,
  Briefcase,
  Users,
  Edit3,
  Calendar,
  CreditCard,
  PiggyBank,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Nasabah } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/loanCalculations';

interface DetailNasabahModalProps {
  isOpen: boolean;
  onClose: () => void;
  nasabah: Nasabah | null;
  onEdit: (nasabah: Nasabah) => void;
}

export const DetailNasabahModal: React.FC<DetailNasabahModalProps> = ({
  isOpen,
  onClose,
  nasabah,
  onEdit,
}) => {
  const { currentUser, pinjamanList, simpananList, openWhatsAppReminder } = useApp();

  if (!isOpen || !nasabah) return null;

  const isPetugas = currentUser?.role === 'petugas';

  // Cari pinjaman dan simpanan nasabah ini
  const nasabahPinjaman = pinjamanList.filter((p) => p.nasabahId === nasabah.id);
  const nasabahSimpanan = simpananList.filter((s) => s.nasabahId === nasabah.id);

  // Total simpanan berjalan
  const totalSimpanan = nasabahSimpanan.reduce((acc, curr) => {
    return curr.tipe === 'setor' ? acc + curr.jumlah : acc - curr.jumlah;
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs font-sans border border-gray-300 animate-in fade-in zoom-in duration-150">
        {/* Header Modal */}
        <div className="bg-[#1e282c] text-white p-3.5 flex items-center justify-between shrink-0 border-b-2 border-[#00c0ef]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-[#00c0ef] text-white flex items-center justify-center font-bold text-sm shadow-inner">
              {nasabah.nama.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-sm text-white">{nasabah.nama}</h2>
                <span className="font-mono text-[10px] bg-[#00c0ef]/20 text-[#00c0ef] px-1.5 py-0.2 rounded font-bold border border-[#00c0ef]/30">
                  {nasabah.id}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                    nasabah.status === 'aktif'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/40'
                  }`}
                >
                  {nasabah.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Berkas Nasabah Binaan &bull; KSP Swasti Mandiri Cabang Nubatukan &bull; Wilayah: {nasabah.desa}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isPetugas && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(nasabah);
                }}
                className="bg-[#00c0ef] hover:bg-[#00a7d0] text-white px-3 py-1.5 rounded text-xs font-bold flex items-center space-x-1 transition cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Ubah Data</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white rounded p-1 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Baris Ringkasan Dokumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-blue-50/70 border border-blue-200 rounded p-3">
              <div className="text-[10px] text-blue-800 font-bold uppercase tracking-wider flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-blue-600" />
                Dokumen Resmi Peminjam
              </div>
              <div className="mt-2 space-y-1 font-mono text-xs">
                <div>
                  <span className="text-gray-500 text-[10px]">NIK:</span>{' '}
                  <span className="font-bold text-gray-900">{nasabah.nik}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-[10px]">No KK:</span>{' '}
                  <span className="font-bold text-gray-900">{nasabah.noKk}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded p-3">
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Kontak & Komunikasi
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div>
                  <span className="text-gray-500 text-[10px]">No HP:</span>{' '}
                  <a
                    href={`tel:${nasabah.noHp}`}
                    className="font-bold font-mono text-emerald-700 hover:underline"
                  >
                    {nasabah.noHp}
                  </a>
                </div>
                <div className="text-[10px] text-gray-600">
                  Terdaftar: <strong>{nasabah.tanggalDaftar}</strong>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded p-3">
              <div className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                Penjamin & Kerabat Sah
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="font-bold text-gray-900">{nasabah.namaPenjamin}</div>
                <div className="text-[10px] text-indigo-700 font-semibold">
                  {nasabah.hubunganKerabat} &bull; {nasabah.noHpKerabat}
                </div>
              </div>
            </div>
          </div>

          {/* Domisili & Usaha */}
          <div className="bg-gray-50 rounded border border-gray-200 p-3.5 space-y-2">
            <h3 className="font-bold text-gray-800 text-xs flex items-center border-b border-gray-200 pb-1.5">
              <Home className="w-3.5 h-3.5 text-teal-600 mr-1.5" />
              Domisili & Usaha di Lembata (Wilayah Kerja Petugas: {nasabah.petugasNama})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-gray-500 text-[10px] block">Desa / Kelurahan:</span>
                <span className="font-bold text-gray-900 bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[11px] inline-block mt-0.5">
                  {nasabah.desa}
                </span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Alamat Lengkap:</span>
                <span className="font-semibold text-gray-800">{nasabah.alamat}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Pekerjaan Utama:</span>
                <span className="font-semibold text-gray-800">{nasabah.pekerjaan}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Penghasilan Bulanan:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {formatRupiah(nasabah.penghasilanBulanan)}
                </span>
              </div>
            </div>
          </div>

          {/* Riwayat Pinjaman Nasabah */}
          <div className="bg-white rounded border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 p-2.5 font-bold text-gray-800 flex items-center justify-between text-xs border-b border-gray-200">
              <div className="flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Riwayat Rekening Pinjaman ({nasabahPinjaman.length})</span>
              </div>
              <span className="text-[10px] text-gray-500">Skema 0.5% Menurun</span>
            </div>

            {nasabahPinjaman.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-xs">
                Belum ada fasilitas pinjaman untuk nasabah ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[10px] uppercase">
                      <th className="p-2">Kode</th>
                      <th className="p-2">Jumlah Pinjaman</th>
                      <th className="p-2">Tenor</th>
                      <th className="p-2">Sisa Pokok</th>
                      <th className="p-2">Kolektibilitas</th>
                      <th className="p-2">Status</th>
                      {isPetugas && <th className="p-2 text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {nasabahPinjaman.map((pinj) => {
                      const overdue = pinj.kolektibilitas > 1;
                      const unpaidJadwal =
                        pinj.jadwal.find(
                          (j) => j.status === 'jatuh_tempo' || j.status === 'belum_bayar'
                        ) || pinj.jadwal[0];

                      return (
                        <tr key={pinj.id} className="hover:bg-gray-50">
                          <td className="p-2 font-mono font-bold text-blue-700">{pinj.kodePinjaman}</td>
                          <td className="p-2 font-mono font-bold">{formatRupiah(pinj.jumlahPinjaman)}</td>
                          <td className="p-2">{pinj.tenorBulan} Bulan</td>
                          <td className="p-2 font-mono font-bold text-red-700">{formatRupiah(pinj.sisaPokok)}</td>
                          <td className="p-2">
                            <span
                              className={`text-white text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                pinj.kolektibilitas === 1
                                  ? 'bg-[#00a65a]'
                                  : pinj.kolektibilitas === 2
                                  ? 'bg-[#f39c12]'
                                  : 'bg-[#dd4b39]'
                              }`}
                            >
                              Kol {pinj.kolektibilitas}
                            </span>
                          </td>
                          <td className="p-2 font-medium text-gray-700">{pinj.status}</td>
                          {isPetugas && (
                            <td className="p-2 text-right">
                              {overdue && unpaidJadwal && (
                                <button
                                  type="button"
                                  onClick={() => openWhatsAppReminder(pinj, unpaidJadwal)}
                                  className="bg-[#25D366] hover:bg-[#1ebd59] text-gray-950 font-bold px-2 py-1 rounded text-[10px] inline-flex items-center space-x-1 cursor-pointer shadow-xs"
                                >
                                  <span>WA Jatuh Tempo</span>
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Riwayat Simpanan Ringkas */}
          <div className="bg-white rounded border border-gray-200 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <PiggyBank className="w-4 h-4 text-amber-600" />
              <div>
                <span className="font-bold text-gray-800">Saldo Simpanan Nasabah di KSP:</span>
                <p className="text-[10px] text-gray-500">Termasuk Simpanan Pokok, Wajib, dan Sukarela</p>
              </div>
            </div>
            <div className="font-mono font-bold text-emerald-700 text-sm">
              {formatRupiah(totalSimpanan)}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition cursor-pointer text-xs font-semibold"
          >
            Tutup
          </button>
          {isPetugas && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(nasabah);
              }}
              className="bg-[#00c0ef] hover:bg-[#00a7d0] text-white px-4 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Ubah Data Nasabah Ini</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
