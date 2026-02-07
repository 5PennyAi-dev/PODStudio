import { motion } from 'framer-motion';
import { Eye, Edit2, Hexagon } from 'lucide-react';
// import { cn } from '@/lib/utils'; // Unused
import type { Database } from '@/types/database';

type Design = Database['public']['Tables']['designs']['Row'] & {
  themes: { name: string } | null;
  niches: { name: string } | null;
  design_mockups: { storage_url: string }[] | null;
};

interface DesignCardProps {
  design: Design;
  onEdit?: (id: string) => void;
}

export function DesignCard({ design, onEdit }: DesignCardProps) {
  const primaryMockup = design.design_mockups?.[0]?.storage_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-void-surface border border-void-border rounded-xl overflow-hidden hover:border-neon-accent/50 transition-all duration-300 shadow-lg hover:shadow-neon"
    >
      {/* Accent Border (Left) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-accent to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold font-serif mb-1 text-white line-clamp-1 group-hover:text-neon-accent transition-colors">
              {design.title}
            </h3>
            {/* Tech Decoration */}
            <Hexagon size={12} className="text-void-text-muted/20 rotate-90" />
          </div>
          {design.slogan && (
            <p className="text-sm text-void-text-muted italic line-clamp-2">
              "{design.slogan}"
            </p>
          )}
        </div>

        {/* Thumbnail / Visual */}
        <div className="relative aspect-square rounded-lg bg-void-bg mb-4 overflow-hidden border border-void-border/50 group-hover:border-neon-accent/20 transition-colors">
          {primaryMockup ? (
            <img 
              src={primaryMockup} 
              alt={design.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-void-text-muted/30">
               <Hexagon size={40} strokeWidth={1} />
               <span className="text-xs mt-2 font-mono">NO VISUAL</span>
            </div>
          )}
          
          {/* Action Overlay (Glassmorphism) */}
          <div className="absolute inset-0 bg-void-bg/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
             <button 
                onClick={() => onEdit?.(design.id)}
                className="p-2 rounded-full bg-void-surface border border-void-border text-neon-accent hover:bg-neon-accent hover:text-black transition-all transform hover:scale-110"
                title="Edit Design"
             >
                <Edit2 size={18} />
             </button>
             <button 
                className="p-2 rounded-full bg-void-surface border border-void-border text-purple-400 hover:bg-purple-400 hover:text-black transition-all transform hover:scale-110"
                title="Quick View"
             >
                <Eye size={18} />
             </button>
          </div>
        </div>

        {/* Footer: Metadata Badges */}
        <div className="mt-auto pt-4 border-t border-void-border/50 flex flex-wrap gap-2 text-xs font-mono">
           {design.themes && (
             <span className="px-2 py-1 rounded bg-void-bg border border-void-border text-void-text-muted">
               THEME: {design.themes.name}
             </span>
           )}
           {design.niches && (
             <span className="px-2 py-1 rounded bg-void-bg border border-void-border text-neon-accent/80 border-neon-accent/20">
               NICHE: {design.niches.name}
             </span>
           )}
        </div>
      </div>
    </motion.div>
  );
}
