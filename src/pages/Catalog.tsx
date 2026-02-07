import { useState, useEffect } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { DesignCard } from '@/components/DesignCard';
import { CreateDesignPanel } from '@/components/forms/CreateDesignPanel';

type DesignWithRelations = Database['public']['Tables']['designs']['Row'] & {
  themes: { name: string } | null;
  niches: { name: string } | null;
  design_mockups: { storage_url: string }[] | null;
};

export default function Catalog() {
  const [designs, setDesigns] = useState<DesignWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDesigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('designs')
      .select(`
        *,
        themes (name),
        niches (name),
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
    d.slogan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-serif text-white tracking-tight">Bibliothèque</h1>
          <p className="text-void-text-muted mt-1">Gérez votre patrimoine philosophique.</p>
        </div>
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-neon-accent text-void-bg font-bold rounded-xl shadow-neon hover:bg-cyan-400 hover:scale-105 transition-all duration-200"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Nouvel Aphorisme</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-void-text-muted transition-colors group-focus-within:text-neon-accent" size={20} />
        <input 
          type="text" 
          placeholder="Rechercher un aphorisme..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-void-bg border border-void-border rounded-xl pl-12 pr-4 py-4 text-white placeholder-void-text-muted/50 focus:border-neon-accent focus:shadow-neon outline-none transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-neon-accent" size={40} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDesigns.map((design) => (
            <DesignCard 
              key={design.id} 
              design={design} 
              onEdit={(id) => console.log('Edit', id)} 
            />
          ))}
          
          {filteredDesigns.length === 0 && (
             <div className="col-span-full py-20 text-center text-void-text-muted">
                Aucun design trouvé. Créez-en un nouveau !
             </div>
          )}
        </div>
      )}

      {/* Side Panel */}
      <CreateDesignPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)}
        onDesignCreated={fetchDesigns}
      />
    </div>
  );
}
