// Hand-written to match supabase/migrations/0001_init_schema.sql.
// Once the Supabase CLI is set up locally, prefer regenerating this file with:
//   supabase gen types typescript --project-id <ref> > types/database.ts

export type Role = 'admin' | 'allenatore' | 'preparatore' | 'dirigente' | 'tifoso';
export type ProfileStatus = 'pending' | 'approved';
export type Position = 'POR' | 'DIF' | 'CEN' | 'ATT';
export type AttendanceStatus = 'present' | 'absent' | 'planned_absence';
export type ThemePreference = 'light' | 'dark';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          cognome: string;
          username: string;
          email: string;
          telefono: string | null;
          role: Role | null;
          status: ProfileStatus;
          theme_preference: ThemePreference | null;
          player_size_preference: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          id: string;
          nome: string;
          cognome: string;
          username: string;
          email: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
        Relationships: [];
      };
      players: {
        Row: {
          id: number;
          nome: string;
          cognome: string;
          birthdate: string | null;
          pos: Position;
          goals: number;
          assists: number;
          minutes: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['players']['Row']> & {
          nome: string;
          cognome: string;
          pos: Position;
        };
        Update: Partial<Database['public']['Tables']['players']['Row']>;
        Relationships: [];
      };
      matches: {
        Row: {
          id: number;
          match_date: string;
          match_time: string | null;
          opponent: string;
          is_home: boolean;
          played: boolean;
          score_for: number | null;
          score_against: number | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['matches']['Row']> & {
          match_date: string;
          opponent: string;
          is_home: boolean;
        };
        Update: Partial<Database['public']['Tables']['matches']['Row']>;
        Relationships: [];
      };
      trainings: {
        Row: {
          id: number;
          training_date: string;
          training_time: string;
          place: string;
          focus: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['trainings']['Row']> & {
          training_date: string;
          training_time: string;
        };
        Update: Partial<Database['public']['Tables']['trainings']['Row']>;
        Relationships: [];
      };
      training_attendance: {
        Row: {
          training_id: number;
          player_id: number;
          status: AttendanceStatus;
          motivo: string | null;
          created_by: string | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['training_attendance']['Row']> & {
          training_id: number;
          player_id: number;
          status: AttendanceStatus;
        };
        Update: Partial<Database['public']['Tables']['training_attendance']['Row']>;
        Relationships: [];
      };
      notes: {
        Row: {
          id: number;
          title: string;
          body: string;
          author_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notes']['Row']> & {
          title: string;
          body: string;
        };
        Update: Partial<Database['public']['Tables']['notes']['Row']>;
        Relationships: [];
      };
      mvp_awards: {
        Row: {
          id: number;
          match_id: number;
          player_id: number;
          awarded_at: string;
        };
        Insert: Partial<Database['public']['Tables']['mvp_awards']['Row']> & {
          match_id: number;
          player_id: number;
        };
        Update: Partial<Database['public']['Tables']['mvp_awards']['Row']>;
        Relationships: [];
      };
      opponent_notes: {
        Row: {
          id: number;
          team_name: string;
          note: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['opponent_notes']['Row']> & {
          team_name: string;
        };
        Update: Partial<Database['public']['Tables']['opponent_notes']['Row']>;
        Relationships: [];
      };
      tactical_schemes: {
        Row: {
          id: number;
          name: string;
          tokens: unknown;
          lines: unknown;
          player_size: number | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tactical_schemes']['Row']> & {
          name: string;
        };
        Update: Partial<Database['public']['Tables']['tactical_schemes']['Row']>;
        Relationships: [];
      };
      tactical_board_drafts: {
        Row: {
          user_id: string;
          tokens: unknown;
          lines: unknown;
          player_size: number | null;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tactical_board_drafts']['Row']> & {
          user_id: string;
        };
        Update: Partial<Database['public']['Tables']['tactical_board_drafts']['Row']>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
