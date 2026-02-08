export interface SeoKeyword {
  keyword: string;
  avg_volume: number;
  competition: number;
  opportunity_score: number;
  volumes_history: number[];
  status: {
    trending: boolean;
    evergreen: boolean;
    promising: boolean;
  };
}
