import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { ArrowLeft, Loader2, Send, CheckCircle, AlertCircle, Save, PenTool } from 'lucide-react';
import SeoResultsTable from '@/components/SeoResultsTable';
import type { SeoKeyword } from '@/types/seo';

type DesignWithRelations = Database['public']['Tables']['designs']['Row'] & {
  themes: { name: string } | null;
  niches: { name: string } | null;
  sub_niches: { name: string } | null;
  design_mockups: { storage_url: string }[] | null;
};

export default function SeoAnalysis() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [design, setDesign] = useState<DesignWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [seoResults, setSeoResults] = useState<SeoKeyword[] | null>(null);
  
  /* New Writing State */
  const [writing, setWriting] = useState(false);
  const [writeSuccess, setWriteSuccess] = useState(false);

  /* Etsy Listing Description State */
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [listingSaving, setListingSaving] = useState(false);
  const [listingSaveSuccess, setListingSaveSuccess] = useState(false);

  // Saving states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDesign(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchDesign = async (designId: string) => {
    setLoading(true);
    
    // 1. Fetch Design
    const { data: designData, error: designError } = await supabase
      .from('designs')
      .select(`
        *,
        themes (name),
        niches (name),
        sub_niches (name),
        design_mockups (storage_url)
      `)
      .eq('id', designId)
      .single();

    if (!designError && designData) {
      setDesign(designData as unknown as DesignWithRelations);
      
      // 2. Fetch Existing SEO Analysis
      await fetchSeoData(designId);
    }
    
    setLoading(false);
  };

  const fetchSeoData = async (designId: string) => {
    const { data, error } = await supabase
      .from('seo_analyses')
      .select(`
        id,
        generated_title,
        generated_description,
        seo_keywords (*)
      `)
      .eq('design_id', designId)
      .maybeSingle();

    const analysis = data as any;

    if (analysis) {
        if (analysis.generated_title) setGeneratedTitle(analysis.generated_title);
        if (analysis.generated_description) setGeneratedDescription(analysis.generated_description);

        if (analysis.seo_keywords && analysis.seo_keywords.length > 0) {
            // Massage data to match SeoKeyword interface
            const keywords: SeoKeyword[] = analysis.seo_keywords.map((k: any) => ({
                keyword: k.keyword,
                avg_volume: k.avg_volume || 0,
                competition: k.competition || 0,
                opportunity_score: k.opportunity_score || 0,
                volumes_history: k.volumes_history || [],
                status: {
                trending: k.is_trending || false,
                evergreen: k.is_evergreen || false,
                promising: k.is_promising || false
                }
            }));

            setSeoResults(keywords);
            setStatus('success');
            setSaveSuccess(true); // Indicate data is already saved
        }
    }
  };

  const handleRunSeo = async () => {
    if (!design) return;

    setAnalyzing(true);
    setStatus('idle');
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const payload = {
        action: 'AnalyseSEO',
        product_type: "T-shirt",
        slogan: design.slogan,
        description: design.description,
        theme: design.themes?.name,
        niche: design.niches?.name,
        sub_niche: design.sub_niches?.name,
        mockups: design.design_mockups?.map(m => m.storage_url) || []
      };

      const response = await fetch('https://n8n.srv840060.hstgr.cloud/webhook-test/edfcbec8-5ce2-4367-93bf-5a26c686996f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();

        
        // Handle potential wrapping of data (e.g. if n8n returns { data: [...] } or just [...])
        const results = Array.isArray(data) ? data : (data.data || data.json || []);
        
        setSeoResults(results as SeoKeyword[]);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(`Erreur serveur: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.error('N8N Error Response:', text);
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : "Erreur inconnue");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleWriteSeo = async () => {
    if (!design || !seoResults) {
      console.error("Missing design or seoResults", { design, seoResults });
      return;
    }

    setWriting(true);
    setWriteSuccess(false);

    try {
      const payload = {
        action: 'RédactionSEO',
        product_type: "T-shirt",
        slogan: design.slogan,
        description: design.description,
        theme: design.themes?.name,
        niche: design.niches?.name,
        sub_niche: design.sub_niches?.name,
        keywords: seoResults,
        mockups: design.design_mockups?.map(m => m.storage_url) || []
      };

      console.log("Sending Write SEO payload:", payload);

      // Assuming same webhook URL for now
      const response = await fetch('https://n8n.srv840060.hstgr.cloud/webhook-test/edfcbec8-5ce2-4367-93bf-5a26c686996f', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await response.text();

      if (response.ok) {
        setWriteSuccess(true);
        // Parse the response
        try {
            let data = JSON.parse(responseText);
            // Handle n8n response formats: 
            // 1. [{ output: { title: "..." } }] (Old)
            // 2. [{ title: "..." }] (New)
            // 3. { output: ... } or { title: ... } (Direct object)
            
            if (Array.isArray(data) && data.length > 0) {
              data = data[0];
            }

            const output = data.output || data;
            
            if (output) {
                if (output.title) setGeneratedTitle(output.title);
                if (output.description) setGeneratedDescription(output.description);
            }
        } catch (e) {
            console.error("Error parsing Write SEO response:", e);
        }
      } else {
        console.error('Error triggering Write SEO webhook:', responseText);
      }
    } catch (error) {
      console.error('Error triggering Write SEO:', error);
    } finally {
      setWriting(false);
    }
  };

  const handleSaveSeo = async () => {
    if (!design || !seoResults) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // 1. Upsert Analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('seo_analyses')
        .upsert({
          design_id: design.id,
          generated_title: generatedTitle || null, 
          generated_description: generatedDescription || null,
          total_score: 0,
        }, { onConflict: 'design_id' })
        .select()
        .single();

      if (analysisError) throw analysisError;
      
      const analysisId = analysisData.id;

      // 2. Prepare Keywords data
      const keywordsData = seoResults.map(item => ({
        analysis_id: analysisId,
        keyword: item.keyword,
        avg_volume: item.avg_volume,
        competition: item.competition,
        opportunity_score: item.opportunity_score,
        volumes_history: item.volumes_history,
        is_trending: item.status?.trending || false,
        is_evergreen: item.status?.evergreen || false,
        is_promising: item.status?.promising || false
      }));

      // 3. Delete existing keywords (replace strategy)
      await supabase.from('seo_keywords').delete().eq('analysis_id', analysisId);

      // 4. Insert Keywords
      const { error: keywordsError } = await supabase
        .from('seo_keywords') // Ensure table name matches DB
        .insert(keywordsData);

      if (keywordsError) throw keywordsError;

      setSaveSuccess(true);
    } catch (err: any) {
      console.error("Error saving SEO:", err);
      setSaveError(err.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveListing = async () => {
      if (!design) return;
      setListingSaving(true);
      setListingSaveSuccess(false);

      try {
        const { error } = await supabase
            .from('seo_analyses')
            .update({
                generated_title: generatedTitle,
                generated_description: generatedDescription
            })
            .eq('design_id', design.id);

        if (error) throw error;
        setListingSaveSuccess(true);
        setTimeout(() => setListingSaveSuccess(false), 3000);
      } catch (err) {
          console.error("Error saving listing:", err);
      } finally {
          setListingSaving(false);
      }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-neon-accent" size={32} />
      </div>
    );
  }

  if (!design) {
    return (
      <div className="text-center py-16">
        <p className="text-void-text-muted">
          {id ? "Design introuvable." : "Veuillez sélectionner un design dans la bibliothèque."}
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-neon-accent hover:underline"
        >
          Retour à la bibliothèque
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-void-surface rounded-full transition-colors text-void-text-muted hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold font-serif text-white tracking-tight">Analyse SEO</h1>
          <p className="text-void-text-muted text-sm">Optimisation pour {design.title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Design Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Design Info Card */}
          <section className="bg-void-surface border border-void-border rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-neon-accent"></div>
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-neon-accent">#</span> Détails du Design
                </h2>
                
                <button
                  onClick={handleRunSeo}
                  disabled={analyzing || status === 'success'}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                    ${status === 'success' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default' 
                      : 'bg-neon-accent text-void-bg hover:bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                    }
                    ${analyzing ? 'opacity-70 cursor-wait' : ''}
                  `}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Analyse...</span>
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Lancée !</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Lancer SEO</span>
                    </>
                  )}
                </button>
             </div>
             
             <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-void-text-muted uppercase">Titre</label>
                  <p className="text-white font-medium text-lg">{design.title}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-mono text-void-text-muted uppercase">Thème</label>
                    <p className="text-white">{design.themes?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-void-text-muted uppercase">Niche</label>
                    <p className="text-white">{design.niches?.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-void-text-muted uppercase">Sous-niche</label>
                    <p className="text-neon-accent">{design.sub_niches?.name || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-void-text-muted uppercase">Slogan</label>
                  {design.slogan ? (
                    <blockquote className="border-l-2 border-void-border pl-3 italic text-void-text-main">
                      "{design.slogan}"
                    </blockquote>
                  ) : (
                    <p className="text-void-text-muted italic">Aucun slogan</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-mono text-void-text-muted uppercase">Description</label>
                  <p className="text-void-text-main text-sm leading-relaxed whitespace-pre-wrap">
                    {design.description || 'Aucune description'}
                  </p>
                </div>
             </div>

             {status === 'error' && (
               <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-left w-full animate-fadeIn">
                 <p className="text-red-400 text-sm flex items-center gap-2 font-bold">
                   <AlertCircle size={14} />
                   Erreur lors du lancement
                 </p>
                 {errorMessage && (
                   <p className="text-red-300/80 text-xs mt-1 font-mono break-all">
                     {errorMessage}
                   </p>
                 )}
                 <p className="text-void-text-muted text-xs mt-2 italic">
                   Vérifiez que le workflow n8n est actif (Production) ou utilisez l'URL de test.
                 </p>
               </div>
             )}
           </section>

           {/* SEO Results Section */}
            {status === 'success' && seoResults && (
                <section className="bg-void-surface border border-void-border rounded-xl p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-neon-accent">#</span> Résultats de l'analyse
                    </h2>
                    
                    <div className="flex items-center gap-4">
                    {saveSuccess && (
                        <span className="text-green-400 text-sm flex items-center gap-1 animate-fadeIn">
                        <CheckCircle size={16} /> Sauvegardé
                        </span>
                    )}
                    {saveError && (
                        <span className="text-red-400 text-sm flex items-center gap-1 animate-fadeIn">
                        <AlertCircle size={16} /> {saveError}
                        </span>
                    )}
                    
                    <button
                        onClick={handleWriteSeo}
                        disabled={writing || writeSuccess}
                        className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                        ${writeSuccess
                            ? 'bg-void-bg text-void-text-muted border border-void-border cursor-default'
                            : 'bg-void-bg border border-neon-accent text-neon-accent hover:bg-neon-accent/10'
                        }
                        ${writing ? 'opacity-70 cursor-wait' : ''}
                        `}
                    >
                        {writing ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Rédaction...</span>
                        </>
                        ) : writeSuccess ? (
                        <>
                            <CheckCircle size={16} />
                            <span>Envoyé</span>
                        </>
                        ) : (
                        <>
                            <PenTool size={16} />
                            <span>Rédiger</span>
                        </>
                        )}
                    </button>

                    <button
                        onClick={handleSaveSeo}
                        disabled={saving || saveSuccess}
                        className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all
                        ${saveSuccess
                            ? 'bg-void-bg text-void-text-muted border border-void-border cursor-default'
                            : 'bg-void-bg border border-neon-accent text-neon-accent hover:bg-neon-accent/10'
                        }
                        ${saving ? 'opacity-70 cursor-wait' : ''}
                        `}
                    >
                        {saving ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            <span>Sauvegarde...</span>
                        </>
                        ) : saveSuccess ? (
                        <>
                            <CheckCircle size={16} />
                            <span>Enregistré</span>
                        </>
                        ) : (
                        <>
                            <Save size={16} />
                            <span>Sauvegarder SEO</span>
                        </>
                        )}
                    </button>
                    </div>
                </div>
                
                <SeoResultsTable results={seoResults} />
                </section>
            )}
        </div>

        {/* Right Column: Mockups & Listing */}
        <div className="space-y-6">
          <section className="bg-void-surface border border-void-border rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider border-b border-void-border pb-2">
              Mockups
            </h3>
            
            {design.design_mockups && design.design_mockups.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {design.design_mockups.map((mockup, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-void-border bg-void-bg relative group">
                    <img 
                      src={mockup.storage_url} 
                      alt={`Mockup ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-void-border rounded-lg text-center">
                <p className="text-void-text-muted text-sm">Aucun mockup disponible</p>
              </div>
            )}
          </section>

          {/* New Etsy Listing Section */}
          <section className="bg-void-surface border border-void-border rounded-xl p-6 relative">
             <div className="flex items-center justify-between mb-4 border-b border-void-border pb-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Listing Etsy
                </h3>
               <button
                  onClick={handleSaveListing}
                  disabled={listingSaving || (!generatedTitle && !generatedDescription)}
                  className={`
                     p-2 rounded-lg transition-colors
                     ${listingSaveSuccess ? 'text-green-400' : 'text-void-text-muted hover:text-neon-accent hover:bg-void-bg'}
                  `}
                  title="Sauvegarder le listing"
               >
                 {listingSaving ? <Loader2 size={16} className="animate-spin" /> : 
                  listingSaveSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
               </button>
             </div>
             
             <div className="space-y-4">
                 <div>
                     <label className="text-xs font-mono text-void-text-muted uppercase block mb-1">Titre optimisé</label>
                     <textarea
                        value={generatedTitle}
                        onChange={(e) => setGeneratedTitle(e.target.value)}
                        placeholder="Le titre généré apparaîtra ici..."
                        className="w-full bg-void-bg border border-void-border rounded-lg p-3 text-sm text-white focus:border-neon-accent focus:ring-1 focus:ring-neon-accent outline-none min-h-[80px]"
                     />
                     <div className="text-right text-[10px] text-void-text-muted mt-1">
                        {generatedTitle.length} caractères
                     </div>
                 </div>

                 <div>
                     <label className="text-xs font-mono text-void-text-muted uppercase block mb-1">Description</label>
                     <textarea
                        value={generatedDescription}
                        onChange={(e) => setGeneratedDescription(e.target.value)}
                        placeholder="La description générée apparaîtra ici..."
                        className="w-full bg-void-bg border border-void-border rounded-lg p-3 text-sm text-white focus:border-neon-accent focus:ring-1 focus:ring-neon-accent outline-none min-h-[300px]"
                     />
                 </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
}
