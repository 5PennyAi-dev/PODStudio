import { ArrowUpRight, ArrowDownRight, Flame, Infinity, Leaf, Star } from 'lucide-react';
import type { SeoKeyword } from '@/types/seo';

interface SeoResultsTableProps {
  results: SeoKeyword[];
}

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  if (!data || data.length === 0) return null;
  
  const width = 100;
  const height = 30;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);

  const points = data.map((val, i) => {
    const x = i * step;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default function SeoResultsTable({ results }: SeoResultsTableProps) {
  if (!results || results.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto bg-void-surface border border-void-border rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-void-border text-void-text-muted text-xs uppercase tracking-wider">
            <th className="p-4 font-normal">Mots-clés</th>
            <th className="p-4 font-normal text-right">Volume</th>
            <th className="p-4 font-normal text-right">Compétition</th>
            <th className="p-4 font-normal text-right">Score</th>
            <th className="p-4 font-normal text-center">Tendance</th>
            <th className="p-4 font-normal text-center">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-void-border">
          {results.map((item, index) => {
            // Calculate trend percentage (last vs first of history)
            const first = item.volumes_history[0];
            const last = item.volumes_history[item.volumes_history.length - 1];
            const trendPercent = first > 0 ? ((last - first) / first) * 100 : 0;
            const isPositive = trendPercent >= 0;
            
            return (
              <tr key={index} className="hover:bg-void-bg/50 transition-colors group">
                <td className="p-4">
                  <span className="font-bold text-white group-hover:text-neon-accent transition-colors">
                    {item.keyword}
                  </span>
                </td>
                <td className="p-4 text-right font-mono text-void-text-main">
                  {item.avg_volume.toLocaleString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`font-mono ${item.competition > 0.7 ? 'text-red-400' : item.competition < 0.4 ? 'text-green-400' : 'text-yellow-400'}`}>
                      {item.competition}
                    </span>
                    <div className="w-16 h-1 bg-void-bg rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.competition > 0.7 ? 'bg-red-500' : item.competition < 0.4 ? 'bg-green-500' : 'bg-yellow-500'}`}
                        style={{ width: `${item.competition * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right font-bold text-white">
                    {item.opportunity_score}
                </td>
                <td className="p-4">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Sparkline 
                      data={item.volumes_history} 
                      color={isPositive ? '#4ade80' : '#f87171'} 
                    />
                    <div className={`flex items-center text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {Math.abs(Math.round(trendPercent))}%
                    </div>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {item.status.trending && (
                      <span className="text-orange-500" title="Trending: +20% growth">
                        <Flame size={18} fill="currentColor" fillOpacity={0.2} />
                      </span>
                    )}
                    {item.status.evergreen && (
                      <span className="text-green-500" title="Evergreen: Stable volume">
                        <Leaf size={18}  />
                      </span>
                    )}
                    {item.status.promising && (
                      <span className="text-yellow-400" title="Promising: Good volume + Low competition">
                        <Star size={18} fill="currentColor" fillOpacity={0.2} />
                      </span>
                    )}
                    {!item.status.trending && !item.status.evergreen && !item.status.promising && (
                        <span className="text-void-text-muted text-xs">-</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
