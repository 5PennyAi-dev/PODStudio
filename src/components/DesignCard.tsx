import { motion } from 'framer-motion';
import type { Database } from '@/types/database';

type Design = Database['public']['Tables']['designs']['Row'] & {
  themes: { name: string } | null;
  niches: { name: string } | null;
  sub_niches: { name: string } | null;
  design_mockups: { storage_url: string }[] | null;
};

interface DesignCardProps {
  design: Design;
  onClick?: () => void;
}

export function DesignCard({ design, onClick }: DesignCardProps) {
  const primaryMockup = design.design_mockups?.[0]?.storage_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative bg-void-surface border border-void-border rounded-xl overflow-hidden hover:border-neon-accent/50 transition-all duration-200 cursor-pointer"
    >
      {/* Accent Border (Left) */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-accent" />

      <div className="p-4 pl-5 flex flex-col h-full relative">
        <div className="flex-1 flex flex-col gap-3">
          {/* Title */}
          <h3 className="text-xs font-mono text-neon-accent uppercase tracking-wider truncate">
            | {design.title}
          </h3>

          {/* Slogan/Description */}
          <div className="min-h-[2.5rem]">
            {design.slogan ? (
              <p className="text-white text-sm leading-relaxed line-clamp-2">
                "{design.slogan}"
              </p>
            ) : design.description ? (
              <p className="text-white text-sm leading-relaxed line-clamp-2">
                "{design.description}"
              </p>
            ) : (
               <p className="text-void-text-muted text-xs italic">Sans description</p>
            )}
          </div>

          {/* Metadata: Theme, Niche, Sub-Niche */}
          <div className="flex flex-col gap-1 text-xs mt-auto pb-3 border-b border-void-border/50">
            {design.themes && (
              <div className="flex items-center gap-2">
                <span className="text-void-text-muted font-mono">THÈME:</span>
                <span className="text-white truncate">{design.themes.name}</span>
              </div>
            )}
            {design.niches && (
              <div className="flex items-center gap-2">
                <span className="text-void-text-muted font-mono">NICHE:</span>
                <span className="text-white truncate">{design.niches.name}</span>
              </div>
            )}
            {(design as unknown as { sub_niches: { name: string } | null }).sub_niches && (
              <div className="flex items-center gap-2">
                <span className="text-void-text-muted font-mono">SOUS-NICHE:</span>
                <span className="text-neon-accent truncate">
                  {(design as unknown as { sub_niches: { name: string } }).sub_niches.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Thumbnails Grid (Bottom) */}
        {design.design_mockups && design.design_mockups.length > 0 ? (
          <div className="w-full grid grid-cols-3 gap-1 mt-3">
             {design.design_mockups.slice(0, 6).map((mockup, index) => (
               <div key={index} className="aspect-square rounded overflow-hidden bg-void-bg border border-void-border relative group/img">
                 <img 
                   src={mockup.storage_url} 
                   alt={`${design.title} ${index + 1}`} 
                   className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" 
                 />
               </div>
             ))}
             {/* Fill empty spots if less than 3 to keep layout stable? No need if flex/grid handles it. */}
          </div>
        ) : (
           <div className="mt-3 h-16 flex items-center justify-center border border-dashed border-void-border rounded bg-void-bg/50">
              <span className="text-[10px] text-void-text-muted uppercase">Aucune image</span>
           </div>
        )}
      </div>
    </motion.div>
  );
}
