import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Shield,
  Phone,
  Home,
  Briefcase,
  AlertCircle,
  Save,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { Nasabah } from '../../types';
import { useApp } from '../../context/AppContext';

interface EditNasabahModalProps {
  isOpen: boolean;
  onClose: () => void;
  nasabah: Nasabah | null;
}

const DESA_OPTIONS = [
  'Lewoleba Barat',
  'Lewoleba Timur',
  'Lewoleba Tengah',
  'Lamahora',
  'Rayuan',
  'Waijarang',
  'Belang',
  'Lite Ulumado',
  'Baopana',
  'Watokobu',
  'Batuwawer',
];

const HUBUNGAN_OPTIONS = [
  'Istri',
  'Suami',
  'Orang Tua (Ayah/Ibu)',
  'Anak Kandung',
  'Kakak Kandung',
  'Adik Kandung',
  'Paman/Bibi',
  'Kerabat / Saudara Lainnya',
];

export const EditNasabahModal: React.FC<EditNasabahModalProps> = ({
  isOpen,
  onClose,
  nasabah,
}) => {
  const { currentUser, updateNasabah } = useApp();

  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [noKk, setNoKk] = useState('');
  const [noHp, setNoHp] = useState('');
  const [namaPenjamin, setNamaPenjamin] = useState('');
  const [nikPenjamin, setNikPenjamin] = useState('');
  const [noHpKerabat, setNoHpKerabat] = useState('');
  const [hubunganKerabat, setHubunganKerabat] = useState('');
  const [desa, setDesa] = useState('');
  const [alamat, setAlamat] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');
  const [penghasilanBulanan, setPenghasilanBulanan] = useState<number>(0);
  const [status, setStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (nasabah && isOpen) {
      setNama(nasabah.nama || '');
      setNik(nasabah.nik || '');
      setNoKk(nasabah.noKk || '');
      setNoHp(nasabah.noHp || '');
      setNamaPenjamin(nasabah.namaPenjamin || '');
      setNikPenjamin(nasabah.nikPenjamin || '');
      setNoHpKerabat(nasabah.noHpKerabat || '');
      setHubunganKerabat(nasabah.hubunganKerabat || 'Istri');
      setDesa(nasabah.desa || 'Lewoleba Barat');
      setAlamat(nasabah.alamat || '');
      setPekerjaan(nasabah.pekerjaan || '');
      setPenghasilanBulanan(nasabah.penghasilanBulanan || 0);
      setStatus(nasabah.status || 'aktif');
      setErrorMsg(null);
      setSaving(false);
    }
  }, [nasabah, isOpen]);

  if (!isOpen || !nasabah) return null;

  // Otoritas hanya untuk Petugas Lapangan
  const isPetugas = currentUser?.role === 'petugas';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isPetugas) {
      setErrorMsg('Akses Dibatasi: Hanya Petugas Lapangan yang memiliki hak mengubah data nasabah.');
      return;
    }

    if (!nama.trim()) {
      setErrorMsg('Nama lengkap nasabah wajib diisi.');
      return;
    }

    const cleanNik = nik.replace(/\D/g, '');
    if (cleanNik.length !== 16) {
      setErrorMsg(`NIK peminjam harus 16 digit angka (saat ini ${cleanNik.length} digit).`);
      return;
    }

    const cleanNoKk = noKk.replace(/\D/g, '');
    if (cleanNoKk.length !== 16) {
      setErrorMsg(`Nomor Kartu Keluarga (KK) harus 16 digit angka (saat ini ${cleanNoKk.length} digit).`);
      return;
    }

    if (!noHp.trim()) {
      setErrorMsg('Nomor Handphone / WhatsApp peminjam wajib diisi.');
      return;
    }

    if (!namaPenjamin.trim()) {
      setErrorMsg('Nama penjamin / kerabat wajib diisi untuk verifikasi pinjaman.');
      return;
    }

    setSaving(true);

    const success = updateNasabah(nasabah.id, {
      nama: nama.trim(),
      nik: cleanNik,
      noKk: cleanNoKk,
      noHp: noHp.trim(),
      namaPenjamin: namaPenjamin.trim(),
      nikPenjamin: nikPenjamin.replace(/\D/g, '') || nikPenjamin.trim(),
      noHpKerabat: noHpKerabat.trim(),
      hubunganKerabat: hubunganKerabat.trim(),
      desa: desa.trim(),
      alamat: alamat.trim(),
      pekerjaan: pekerjaan.trim(),
      penghasilanBulanan: Number(penghasilanBulanan) || 0,
      status,
    });

    setSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 overflow-y-auto">
      <div className="bg-white rounded shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs font-sans border border-gray-300 animate-in fade-in zoom-in duration-150">
        {/* Header Modal */}
        <div className="bg-[#00c0ef] text-white p-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">
                Ubah Data Nasabah Binaan ({nasabah.id})
              </h2>
              <p className="text-[11px] text-cyan-100">
                KSP Swasti Mandiri Cabang Nubatukan &bull; Otoritas: Petugas Lapangan ({currentUser?.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifikasi Akses atau Error */}
        {!isPetugas && (
          <div className="m-3 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px]">
              Perhatian: Anda login sebagai <strong>{currentUser?.role}</strong>. Hanya <strong>Petugas Lapangan</strong> yang diizinkan memperbarui berkas nasabah.
            </span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-4 mt-3 p-2.5 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-[11px] font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded p-2.5 flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-blue-900">Nomor Registrasi:</span>
              <span className="font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">{nasabah.id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Terdaftar Sejak:</span>
              <span className="font-semibold text-gray-800">{nasabah.tanggalDaftar}</span>
              <span className="text-gray-400">&bull;</span>
              <span className="text-gray-600">Petugas Asal: {nasabah.petugasNama}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bagian 1: Identitas Peminjam */}
            <div className="space-y-3 bg-gray-50/70 p-3.5 rounded border border-gray-200">
              <div className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span className="flex items-center text-blue-700">
                  <Shield className="w-3.5 h-3.5 mr-1.5" />
                  1. Identitas Pokok Peminjam
                </span>
                <span className="text-[10px] text-gray-500 font-normal">Wajib KTP & KK Lembata</span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nama Lengkap Peminjam *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isPetugas}
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Petrus Laba Lamak"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    NIK / KTP (16 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    disabled={!isPetugas}
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    placeholder="530804..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                  <div className="text-[10px] text-gray-500 mt-0.5">{nik.length}/16 Digit</div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Nomor KK (16 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    disabled={!isPetugas}
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value.replace(/\D/g, ''))}
                    placeholder="530804..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                  />
                  <div className="text-[10px] text-gray-500 mt-0.5">{noKk.length}/16 Digit</div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Phone className="w-3 h-3 text-emerald-600 mr-1" />
                    Nomor HP / WhatsApp Aktif *
                  </span>
                  <span className="text-[10px] text-emerald-600 font-normal">Untuk Notifikasi Otomatis</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isPetugas}
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 0813-3987-1234"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-emerald-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Status Keanggotaan
                </label>
                <select
                  disabled={!isPetugas}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'aktif' | 'nonaktif')}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                >
                  <option value="aktif">Aktif (Dapat Mengajukan Pinjaman & Simpanan)</option>
                  <option value="nonaktif">Nonaktif (Dalam Pembinaan / Cuti Koperasi)</option>
                </select>
              </div>
            </div>

            {/* Bagian 2: Data Kerabat & Penjamin */}
            <div className="space-y-3 bg-gray-50/70 p-3.5 rounded border border-gray-200">
              <div className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 flex items-center justify-between">
                <span className="flex items-center text-indigo-700">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  2. Kerabat & Penjamin Sah
                </span>
                <span className="text-[10px] text-gray-500 font-normal">Verifikasi Penjamin</span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Nama Penjamin / Kerabat *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isPetugas}
                  value={namaPenjamin}
                  onChange={(e) => setNamaPenjamin(e.target.value)}
                  placeholder="Contoh: Theresia Barek"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Hubungan Kerabat *
                  </label>
                  <select
                    disabled={!isPetugas}
                    value={hubunganKerabat}
                    onChange={(e) => setHubunganKerabat(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                  >
                    {HUBUNGAN_OPTIONS.map((hub) => (
                      <option key={hub} value={hub}>
                        {hub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    NIK Penjamin (16 Digit)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    disabled={!isPetugas}
                    value={nikPenjamin}
                    onChange={(e) => setNikPenjamin(e.target.value.replace(/\D/g, ''))}
                    placeholder="530804..."
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                  />
                  <div className="text-[10px] text-gray-500 mt-0.5">{nikPenjamin.length}/16 Digit</div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center">
                    <Phone className="w-3 h-3 text-indigo-600 mr-1" />
                    Nomor HP Kerabat / Penjamin *
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal">Kontak Alternatif</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={!isPetugas}
                  value={noHpKerabat}
                  onChange={(e) => setNoHpKerabat(e.target.value)}
                  placeholder="Contoh: 0821-4567-8910"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Bagian 3: Domisili Wilayah & Data Ekonomi Usaha */}
          <div className="bg-gray-50/70 p-3.5 rounded border border-gray-200 space-y-3">
            <div className="font-bold text-gray-800 border-b border-gray-200 pb-1.5 flex items-center justify-between">
              <span className="flex items-center text-teal-700">
                <Home className="w-3.5 h-3.5 mr-1.5" />
                3. Wilayah Domisili & Profil Ekonomi Usaha di Lembata
              </span>
              <span className="text-[10px] text-gray-500 font-normal">Kecamatan Nubatukan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Desa / Kelurahan Binaan *
                </label>
                <select
                  disabled={!isPetugas}
                  value={desa}
                  onChange={(e) => setDesa(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-gray-100"
                >
                  {DESA_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Alamat Lengkap (Dusun / Jalan / RT & RW) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isPetugas}
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Merdeka RT 04 / RW 02"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center">
                  <Briefcase className="w-3 h-3 text-gray-600 mr-1" />
                  Pekerjaan / Bidang Usaha Utama *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isPetugas}
                  value={pekerjaan}
                  onChange={(e) => setPekerjaan(e.target.value)}
                  placeholder="Contoh: Pedagang Kelontong Pasar Pada / Nelayan Tangkap"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Estimasi Penghasilan Bulanan (Rp) *
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-gray-500 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    min={0}
                    step={100000}
                    disabled={!isPetugas}
                    value={penghasilanBulanan || ''}
                    onChange={(e) => setPenghasilanBulanan(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded pl-9 pr-2.5 py-1.5 text-xs font-mono font-semibold focus:ring-1 focus:ring-teal-500 outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Modal Buttons */}
          <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition cursor-pointer font-medium"
            >
              Batal
            </button>

            {isPetugas ? (
              <button
                type="submit"
                disabled={saving}
                className="bg-[#00c0ef] hover:bg-[#00a7d0] text-white px-5 py-2 rounded font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan Data Nasabah'}</span>
              </button>
            ) : (
              <span className="text-[11px] text-gray-500 italic">
                Mode Hanya Lihat (Hanya Petugas Lapangan yang Berhak Menyimpan)
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
