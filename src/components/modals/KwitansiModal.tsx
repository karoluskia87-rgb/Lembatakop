import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { formatRupiah } from '../../utils/loanCalculations';
import { useApp } from '../../context/AppContext';

export interface KwitansiData {
  tipe: 'angsuran' | 'simpanan';
  nomor: string;
  nama: string;
  nik: string;
  nominal: number;
  keterangan: string;
  tanggal: string;
  petugas: string;
  detailTambahan?: string;
}

interface KwitansiModalProps {
  data: KwitansiData | null;
  onClose: () => void;
}

export const KwitansiModal: React.FC<KwitansiModalProps> = ({ data, onClose }) => {
  const { cabangConfig } = useApp();

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden text-xs font-sans border border-gray-300">
        {/* Modal Top Bar */}
        <div className="bg-[#3c8dbc] text-white p-2.5 flex items-center justify-between no-print">
          <span className="font-bold text-xs flex items-center">
            <Printer className="w-3.5 h-3.5 mr-1.5 text-yellow-300" />
            Bukti Transaksi Resmi KSP Cabang Nubatukan
          </span>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Kwitansi Printable Area */}
        <div className="p-6 bg-white space-y-4 print:p-0">
          {/* Header Kop Surat Koperasi */}
          <div className="border-b-2 border-double border-gray-800 pb-3 text-center relative">
            <div className="text-sm font-black tracking-wider text-gray-900 uppercase">
              {cabangConfig.namaKoperasi}
            </div>
            <div className="text-base font-extrabold text-blue-900 uppercase tracking-wide">
              {cabangConfig.namaCabang}
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">
              {cabangConfig.alamat} &bull; {cabangConfig.kabupaten}, {cabangConfig.provinsi}
            </div>
            <div className="text-[10px] text-gray-500 font-mono">
              Telp: {cabangConfig.telepon} &bull; Email: {cabangConfig.email}
            </div>
          </div>

          {/* Title & No Kwitansi */}
          <div className="flex justify-between items-center pt-1">
            <div className="text-center w-full">
              <span className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-900 px-4 pb-0.5 inline-block">
                KWITANSI {data.tipe === 'angsuran' ? 'PEMBAYARAN ANGSURAN' : 'TRANSAKSI SIMPANAN'}
              </span>
              <div className="text-[11px] font-mono text-gray-700 mt-1 font-semibold">
                No. Bukti: <span className="text-blue-800 font-bold">{data.nomor}</span>
              </div>
            </div>
          </div>

          {/* Isi Kwitansi */}
          <div className="space-y-2 py-2 border-y border-gray-200 text-xs">
            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-600 font-medium">Telah Diterima Dari:</span>
              <span className="col-span-3 font-bold text-gray-900 uppercase">
                {data.nama}{' '}
                <span className="font-normal font-mono text-gray-500 text-[10px]">
                  (NIK: {data.nik})
                </span>
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-600 font-medium">Uang Sejumlah:</span>
              <div className="col-span-3 bg-gray-50 p-2 rounded border border-gray-200">
                <span className="font-mono font-black text-sm text-emerald-800 block">
                  {formatRupiah(data.nominal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-600 font-medium">Untuk Pembayaran:</span>
              <span className="col-span-3 text-gray-800 font-semibold leading-relaxed">
                {data.keterangan}
              </span>
            </div>

            {data.detailTambahan && (
              <div className="grid grid-cols-4 gap-2">
                <span className="text-gray-600 font-medium">Catatan Saldo:</span>
                <span className="col-span-3 text-blue-700 font-mono font-bold">
                  {data.detailTambahan}
                </span>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              <span className="text-gray-600 font-medium">Sistem Suku Bunga:</span>
              <span className="col-span-3 text-gray-700 font-medium">
                0,5% Per Bulan Menurun (Declining Balance)
              </span>
            </div>
          </div>

          {/* Tanda Tangan & Tanggal */}
          <div className="pt-2">
            <div className="flex justify-end text-[11px] text-gray-700 mb-2">
              Nubatukan, {data.tanggal}
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div>
                <div className="text-gray-600 mb-12">Penyetor / Nasabah,</div>
                <div className="font-bold underline text-gray-900 uppercase">{data.nama}</div>
                <div className="text-[10px] text-gray-500">Anggota KSP Nubatukan</div>
              </div>

              <div className="relative">
                <div className="text-gray-600 mb-12">Petugas Penerima,</div>
                {/* Cap Stempel Digital Watermark */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 border-2 border-blue-600/30 rounded-full w-24 h-24 flex items-center justify-center rotate-12 pointer-events-none select-none text-[8px] font-black text-blue-600/40 uppercase text-center p-1 leading-tight">
                  KSP SWASTI MANDIRI CABANG NUBATUKAN LUNAS
                </div>
                <div className="font-bold underline text-gray-900 uppercase">{data.petugas}</div>
                <div className="text-[10px] text-gray-500">Petugas Lapangan Cabang</div>
              </div>
            </div>
          </div>

          <div className="text-[9px] text-gray-400 italic text-center pt-3 border-t border-gray-100">
            * Kwitansi ini adalah bukti pembayaran yang sah dari Koperasi Simpan Pinjam Swasti Mandiri Cabang Nubatukan.
          </div>
        </div>

        {/* Modal Buttons Footer (Hidden when printed) */}
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex items-center justify-end space-x-2 no-print">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-medium text-xs cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded font-bold text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Kwitansi (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
