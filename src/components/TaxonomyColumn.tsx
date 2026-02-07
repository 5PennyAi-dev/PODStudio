import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';

interface TaxonomyItem {
  id: string;
  name: string;
  count?: number;
}

interface TaxonomyColumnProps {
  title: string;
  items: TaxonomyItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string) => Promise<void>;
  onEdit: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  emptyMessage: string;
  loading?: boolean;
}

export function TaxonomyColumn({
  title,
  items,
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  emptyMessage,
  loading = false,
}: TaxonomyColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editName, setEditName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setActionLoading(true);
    try {
      await onAdd(newName.trim());
      setNewName('');
      setIsAdding(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    setActionLoading(true);
    try {
      await onEdit(id, editName.trim());
      setEditingId(null);
      setEditName('');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await onDelete(id);
      setDeleteConfirmId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (item: TaxonomyItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  return (
    <div className="bg-void-surface border border-void-border rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-void-border flex items-center justify-between">
        <h3 className="text-sm font-mono text-void-text-muted uppercase tracking-wider">{title}</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-accent/10 border border-neon-accent/30 rounded-lg text-neon-accent text-xs font-bold uppercase tracking-wider hover:bg-neon-accent hover:text-void-bg transition-all"
        >
          <Plus size={14} />
          Nouveau
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-void-border scrollbar-track-transparent">
        {/* Add Form */}
        {isAdding && (
          <div className="flex items-center gap-2 p-2 bg-void-bg rounded-lg border border-neon-accent/50">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Nom..."
              autoFocus
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder-void-text-muted/50"
            />
            <button
              onClick={handleAdd}
              disabled={actionLoading || !newName.trim()}
              className="p-1.5 text-green-400 hover:bg-green-400/20 rounded transition-colors disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button
              onClick={() => { setIsAdding(false); setNewName(''); }}
              className="p-1.5 text-red-400 hover:bg-red-400/20 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-neon-accent" size={24} />
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && (
          <div className="text-center py-8 text-void-text-muted text-sm">
            {emptyMessage}
          </div>
        )}

        {/* Items List */}
        {!loading && items.map((item) => (
          <div
            key={item.id}
            className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all ${
              selectedId === item.id
                ? 'bg-neon-accent/10 border-l-2 border-neon-accent'
                : 'hover:bg-void-bg border-l-2 border-transparent'
            }`}
          >
            {editingId === item.id ? (
              /* Edit Mode */
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEdit(item.id)}
                  autoFocus
                  className="flex-1 bg-void-bg text-white text-sm px-2 py-1 rounded border border-neon-accent/50 outline-none"
                />
                <button
                  onClick={() => handleEdit(item.id)}
                  disabled={actionLoading}
                  className="p-1 text-green-400 hover:bg-green-400/20 rounded"
                >
                  {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                </button>
                <button
                  onClick={() => { setEditingId(null); setEditName(''); }}
                  className="p-1 text-red-400 hover:bg-red-400/20 rounded"
                >
                  <X size={12} />
                </button>
              </div>
            ) : deleteConfirmId === item.id ? (
              /* Delete Confirmation */
              <div className="flex-1 flex items-center justify-between">
                <span className="text-red-400 text-sm">Supprimer ?</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={actionLoading}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded font-bold"
                  >
                    {actionLoading ? <Loader2 size={12} className="animate-spin" /> : 'Oui'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-2 py-1 bg-void-border text-void-text-muted text-xs rounded"
                  >
                    Non
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Display */
              <>
                <div className="flex-1" onClick={() => onSelect(item.id)}>
                  <span className="text-white text-sm">{item.name}</span>
                  {item.count !== undefined && (
                    <span className="ml-2 text-xs text-void-text-muted">({item.count})</span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                    className="p-1.5 text-void-text-muted hover:text-neon-accent hover:bg-neon-accent/10 rounded transition-all"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(item.id); }}
                    className="p-1.5 text-void-text-muted hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
