import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PenTool, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { name: 'Bibliothèque', path: '/', icon: LayoutDashboard },
    { name: 'Pilotage', path: '/piloting', icon: PenTool },
  ];

  return (
    <div className="min-h-screen bg-void-bg text-void-text-main font-ui flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-void-border bg-void-surface flex flex-col fixed h-full z-10 transition-all duration-300">
        <div className="p-6 border-b border-void-border">
          <h1 className="text-2xl font-serif font-bold tracking-tighter text-white">
            POD<span className="text-neon-accent">Studio</span>
          </h1>
          <p className="text-xs text-void-text-muted mt-1 uppercase tracking-widest opacity-70">
            Dourliac Edition
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-void-surface text-neon-accent shadow-neon border border-void-border/50" 
                    : "text-void-text-muted hover:text-white hover:bg-void-border/10"
                )}
              >
                {isActive && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-accent shadow-[0_0_10px_#06B6D4]" />
                )}
                <Icon size={20} className={cn(isActive ? "text-neon-accent" : "text-void-text-muted group-hover:text-white")} />
                <span className="font-medium tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-void-border">
          <Link 
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 text-void-text-muted hover:text-white transition-colors rounded-xl hover:bg-void-border/10"
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Shell */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
        {/* Background Grid Decoration (Subtle) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#15181E_1px,transparent_1px),linear-gradient(to_bottom,#15181E_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.2] pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-0 p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
