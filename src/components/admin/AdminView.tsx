import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Key,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Building,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';

export const AdminView: React.FC = () => {
  const {
    users,
    currentUser,
    tambahUser,
    updateUser,
    hapusUser,
    cabangConfig,
    updateCabangConfig,
    resetDataKeAwal,
    activeMenu,
    setActiveMenu,
    addToast,
  } = useApp();

  const getTabFromMenu = () => {
    if (activeMenu === 'admin-cabang') return 'cabang';
    if (activeMenu === 'admin-system') return 'system';
    return 'users';
  };

  const [activeTab, setActiveTab] = useState<'users' | 'cabang' | 'system'>(getTabFromMenu);

  useEffect(() => {
    setActiveTab(getTabFromMenu());
  }, [activeMenu]);

  // Edit / Password Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editError, setEditError] = useState('');

  // Add User Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addRole, setAddRole] = useState<UserRole>('petugas');
  const [addPass, setAddPass] = useState('petugas123');
  const [addPhone, setAddPhone] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState('');

  // Delete User Confirmation Modal State (NO WINDOW.CONFIRM)
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Reset System Confirmation Modal State (NO WINDOW.CONFIRM)
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Edit Cabang Form
  const [cabangNama, setCabangNama] = useState(cabangConfig.namaCabang);
  const [cabangAlamat, setCabangAlamat] = useState(cabangConfig.alamat);
  const [cabangTelepon, setCabangTelepon] = useState(cabangConfig.telepon);
  const [cabangKepala, setCabangKepala] = useState(cabangConfig.kepalaCabang);

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setNewPassword(user.password);
    setConfirmPassword(user.password);
    setEditError('');
  };

  const handleSaveUserChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    if (!editingUser) return;

    if (newPassword && newPassword !== confirmPassword) {
      setEditError('Konfirmasi password tidak cocok dengan password baru!');
      addToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    updateUser(editingUser.id, {
      name: editingUser.name,
      username: editingUser.username,
      role: editingUser.role,
      phone: editingUser.phone,
      email: editingUser.email,
      status: editingUser.status,
      password: newPassword || editingUser.password,
    });

    setEditingUser(null);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!addName.trim() || !addUsername.trim() || !addPass.trim()) {
      setAddError('Mohon isi nama lengkap, username, dan password.');
      addToast('Data formulir pengguna belum lengkap.', 'error');
      return;
    }

    tambahUser({
      name: addName,
      username: addUsername,
      role: addRole,
      password: addPass,
      phone: addPhone || '0812-3456-7890',
      email: addEmail || `${addUsername}@kspnubatukan.id`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      status: 'aktif',
    });

    setShowAddModal(false);
    setAddName('');
    setAddUsername('');
  };

  const handleSaveCabang = (e: React.FormEvent) => {
    e.preventDefault();
    updateCabangConfig({
      namaCabang: cabangNama,
      alamat: cabangAlamat,
      telepon: cabangTelepon,
      kepalaCabang: cabangKepala,
    });
  };

  const roleBadge = (role: UserRole) => {
    switch (role) {
      case 'petugas':
        return <span className="bg-[#00c0ef] text-white px-2 py-0.5 rounded text-[10px] font-bold">Petugas Lapangan</span>;
      case 'kepala_unit':
        return <span className="bg-[#00a65a] text-white px-2 py-0.5 rounded text-[10px] font-bold">Kepala Unit</span>;
      case 'kepala_manager':
        return <span className="bg-[#f39c12] text-white px-2 py-0.5 rounded text-[10px] font-bold">Kepala Manager</span>;
      case 'admin':
        return <span className="bg-[#dd4b39] text-white px-2 py-0.5 rounded text-[10px] font-bold">Admin Sistem</span>;
    }
  };

  const handleSwitchTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'users') setActiveMenu('admin-users');
    else if (tab === 'cabang') setActiveMenu('admin-cabang');
    else if (tab === 'system') setActiveMenu('admin-system');
  };

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-1 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <span>Tugas Admin Sistem</span>
            <small className="font-light text-xs text-gray-500 ml-2.5">
              Kelola Pengguna, Edit Password & Pengaturan Cabang Nubatukan
            </small>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Admin memiliki hak istimewa penuh untuk mengedit akun pengguna, mengubah password, dan mengonfigurasi parameter sistem.
          </p>
        </div>
        <div className="text-xs text-gray-500 mt-2 sm:mt-0 flex items-center space-x-1">
          <span className="text-gray-400">Home</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-semibold">Admin Panel</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center bg-white border border-gray-200 rounded shadow-xs p-1 gap-1">
        <button
          onClick={() => handleSwitchTab('users')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#dd4b39] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <UserCog className="w-3.5 h-3.5" />
          <span>1. Manajemen User & Edit Password ({users.length})</span>
        </button>

        <button
          onClick={() => handleSwitchTab('cabang')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'cabang'
              ? 'bg-[#3c8dbc] text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>2. Konfigurasi Cabang Nubatukan</span>
        </button>

        <button
          onClick={() => handleSwitchTab('system')}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer ${
            activeTab === 'system'
              ? 'bg-gray-800 text-white shadow-xs'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>3. Pemeliharaan & Reset Data</span>
        </button>
      </div>

      {/* TAB 1: MANAJEMEN USER & PASSWORD */}
      {activeTab === 'users' && (
        <div className="bg-white rounded shadow-xs border-t-3 border-t-[#dd4b39] border-x border-b border-gray-200">
          <div className="p-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">
                Daftar Petugas & Pengguna KSP Cabang Nubatukan
              </h2>
              <p className="text-[11px] text-gray-500">
                Klik tombol "Edit / Ganti Password" pada pengguna untuk mengubah password atau hak akses peran.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#00a65a] hover:bg-[#008d4c] text-white px-3 py-1.5 rounded font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Petugas Baru</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200 text-[10px] uppercase">
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Username</th>
                  <th className="p-2.5">Peran / Hak Akses</th>
                  <th className="p-2.5">Password Saat Ini</th>
                  <th className="p-2.5">Kontak & Email</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-2.5">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-gray-900">{u.name}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 font-mono font-semibold text-blue-700">{u.username}</td>
                    <td className="p-2.5">{roleBadge(u.role)}</td>
                    <td className="p-2.5 font-mono text-gray-600">
                      <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        •••••••• ({u.password})
                      </span>
                    </td>
                    <td className="p-2.5">
                      <div>{u.phone}</div>
                      <div className="text-[10px] text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'aktif'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-2.5 py-1 rounded text-[11px] font-semibold flex items-center space-x-1 cursor-pointer"
                        >
                          <Key className="w-3 h-3" />
                          <span>Edit / Password</span>
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="bg-gray-100 hover:bg-rose-100 text-gray-600 hover:text-rose-700 p-1 rounded cursor-pointer"
                            title="Hapus user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER & UBAH PASSWORD */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-md shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 text-xs">
            {/* Modal Header */}
            <div className="bg-[#3c8dbc] text-white p-3 flex items-center justify-between">
              <div className="font-bold flex items-center">
                <Key className="w-4 h-4 mr-1.5 text-yellow-300" />
                <span>Edit User & Ganti Password: {editingUser.name}</span>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-white hover:text-gray-200 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="m-3 p-2 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveUserChanges} className="p-4 space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Username Login</label>
                  <input
                    type="text"
                    required
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Peran Pengguna</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                    }
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="petugas">Petugas Lapangan</option>
                    <option value="kepala_unit">Kepala Unit</option>
                    <option value="kepala_manager">Kepala Manager</option>
                    <option value="admin">Admin Sistem</option>
                  </select>
                </div>
              </div>

              {/* Password Editing Field */}
              <div className="p-3 bg-red-50/60 rounded border border-red-200 space-y-2">
                <div className="font-bold text-red-900 flex items-center justify-between">
                  <span className="flex items-center">
                    <Lock className="w-3.5 h-3.5 mr-1 text-red-600" />
                    Ubah Password Akun
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 text-[11px] flex items-center space-x-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Tampilkan'}</span>
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Password Baru</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password baru"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">No Telepon</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Akun</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value as 'aktif' | 'nonaktif' })
                    }
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded font-bold cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS USER (NO WINDOW.CONFIRM) */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-md shadow-2xl max-w-sm w-full p-4 border border-gray-200 space-y-3">
            <div className="font-bold text-gray-900 text-sm flex items-center text-rose-700">
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>Konfirmasi Hapus Pengguna</span>
            </div>
            <p className="text-gray-600 text-xs">
              Apakah Anda yakin ingin menghapus akun petugas <b>{userToDelete.name}</b> ({userToDelete.username})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  hapusUser(userToDelete.id);
                  setUserToDelete(null);
                }}
                className="px-4 py-1.5 bg-[#dd4b39] hover:bg-[#c23321] text-white rounded font-bold cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH USER BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-md shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 text-xs">
            <div className="bg-[#00a65a] text-white p-3 flex items-center justify-between">
              <div className="font-bold flex items-center">
                <UserPlus className="w-4 h-4 mr-1.5" />
                <span>Tambah Pengguna Baru Cabang Nubatukan</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-gray-200 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="m-3 p-2 bg-rose-50 border border-rose-300 text-rose-800 rounded flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="p-4 space-y-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Yoseph Goran, S.E."
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Username Login *</label>
                  <input
                    type="text"
                    required
                    placeholder="yoseph"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Peran *</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="petugas">Petugas Lapangan</option>
                    <option value="kepala_unit">Kepala Unit</option>
                    <option value="kepala_manager">Kepala Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Password Default *</label>
                <input
                  type="text"
                  required
                  value={addPass}
                  onChange={(e) => setAddPass(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">No Telepon</label>
                  <input
                    type="text"
                    placeholder="0813-..."
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="user@kspnubatukan.id"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white rounded font-bold cursor-pointer"
                >
                  Buat Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: PROFIL CABANG NUBATUKAN */}
      {activeTab === 'cabang' && (
        <div className="bg-white rounded shadow-xs border-t-3 border-t-[#3c8dbc] border-x border-b border-gray-200 p-4 max-w-2xl">
          <h2 className="font-bold text-gray-800 text-sm flex items-center mb-3">
            <Building className="w-4 h-4 text-[#3c8dbc] mr-2" />
            Pengaturan Profil Kantor Cabang Nubatukan
          </h2>

          <form onSubmit={handleSaveCabang} className="space-y-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Nama Cabang</label>
              <input
                type="text"
                value={cabangNama}
                onChange={(e) => setCabangNama(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Alamat Kantor Cabang (Lembata)
              </label>
              <textarea
                rows={2}
                value={cabangAlamat}
                onChange={(e) => setCabangAlamat(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nomor Kontak Telepon</label>
                <input
                  type="text"
                  value={cabangTelepon}
                  onChange={(e) => setCabangTelepon(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Kepala Cabang</label>
                <input
                  type="text"
                  value={cabangKepala}
                  onChange={(e) => setCabangKepala(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 text-xs">
              <span className="font-bold block">Skema Suku Bunga Aktif Cabang Nubatukan:</span>
              <span><strong>0,5% Per Bulan Menurun (Declining Balance)</strong> &bull; Diterapkan otomatis pada semua simulasi & angsuran pinjaman.</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-[#3c8dbc] hover:bg-[#367fa9] text-white px-4 py-2 rounded font-bold text-xs cursor-pointer"
              >
                Simpan Profil Cabang
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SYSTEM MAINTENANCE & RESET DATA */}
      {activeTab === 'system' && (
        <div className="bg-white rounded shadow-xs border-t-3 border-t-gray-800 border-x border-b border-gray-200 p-4 max-w-xl space-y-4">
          <h2 className="font-bold text-gray-800 text-sm flex items-center">
            <RefreshCw className="w-4 h-4 text-gray-700 mr-2" />
            Pemeliharaan Sistem & Reset Data Simulasi
          </h2>
          <p className="text-gray-600 text-xs leading-relaxed">
            Jika Anda ingin mengembalikan seluruh akun pengguna, data nasabah, pinjaman, dan simpanan Cabang Nubatukan ke kondisi awal standar, Anda dapat menggunakan tombol di bawah ini:
          </p>

          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-900 text-xs">
            <strong>Peringatan:</strong> Seluruh data yang disimpan di peramban ini akan direset kembali ke akun default (petugas, unit, manager, admin) dan pinjaman contoh Nubatukan.
          </div>

          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="bg-[#dd4b39] hover:bg-[#c23321] text-white px-4 py-2 rounded font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Seluruh Data ke Nilai Awal</span>
          </button>
        </div>
      )}

      {/* MODAL: RESET CONFIRMATION (NO WINDOW.CONFIRM) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-md shadow-2xl max-w-sm w-full p-4 border border-gray-200 space-y-3">
            <div className="font-bold text-gray-900 text-sm flex items-center text-rose-700">
              <RefreshCw className="w-4 h-4 mr-1.5" />
              <span>Konfirmasi Reset Sistem</span>
            </div>
            <p className="text-gray-600 text-xs">
              Apakah Anda yakin ingin mengembalikan seluruh data simulasi KSP Cabang Nubatukan ke pengaturan pabrik awal?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDataKeAwal();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-1.5 bg-[#dd4b39] hover:bg-[#c23321] text-white rounded font-bold cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
