import { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { DesignCard } from '@/components/DesignCard';
import { CreateDesignPanel } from '@/components/forms/CreateDesignPanel';

type DesignWithRelations = Database['public']['Tables']['designs']['Row'] & {
  themes: { name: string } | null;
  niches: { name: string } | null;
  sub_niches: { name: string } | null;
  design_mockups: { storage_url: string }[] | null;
};

export default function Catalog() {
  const [designs, setDesigns] = useState<DesignWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<DesignWithRelations | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDesigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('designs')
      .select(`
        *,
        themes (name),
        niches (name),
        sub_niches (name),
        design_mockups (storage_url)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDesigns(data as unknown as DesignWithRelations[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const filteredDesigns = designs.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.slogan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (design: DesignWithRelations) => {
    setEditingDesign(design);
    setIsPanelOpen(true);
  };

  const handleNewDesign = () => {
    setEditingDesign(null);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    setEditingDesign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">Bibliothèque</h1>
          <p className="text-void-text-muted text-sm">Gérez votre patrimoine philosophique.</p>
        </div>
        <button 
          onClick={handleNewDesign}
          className="flex items-center gap-2 px-5 py-2.5 bg-neon-accent text-void-bg font-bold rounded-xl hover:bg-cyan-400 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Nouvel Aphorisme</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-void-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="Rechercher un aphorisme..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-void-bg border border-void-border rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-void-text-muted/50 focus:border-neon-accent outline-none transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-neon-accent" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDesigns.map((design) => (
            <DesignCard 
              key={design.id} 
              design={design} 
              onClick={() => handleCardClick(design)}
            />
          ))}
          
          {filteredDesigns.length === 0 && (
             <div className="col-span-full py-16 text-center text-void-text-muted">
                Aucun design trouvé. Créez-en un nouveau !
             </div>
          )}
        </div>
      )}

      {/* Side Panel */}
      <CreateDesignPanel 
        isOpen={isPanelOpen} 
        onClose={handlePanelClose}
        onDesignCreated={fetchDesigns}
        editingDesign={editingDesign}
      />
    </div>
  );
}
