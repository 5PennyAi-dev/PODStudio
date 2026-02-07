import { useState, useEffect, useCallback } from 'react';
import { Settings2, Plus, Pencil, Trash2, Check, X, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Theme { id: string; name: string; }
interface Niche { id: string; theme_id: string; name: string; }
interface SubNiche { id: string; niche_id: string; name: string; }

export default function Piloting() {
  // Data State
  const [themes, setThemes] = useState<Theme[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [subNiches, setSubNiches] = useState<SubNiche[]>([]);

  // Selection State
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [selectedNicheId, setSelectedNicheId] = useState<string>('');

  // UI State
  const [loading, setLoading] = useState({ themes: true, niches: false, subNiches: false });
  const [addingTheme, setAddingTheme] = useState(false);
  const [addingNiche, setAddingNiche] = useState(false);
  const [addingSubNiche, setAddingSubNiche] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // === FETCH ===
  const fetchThemes = useCallback(async () => {
    setLoading(l => ({ ...l, themes: true }));
    const { data } = await supabase.from('themes').select('*').order('name');
    if (data) setThemes(data);
    setLoading(l => ({ ...l, themes: false }));
  }, []);

  const fetchNiches = useCallback(async (themeId: string) => {
    setLoading(l => ({ ...l, niches: true }));
    const { data } = await supabase.from('niches').select('*').eq('theme_id', themeId).order('name');
    if (data) setNiches(data);
    setLoading(l => ({ ...l, niches: false }));
  }, []);

  const fetchSubNiches = useCallback(async (nicheId: string) => {
    setLoading(l => ({ ...l, subNiches: true }));
    const { data } = await supabase.from('sub_niches').select('*').eq('niche_id', nicheId).order('name');
    if (data) setSubNiches(data);
    setLoading(l => ({ ...l, subNiches: false }));
  }, []);

  useEffect(() => { fetchThemes(); }, [fetchThemes]);

  useEffect(() => {
    if (selectedThemeId) {
      fetchNiches(selectedThemeId);
      setSelectedNicheId('');
      setSubNiches([]);
    } else {
      setNiches([]);
    }
  }, [selectedThemeId, fetchNiches]);

  useEffect(() => {
    if (selectedNicheId) {
      fetchSubNiches(selectedNicheId);
    } else {
      setSubNiches([]);
    }
  }, [selectedNicheId, fetchSubNiches]);

  // === CRUD HANDLERS ===
  const handleAdd = async (type: 'theme' | 'niche' | 'subNiche') => {
    if (!newName.trim()) return;
    setActionLoading(true);
    try {
      if (type === 'theme') {
        await supabase.from('themes').insert({ name: newName.trim() });
        await fetchThemes();
        setAddingTheme(false);
      } else if (type === 'niche' && selectedThemeId) {
        await supabase.from('niches').insert({ name: newName.trim(), theme_id: selectedThemeId });
        await fetchNiches(selectedThemeId);
        setAddingNiche(false);
      } else if (type === 'subNiche' && selectedNicheId) {
        await supabase.from('sub_niches').insert({ name: newName.trim(), niche_id: selectedNicheId });
        await fetchSubNiches(selectedNicheId);
        setAddingSubNiche(false);
      }
      setNewName('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (type: 'theme' | 'niche' | 'subNiche', id: string) => {
    if (!editName.trim()) return;
    setActionLoading(true);
    try {
      const table = type === 'theme' ? 'themes' : type === 'niche' ? 'niches' : 'sub_niches';
      await supabase.from(table).update({ name: editName.trim() }).eq('id', id);
      if (type === 'theme') await fetchThemes();
      else if (type === 'niche' && selectedThemeId) await fetchNiches(selectedThemeId);
      else if (type === 'subNiche' && selectedNicheId) await fetchSubNiches(selectedNicheId);
      setEditingId(null);
      setEditName('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      const { type, id } = deleteConfirm;
      const table = type === 'theme' ? 'themes' : type === 'niche' ? 'niches' : 'sub_niches';
      await supabase.from(table).delete().eq('id', id);
      
      if (type === 'theme') {
        if (selectedThemeId === id) setSelectedThemeId('');
        await fetchThemes();
      } else if (type === 'niche') {
        if (selectedNicheId === id) setSelectedNicheId('');
        if (selectedThemeId) await fetchNiches(selectedThemeId);
      } else if (type === 'subNiche' && selectedNicheId) {
        await fetchSubNiches(selectedNicheId);
      }
      setDeleteConfirm(null);
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  // === RENDER HELPERS ===
  const renderItem = (item: { id: string; name: string }, type: 'theme' | 'niche' | 'subNiche') => (
    <div key={item.id} className="group flex items-center gap-2 px-3 py-2 hover:bg-void-bg rounded-lg transition-colors">
      {editingId === item.id ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit(type, item.id)}
            autoFocus
            className="flex-1 bg-void-bg text-white text-sm px-2 py-1 rounded border border-neon-accent/50 outline-none"
          />
          <button onClick={() => handleEdit(type, item.id)} className="p-1 text-green-400 hover:bg-green-400/20 rounded">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
          <button onClick={() => setEditingId(null)} className="p-1 text-red-400 hover:bg-red-400/20 rounded">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-white text-sm">{item.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => startEdit(item.id, item.name)} className="p-1 text-void-text-muted hover:text-neon-accent rounded">
              <Pencil size={12} />
            </button>
            <button onClick={() => setDeleteConfirm({ type, id: item.id })} className="p-1 text-void-text-muted hover:text-red-400 rounded">
              <Trash2 size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderAddForm = (type: 'theme' | 'niche' | 'subNiche', isAdding: boolean, setIsAdding: (v: boolean) => void) => {
    if (!isAdding) {
      return (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-neon-accent text-xs font-medium hover:bg-neon-accent/10 rounded-lg transition-colors"
        >
          <Plus size={14} /> Ajouter
        </button>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(type)}
          placeholder="Nom..."
          autoFocus
          className="flex-1 bg-void-bg text-white text-sm px-3 py-1.5 rounded-lg border border-void-border focus:border-neon-accent outline-none"
        />
        <button onClick={() => handleAdd(type)} disabled={actionLoading} className="p-1.5 text-green-400 hover:bg-green-400/20 rounded">
          {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        </button>
        <button onClick={() => { setIsAdding(false); setNewName(''); }} className="p-1.5 text-red-400 hover:bg-red-400/20 rounded">
          <X size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-neon-accent/10 rounded-lg">
          <Settings2 className="text-neon-accent" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Pilotage</h1>
          <p className="text-void-text-muted text-sm">Gestion de la taxonomie</p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-void-surface border border-void-border rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-white font-bold">Confirmer la suppression</h3>
            <p className="text-void-text-muted text-sm">Cette action est irréversible. Les éléments enfants seront également supprimés.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-void-text-muted hover:text-white transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={actionLoading} className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THEMES Section */}
      <div className="bg-void-surface border border-void-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-mono text-void-text-muted uppercase tracking-wider">Thèmes</h2>
          {renderAddForm('theme', addingTheme, setAddingTheme)}
        </div>
        {loading.themes ? (
          <Loader2 className="animate-spin text-neon-accent mx-auto" size={20} />
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-void-border">
            {themes.map(t => renderItem(t, 'theme'))}
          </div>
        )}
      </div>

      {/* NICHES Section */}
      <div className="bg-void-surface border border-void-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-mono text-void-text-muted uppercase tracking-wider">Niches</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedThemeId}
                onChange={(e) => setSelectedThemeId(e.target.value)}
                className="appearance-none bg-void-bg text-white text-sm border border-void-border rounded-lg pl-3 pr-8 py-1.5 focus:border-neon-accent outline-none cursor-pointer"
              >
                <option value="">Sélectionner un thème...</option>
                {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-void-text-muted pointer-events-none" />
            </div>
            {selectedThemeId && renderAddForm('niche', addingNiche, setAddingNiche)}
          </div>
        </div>
        {!selectedThemeId ? (
          <p className="text-void-text-muted text-sm text-center py-4">Sélectionnez un thème pour voir ses niches</p>
        ) : loading.niches ? (
          <Loader2 className="animate-spin text-neon-accent mx-auto" size={20} />
        ) : niches.length === 0 ? (
          <p className="text-void-text-muted text-sm text-center py-4">Aucune niche. Ajoutez-en une !</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-void-border">
            {niches.map(n => renderItem(n, 'niche'))}
          </div>
        )}
      </div>

      {/* SUB-NICHES Section */}
      <div className="bg-void-surface border border-void-border rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-mono text-void-text-muted uppercase tracking-wider">Sous-Niches</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedNicheId}
                onChange={(e) => setSelectedNicheId(e.target.value)}
                disabled={!selectedThemeId}
                className="appearance-none bg-void-bg text-white text-sm border border-void-border rounded-lg pl-3 pr-8 py-1.5 focus:border-neon-accent outline-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Sélectionner une niche...</option>
                {niches.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-void-text-muted pointer-events-none" />
            </div>
            {selectedNicheId && renderAddForm('subNiche', addingSubNiche, setAddingSubNiche)}
          </div>
        </div>
        {!selectedNicheId ? (
          <p className="text-void-text-muted text-sm text-center py-4">Sélectionnez une niche pour voir ses sous-niches</p>
        ) : loading.subNiches ? (
          <Loader2 className="animate-spin text-neon-accent mx-auto" size={20} />
        ) : subNiches.length === 0 ? (
          <p className="text-void-text-muted text-sm text-center py-4">Aucune sous-niche. Ajoutez-en une !</p>
        ) : (
          <div className="space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-void-border">
            {subNiches.map(sn => renderItem(sn, 'subNiche'))}
          </div>
        )}
      </div>
    </div>
  );
}
