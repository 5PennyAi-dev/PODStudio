import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Theme = Database['public']['Tables']['themes']['Row'];
type Niche = Database['public']['Tables']['niches']['Row'];
type SubNiche = Database['public']['Tables']['sub_niches']['Row'];
type Design = Database['public']['Tables']['designs']['Row'];

interface CreateDesignPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDesignCreated: () => void;
  editingDesign?: Design | null;
}

export function CreateDesignPanel({ isOpen, onClose, onDesignCreated, editingDesign }: CreateDesignPanelProps) {
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [themes, setThemes] = useState<Theme[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [subNiches, setSubNiches] = useState<SubNiche[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedNiche, setSelectedNiche] = useState<string>('');
  const [selectedSubNiche, setSelectedSubNiche] = useState<string>('');
  
  // Image State
  const [mockupFiles, setMockupFiles] = useState<File[]>([]);
  const [existingMockups, setExistingMockups] = useState<{ id: string, storage_url: string }[]>([]);

  const isEditMode = !!editingDesign;

  // Populate form when editing
  useEffect(() => {
    if (editingDesign) {
      setTitle(editingDesign.title || '');
      setSlogan(editingDesign.slogan || '');
      setDescription(editingDesign.description || '');
      setSelectedTheme(editingDesign.theme_id || '');
      setSelectedNiche(editingDesign.niche_id || '');
      setSelectedSubNiche(editingDesign.sub_niche_id || '');
      
      // Load existing mockups
      const loadMockups = async () => {
        const { data } = await supabase
          .from('design_mockups')
          .select('id, storage_url')
          .eq('design_id', editingDesign.id);
        if (data) setExistingMockups(data);
      };
      loadMockups();
    } else {
      // Reset form for new design
      setTitle('');
      setSlogan('');
      setDescription('');
      setSelectedTheme('');
      setSelectedNiche('');
      setSelectedSubNiche('');
      setMockupFiles([]);
      setExistingMockups([]);
    }
  }, [editingDesign, isOpen]);

  // ... (Themes, Niches, SubNiches fetch logic remains same) ...
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
    if (!editingDesign) {
      setSelectedNiche('');
      setSelectedSubNiche('');
    }
    fetchNiches();
  }, [selectedTheme, editingDesign]);

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
    if (!editingDesign) {
      setSelectedSubNiche('');
    }
    fetchSubNiches();
  }, [selectedNiche, editingDesign]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMockupFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removePendingFile = (index: number) => {
    setMockupFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title) return;
    setLoading(true);

    try {
      let designId = editingDesign?.id;

      if (isEditMode && editingDesign) {
        // UPDATE existing design
        const { error } = await supabase
          .from('designs')
          .update({
            title,
            slogan,
            description,
            theme_id: selectedTheme || null,
            niche_id: selectedNiche || null,
            sub_niche_id: selectedSubNiche || null,
          })
          .eq('id', editingDesign.id);

        if (error) throw error;
      } else {
        // INSERT new design
        const { data: design, error: designError } = await supabase
          .from('designs')
          .insert({
            title,
            slogan,
            description,
            theme_id: selectedTheme || null,
            niche_id: selectedNiche || null,
            sub_niche_id: selectedSubNiche || null,
          })
          .select()
          .single();

        if (designError || !design) throw designError;
        designId = design.id;
      }

      // Upload ALL pending files
      if (designId && mockupFiles.length > 0) {
        for (const file of mockupFiles) {
          const timestamp = Date.now();
          const fileExt = file.name.split('.').pop();
          const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9]/g, '')}.${fileExt}`;
          const filePath = `${designId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('mockups')
            .upload(filePath, file);

          if (uploadError) {
             console.error('Upload error for file:', file.name, uploadError);
             continue; 
          }

          const { data: { publicUrl } } = supabase.storage
            .from('mockups')
            .getPublicUrl(filePath);

          await supabase.from('design_mockups').insert({
            design_id: designId,
            storage_url: publicUrl,
            is_primary: false, // You might want logic to set primary if none exists
          });
        }
      }

      onDesignCreated();
      onClose();
    } catch (error) {
      console.error('Error saving design:', error);
      alert('Erreur lors de la sauvegarde. Vérifiez la console.');
    } finally {
      setLoading(false);
    }
  };

  const [mockupToDelete, setMockupToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setMockupToDelete(id);
  };

  const confirmDeleteMockup = async () => {
    if (!mockupToDelete) return;
    
    const id = mockupToDelete;
    const mockup = existingMockups.find(m => m.id === id);
    
    // Optimistic UI update
    setExistingMockups(prev => prev.filter(m => m.id !== id));
    setMockupToDelete(null);

    try {
      // 1. Delete from DB
      const { error } = await supabase
        .from('design_mockups')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 2. Delete from Storage
      if (mockup) {
        // Extract path from public URL
        // URL format: .../storage/v1/object/public/mockups/FOLDER/FILE
        const pathParts = mockup.storage_url.split('/mockups/');
        if (pathParts.length > 1) {
          const path = pathParts[1];
          await supabase.storage.from('mockups').remove([path]);
        }
      }

    } catch (error) {
      console.error('Error deleting mockup:', error);
      alert('Erreur lors de la suppression.');
      // Revert optimistic update (simplified: reload mockups)
      if (editingDesign) {
         const { data } = await supabase
          .from('design_mockups')
          .select('id, storage_url')
          .eq('design_id', editingDesign.id);
        if (data) setExistingMockups(data);
      }
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
            className="fixed right-0 top-0 bottom-0 h-full w-[480px] bg-void-surface border-l border-void-border shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-void-border flex items-center justify-between bg-void-surface/50 backdrop-blur">
              <h2 className="text-lg font-bold font-serif text-white">
                {isEditMode ? 'Modifier le Design' : 'Nouveau Design'}
              </h2>
              <button onClick={onClose} className="text-void-text-muted hover:text-white transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-void-border scrollbar-track-transparent">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-void-text-muted uppercase">Titre *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: L'obstacle est le chemin..."
                  className="w-full bg-void-bg text-white border border-void-border rounded-lg px-3 py-2.5 text-sm placeholder-void-text-muted/50 focus:border-neon-accent outline-none transition-all"
                />
              </div>

              {/* Slogan */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-void-text-muted uppercase">Slogan</label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="Ex: DOG MOM, BEST DAD EVER..."
                  className="w-full bg-void-bg text-white border border-void-border rounded-lg px-3 py-2.5 text-sm placeholder-void-text-muted/50 focus:border-neon-accent outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-void-text-muted uppercase">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez le concept..."
                  rows={3}
                  className="w-full bg-void-bg text-white border border-void-border rounded-lg px-3 py-2.5 text-sm placeholder-void-text-muted/50 focus:border-neon-accent outline-none transition-all resize-none"
                />
              </div>

               {/* AI Action */}
               <div className="flex justify-end">
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-accent/10 border border-neon-accent/30 rounded-full text-neon-accent text-xs font-medium hover:bg-neon-accent hover:text-black transition-all">
                     <Wand2 size={12} />
                     Analyse IA
                  </button>
               </div>

              {/* Categorisation */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-void-text-muted uppercase">Catégorisation</label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Theme */}
                  <div className="space-y-1">
                    <label className="text-xs text-void-text-muted/70">Thème</label>
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className="w-full bg-void-bg text-white border border-void-border rounded-lg px-3 py-2 text-sm focus:border-neon-accent outline-none"
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
                      className="w-full bg-void-bg text-white border border-void-border rounded-lg px-3 py-2 text-sm focus:border-neon-accent outline-none disabled:opacity-50"
                    >
                      <option value="">Sélectionner...</option>
                      {niches.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                    </select>
                  </div>

                  {/* Sub-Niche */}
                  <div className="space-y-1 col-span-2">
                    <label className="text-xs text-void-text-muted/70">Sous-Niche</label>
                    <select
                      value={selectedSubNiche}
                      onChange={(e) => setSelectedSubNiche(e.target.value)}
                      disabled={!selectedNiche}
                      className="w-full bg-void-bg text-white border border-void-border rounded-lg px-3 py-2 text-sm focus:border-neon-accent outline-none disabled:opacity-50"
                    >
                      <option value="">Sélectionner...</option>
                      {subNiches.map(sn => <option key={sn.id} value={sn.id}>{sn.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Mockup Upload & Gallery */}
              <div className="space-y-3">
                <label className="text-xs font-mono text-void-text-muted uppercase">Mockups</label>
                
                {/* Upload Area */}
                <div className="border border-dashed border-void-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-neon-accent/50 transition-all cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple // Enable multiple files
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={18} className="text-void-text-muted" />
                  <p className="text-xs text-void-text-muted text-center">
                    Glisser-déposer ou cliquer pour ajouter<br/>
                    (Plusieurs images autorisées)
                  </p>
                </div>

                {/* Existing Mockups Grid */}
                {existingMockups.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {existingMockups.map((mockup) => (
                      <div key={mockup.id} className="relative aspect-square rounded-lg overflow-hidden border border-void-border group">
                        <img src={mockup.storage_url} alt="Mockup" className="w-full h-full object-cover" />
                        {/* Remove Button */}
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(mockup.id); }}
                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                         >
                            <X size={12} />
                         </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pending New Files List */}
                {mockupFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                     {mockupFiles.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-neon-accent/50 group">
                           <img 
                              src={URL.createObjectURL(file)} 
                              alt="New Upload" 
                              className="w-full h-full object-cover opacity-80" 
                              onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                           />
                           <button 
                              onClick={() => removePendingFile(i)}
                              className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-500 transition-colors"
                           >
                              <X size={12} />
                           </button>
                        </div>
                     ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-5 border-t border-void-border bg-void-surface flex justify-between items-center">
              <button 
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-void-border text-void-text-muted hover:text-white hover:bg-void-border/20 transition-all text-sm font-medium"
              >
                Annuler
              </button>
              <button 
                onClick={handleSubmit}
                disabled={loading || !title}
                className="px-6 py-2.5 rounded-lg bg-neon-accent text-void-bg font-bold text-sm hover:bg-cyan-400 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (isEditMode ? 'Mettre à jour' : 'Enregistrer')}
              </button>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
              {mockupToDelete && (
                <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-5"
                >
                   <motion.div 
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="bg-void-surface border border-void-border rounded-xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
                   >
                      <h3 className="text-white font-bold text-lg">Confirmer la suppression ?</h3>
                      <p className="text-void-text-muted text-sm">
                         Cette action est irréversible. L'image sera supprimée définitivement.
                      </p>
                      <div className="flex justify-end gap-3 pt-2">
                         <button 
                            onClick={() => setMockupToDelete(null)}
                            className="px-4 py-2 rounded-lg border border-void-border text-white text-sm hover:bg-void-border/20"
                         >
                            Annuler
                         </button>
                         <button 
                            onClick={confirmDeleteMockup}
                            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/50 text-sm hover:bg-red-500 hover:text-white transition-all"
                         >
                            Supprimer
                         </button>
                      </div>
                   </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
