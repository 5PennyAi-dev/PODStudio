import { Construction } from 'lucide-react';

export default function Piloting() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
      <div className="p-4 bg-void-surface border border-void-border rounded-full text-neon-accent shadow-neon">
        <Construction size={48} />
      </div>
      <h2 className="text-3xl font-bold">Pilotage Dashboard</h2>
      <p className="text-void-text-muted max-w-md">
        This module is currently under construction. Check back in Phase 2.
      </p>
    </div>
  );
}
