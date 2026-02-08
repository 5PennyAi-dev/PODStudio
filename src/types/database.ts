export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      themes: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      niches: {
        Row: {
          id: string
          theme_id: string
          name: string
        }
        Insert: {
          id?: string
          theme_id: string
          name: string
        }
        Update: {
          id?: string
          theme_id?: string
          name?: string
        }
      }
      sub_niches: {
        Row: {
          id: string
          niche_id: string
          name: string
        }
        Insert: {
          id?: string
          niche_id: string
          name: string
        }
        Update: {
          id?: string
          niche_id?: string
          name?: string
        }
      }
      designs: {
        Row: {
          id: string
          title: string
          slogan: string | null
          description: string | null
          theme_id: string | null
          niche_id: string | null
          sub_niche_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slogan?: string | null
          description?: string | null
          theme_id?: string | null
          niche_id?: string | null
          sub_niche_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slogan?: string | null
          description?: string | null
          theme_id?: string | null
          niche_id?: string | null
          sub_niche_id?: string | null
          created_at?: string
        }
      }
      design_mockups: {
        Row: {
          id: string
          design_id: string
          storage_url: string
          is_primary: boolean
        }
        Insert: {
          id?: string
          design_id: string
          storage_url: string
          is_primary?: boolean
        }
        Update: {
          id?: string
          design_id?: string
          storage_url?: string
          is_primary?: boolean
        }
      }
      seo_analyses: {
        Row: {
          id: string
          design_id: string | null
          generated_title: string | null
          generated_description: string | null
          total_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          design_id?: string | null
          generated_title?: string | null
          generated_description?: string | null
          total_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          design_id?: string | null
          generated_title?: string | null
          generated_description?: string | null
          total_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      seo_keywords: {
        Row: {
          id: string
          analysis_id: string | null
          keyword: string
          avg_volume: number | null
          competition: number | null
          opportunity_score: number | null
          volumes_history: number[] | null
          is_top_tag: boolean | null
          is_trending: boolean | null
          is_evergreen: boolean | null
          is_promising: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          analysis_id?: string | null
          keyword: string
          avg_volume?: number | null
          competition?: number | null
          opportunity_score?: number | null
          volumes_history?: number[] | null
          is_top_tag?: boolean | null
          is_trending?: boolean | null
          is_evergreen?: boolean | null
          is_promising?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          analysis_id?: string | null
          keyword?: string
          avg_volume?: number | null
          competition?: number | null
          opportunity_score?: number | null
          volumes_history?: number[] | null
          is_top_tag?: boolean | null
          is_trending?: boolean | null
          is_evergreen?: boolean | null
          is_promising?: boolean | null
          created_at?: string
        }
      }
    }
  }
}
