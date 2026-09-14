import React, { useState } from 'react';
import { X, UserPlus, Trash2, Edit2, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { PicMember } from '../types';

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  pics: PicMember[];
  onAddPic: (name: string, role?: string) => void;
  onUpdatePic: (id: string, name: string, role?: string) => void;
  onDeletePic: (id: string) => void;
  onReorderPics: (newPics: PicMember[]) => void;
}

export const ManageTeamModal: React.FC<ManageTeamModalProps> = ({
  isOpen,
  onClose,
  pics,
  onAddPic,
  onUpdatePic,
  onDeletePic,
  onReorderPics,
}) => {
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('SPV Operation');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameText, setEditNameText] = useState('');
  const [editRoleText, setEditRoleText] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddPic(newName.trim(), newRole.trim() || 'SPV Operation');
    setNewName('');
    setNewRole('SPV Operation');
  };

  const startEdit = (pic: PicMember) => {
    setEditingId(pic.id);
    setEditNameText(pic.name);
    setEditRoleText(pic.role || 'SPV Operation');
  };

  const saveEdit = (id: string) => {
    if (editNameText.trim()) {
      onUpdatePic(
        id,
        editNameText.trim(),
        editRoleText.trim() || 'SPV Operation'
      );
    }
    setEditingId(null);
  };

  const movePic = (index: number, direction: 'up' | 'down') => {
    const newPics = [...pics];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPics.length) return;

    const temp = newPics[index];
    newPics[index] = newPics[targetIndex];
    newPics[targetIndex] = temp;
    onReorderPics(newPics);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-[#356170] text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black">
              Kelola Tim SPV Operation
            </h2>
            <p className="text-xs text-teal-100">
              Total {pics.length} personil terdaftar dalam monitoring
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add New PIC form */}
        <form onSubmit={handleAdd} className="p-3 bg-slate-50 border-b border-slate-200">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <UserPlus className="w-3.5 h-3.5 text-teal-600" />
            Tambah Personil Baru
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Nama SPV / Personil..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <input
              type="text"
              placeholder="Jabatan (cth: SPV Operation)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="sm:w-44 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </button>
          </div>
        </form>

        {/* PIC list */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
          {pics.map((pic, idx) => (
            <div
              key={pic.id}
              className={`py-2 px-2.5 rounded-xl transition-all ${
                editingId === pic.id
                  ? 'bg-teal-50/70 border border-teal-300 my-1 shadow-xs'
                  : 'hover:bg-slate-50 flex items-center justify-between gap-2 group'
              }`}
            >
              {editingId === pic.id ? (
                /* Inline Edit Mode for both Name and Jabatan */
                <div className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-teal-800 flex items-center gap-1.5">
                      <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                      Edit Nama & Jabatan #{idx + 1}
                    </span>
                    <span className="text-[10px] text-slate-400">Tekan Enter untuk simpan</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={editNameText}
                        onChange={(e) => setEditNameText(e.target.value)}
                        placeholder="Nama personil..."
                        className="w-full px-2.5 py-1.5 bg-white border border-teal-400 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(pic.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Jabatan / Posisi
                      </label>
                      <input
                        type="text"
                        value={editRoleText}
                        onChange={(e) => setEditRoleText(e.target.value)}
                        placeholder="Jabatan (cth: SPV Operation)..."
                        className="w-full px-2.5 py-1.5 bg-white border border-teal-400 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(pic.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-md cursor-pointer font-medium transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(pic.id)}
                      className="px-3.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Simpan Perubahan</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-5 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {pic.name}
                      </span>
                      <span className="text-[11px] text-teal-700 font-medium block">
                        {pic.role || 'SPV Operation'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => movePic(idx, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer rounded hover:bg-slate-100"
                      title="Pindah ke atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === pics.length - 1}
                      onClick={() => movePic(idx, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer rounded hover:bg-slate-100"
                      title="Pindah ke bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => startEdit(pic)}
                      className="p-1 text-slate-400 hover:text-teal-600 cursor-pointer rounded hover:bg-teal-50"
                      title="Edit nama & jabatan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Yakin ingin menghapus ${pic.name} dari daftar checklist?`
                          )
                        ) {
                          onDeletePic(pic.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer rounded hover:bg-rose-50"
                      title="Hapus SPV"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
