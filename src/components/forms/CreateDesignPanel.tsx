import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Theme = Database['public']['Tables']['themes']['Row'];
type Niche = Database['public']['Tables']['niches']['Row'];
type SubNiche = Database['public']['Tables']['sub_niches']['Row'];

interface CreateDesignPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDesignCreated: () => void;
}

export function CreateDesignPanel({ isOpen, onClose, onDesignCreated }: CreateDesignPanelProps) {
  const [loading, setLoading] = useState(false);
  // const [uploading, setUploading] = useState(false);
  
  // Data State
  const [themes, setThemes] = useState<Theme[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [subNiches, setSubNiches] = useState<SubNiche[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [slogan, setSlogan] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedSubNiche, setSelectedSubNiche] = useState<string>('');
  const [mockupFile, setMockupFile] = useState<File | null>(null);

  // Fetch Themes on mount
  useEffect(() => {
    async function fetchThemes() {
      const { data } = await supabase.from('themes').select('*').order('name');
      if (data) setThemes(data);
    }
    fetchThemes();
  }, []);

  // Cascading Logic: Fetch Niches when Theme changes
  useEffect(() => {
    async function fetchNiches() {
      if (!selectedTheme) {
        setNiches([]);
        return;
      }
      const { data } = await supabase
        .from('niches')
        .select('*')
        .eq('theme_id', selectedTheme)
        .order('name');
      if (data) setNiches(data);
    }
    setSelectedNiche('');
    setSelectedSubNiche('');
    fetchNiches();
  }, [selectedTheme]);

  // Cascading Logic: Fetch Sub-Niches when Niche changes
  useEffect(() => {
    async function fetchSubNiches() {
      if (!selectedNiche) {
        setSubNiches([]);
        return;
      }
      const { data } = await supabase
        .from('sub_niches')
        .select('*')
        .eq('niche_id', selectedNiche)
        .order('name');
      if (data) setSubNiches(data);
    }
    setSelectedSubNiche('');
    fetchSubNiches();
  }, [selectedNiche]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMockupFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title || !selectedTheme) return; // Basic validation
    setLoading(true);

    try {
      // 1. Insert Design
      const { data: design, error: designError } = await supabase
        .from('designs')
        .insert({
          title,
          slogan,
          theme_id: selectedTheme,
          niche_id: selectedNiche || null,
          sub_niche_id: selectedSubNiche || null,
        })
        .select()
        .single();

      if (designError || !design) throw designError;

        if (mockupFile) {
          // setUploading(true);
          const fileExt = mockupFile.name.split('.').pop();
          const filePath = `${design.id}/primary.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('mockups')
          .upload(filePath, mockupFile);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('mockups')
          .getPublicUrl(filePath);

        // 3. Insert Mockup Record
        await supabase.from('design_mockups').insert({
          design_id: design.id,
          storage_url: publicUrl,
          is_primary: true,
        });
      }

      onDesignCreated();
      onClose();
      // Reset Form
      setTitle('');
      setSlogan('');
      setMockupFile(null);
    } catch (error) {
      console.error('Error creating design:', error);
      alert('Failed to create design. Check console.');
    } finally {
      setLoading(false);
      // setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[500px] bg-void-surface border-l border-void-border shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-void-border flex items-center justify-between bg-void-surface/50 backdrop-blur">
              <h2 className="text-xl font-bold font-serif text-white">Nouvel Design</h2>
              <button onClick={onClose} className="text-void-text-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-mono text-void-text-muted">Titre (Requis)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: L'obstacle est le chemin..."
                  className="w-full bg-void-bg text-white border border-void-border rounded-xl px-4 py-3 placeholder-void-text-muted/50 focus:border-neon-accent focus:ring-1 focus:ring-neon-accent outline-none transition-all"
                />
              </div>

               {/* AI Action (Mockup Style) */}
               <div className="flex justify-end">
                  <button className="flex items-center gap-2 px-3 py-1 bg-neon-accent/10 border border-neon-accent/30 rounded-full text-neon-accent text-xs font-bold uppercase tracking-wider hover:bg-neon-accent hover:text-black transition-all">
                     <Wand2 size={12} />
                     Analyse IA
                  </button>
               </div>

              {/* Slogan */}
              <div className="space-y-2 -mt-2">
                <div className="relative">
                   <textarea
                     value={slogan}
                     onChange={(e) => setSlogan(e.target.value)}
                     placeholder="Écrivez votre slogan ou pensée philosophique ici..."
                     rows={4}
                     className="w-full bg-void-bg text-white border border-neon-accent/50 rounded-xl px-4 py-3 placeholder-void-text-muted/30 focus:border-neon-accent focus:shadow-neon outline-none transition-all resize-none font-serif text-lg leading-relaxed"
                   />
                   {/* Glow effect container */}
                   <div className="absolute inset-0 rounded-xl pointer-events-none border border-neon-accent/20" />
                </div>
              </div>

              {/* Tags/Taxonomy */}
              <div className="space-y-2">
                 <label className="text-sm font-mono text-void-text-muted">Categorisation</label>
                 <div className="grid grid-cols-2 gap-4">
                    {/* Theme */}
                    <div className="space-y-1">
                       <label className="text-xs text-void-text-muted/70">Thème</label>
                       <select
                         value={selectedTheme}
                         onChange={(e) => setSelectedTheme(e.target.value)}
                         className="w-full bg-void-bg text-white border border-void-border rounded-xl px-3 py-2 text-sm focus:border-neon-accent outline-none"
                       >
                         <option value="">Sélectionner...</option>
                         {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                    </div>
                    
                    {/* Niche */}
                    <div className="space-y-1">
                       <label className="text-xs text-void-text-muted/70">Niche</label>
                       <select
                         value={selectedNiche}
                         onChange={(e) => setSelectedNiche(e.target.value)}
                         disabled={!selectedTheme}
                         className="w-full bg-void-bg text-white border border-void-border rounded-xl px-3 py-2 text-sm focus:border-neon-accent outline-none disabled:opacity-50"
                       >
                         <option value="">Sélectionner...</option>
                         {niches.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                       </select>
                    </div>

                    {/* Sub-Niche (Full Width if needed, or 3rd col) */}
                    <div className="space-y-1 col-span-2">
                       <label className="text-xs text-void-text-muted/70">Sous-Niche</label>
                       <select
                         value={selectedSubNiche}
                         onChange={(e) => setSelectedSubNiche(e.target.value)}
                         disabled={!selectedNiche}
                         className="w-full bg-void-bg text-white border border-void-border rounded-xl px-3 py-2 text-sm focus:border-neon-accent outline-none disabled:opacity-50"
                       >
                         <option value="">Sélectionner...</option>
                         {subNiches.map(sn => <option key={sn.id} value={sn.id}>{sn.name}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              {/* Mockup Upload */}
              <div className="space-y-2">
                <label className="text-sm font-mono text-void-text-muted">Mockup (Image)</label>
                <div className="border-2 border-dashed border-void-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-neon-accent/50 hover:bg-void-bg/50 transition-all cursor-pointer relative">
                   <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                   />
                   <div className="p-3 bg-void-surface rounded-full border border-void-border">
                      <Upload size={20} className="text-void-text-muted" />
                   </div>
                   <p className="text-sm text-void-text-muted">
                      {mockupFile ? mockupFile.name : "Glisser-déposer ou cliquer"}
                   </p>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-void-border bg-void-surface flex justify-between items-center">
              <button 
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-void-border text-void-text-muted hover:text-white hover:bg-void-border/20 transition-all font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading || !title || !selectedTheme}
                className="px-8 py-3 rounded-xl bg-neon-accent text-black font-bold hover:shadow-neon transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Enregistrer'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
