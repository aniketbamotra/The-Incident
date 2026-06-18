export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clue_assignments: {
        Row: {
          clue_id: string | null
          decided_at: string | null
          decision: string | null
          id: string
          implicates_self: boolean | null
          player_id: string | null
          private_content: string
          revealed_content: string | null
          version: string
        }
        Insert: {
          clue_id?: string | null
          decided_at?: string | null
          decision?: string | null
          id?: string
          implicates_self?: boolean | null
          player_id?: string | null
          private_content: string
          revealed_content?: string | null
          version: string
        }
        Update: {
          clue_id?: string | null
          decided_at?: string | null
          decision?: string | null
          id?: string
          implicates_self?: boolean | null
          player_id?: string | null
          private_content?: string
          revealed_content?: string | null
          version?: string
        }
        Relationships: []
      }
      clues: {
        Row: {
          auto_released: boolean | null
          game_id: string | null
          id: string
          master_content: string
          phase: number
          public_announcement: string
          released_at: string | null
        }
        Insert: {
          auto_released?: boolean | null
          game_id?: string | null
          id?: string
          master_content: string
          phase: number
          public_announcement: string
          released_at?: string | null
        }
        Update: {
          auto_released?: boolean | null
          game_id?: string | null
          id?: string
          master_content?: string
          phase?: number
          public_announcement?: string
          released_at?: string | null
        }
        Relationships: []
      }
      games: {
        Row: {
          code: string
          created_at: string | null
          current_phase: number | null
          host_id: string | null
          id: string
          name: string
          status: string | null
          vote_open: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_phase?: number | null
          host_id?: string | null
          id?: string
          name: string
          status?: string | null
          vote_open?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_phase?: number | null
          host_id?: string | null
          id?: string
          name?: string
          status?: string | null
          vote_open?: boolean | null
        }
        Relationships: []
      }
      interactions: {
        Row: {
          count: number | null
          game_id: string | null
          id: string
          last_at: string | null
          player_a: string | null
          player_b: string | null
        }
        Insert: {
          count?: number | null
          game_id?: string | null
          id?: string
          last_at?: string | null
          player_a?: string | null
          player_b?: string | null
        }
        Update: {
          count?: number | null
          game_id?: string | null
          id?: string
          last_at?: string | null
          player_a?: string | null
          player_b?: string | null
        }
        Relationships: []
      }
      players: {
        Row: {
          character_name: string | null
          find_player_id: string | null
          find_question: string | null
          game_id: string | null
          hide_description: string | null
          id: string
          joined_at: string | null
          memory_1: string | null
          memory_1_strength: number | null
          memory_2: string | null
          memory_2_strength: number | null
          memory_3: string | null
          memory_3_strength: number | null
          name: string
          objective: string | null
          public_persona: string | null
          role: string | null
          secret: string | null
          trust_score: number | null
          user_id: string | null
        }
        Insert: {
          character_name?: string | null
          find_player_id?: string | null
          find_question?: string | null
          game_id?: string | null
          hide_description?: string | null
          id?: string
          joined_at?: string | null
          memory_1?: string | null
          memory_1_strength?: number | null
          memory_2?: string | null
          memory_2_strength?: number | null
          memory_3?: string | null
          memory_3_strength?: number | null
          name: string
          objective?: string | null
          public_persona?: string | null
          role?: string | null
          secret?: string | null
          trust_score?: number | null
          user_id?: string | null
        }
        Update: {
          character_name?: string | null
          find_player_id?: string | null
          find_question?: string | null
          game_id?: string | null
          hide_description?: string | null
          id?: string
          joined_at?: string | null
          memory_1?: string | null
          memory_1_strength?: number | null
          memory_2?: string | null
          memory_2_strength?: number | null
          memory_3?: string | null
          memory_3_strength?: number | null
          name?: string
          objective?: string | null
          public_persona?: string | null
          role?: string | null
          secret?: string | null
          trust_score?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      revelations: {
        Row: {
          content: string
          game_id: string | null
          id: string
          phase: number
          released: boolean | null
          released_at: string | null
          type: string | null
        }
        Insert: {
          content: string
          game_id?: string | null
          id?: string
          phase: number
          released?: boolean | null
          released_at?: string | null
          type?: string | null
        }
        Update: {
          content?: string
          game_id?: string | null
          id?: string
          phase?: number
          released?: boolean | null
          released_at?: string | null
          type?: string | null
        }
        Relationships: []
      }
      story_event_players: {
        Row: {
          event_id: string
          player_id: string
        }
        Insert: {
          event_id: string
          player_id: string
        }
        Update: {
          event_id?: string
          player_id?: string
        }
        Relationships: []
      }
      story_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_time: string | null
          game_id: string | null
          id: string
          title: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_time?: string | null
          game_id?: string | null
          id?: string
          title: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_time?: string | null
          game_id?: string | null
          id?: string
          title?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      tips: {
        Row: {
          content: string
          created_at: string | null
          game_id: string | null
          id: string
          recipient_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          game_id?: string | null
          id?: string
          recipient_id?: string | null
          sender_id?: string | null
        }
        Relationships: []
      }
      trust_ratings: {
        Row: {
          game_id: string | null
          id: string
          rated_id: string | null
          rater_id: string | null
          score: number
          updated_at: string | null
        }
        Insert: {
          game_id?: string | null
          id?: string
          rated_id?: string | null
          rater_id?: string | null
          score: number
          updated_at?: string | null
        }
        Update: {
          game_id?: string | null
          id?: string
          rated_id?: string | null
          rater_id?: string | null
          score?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string | null
          game_id: string | null
          id: string
          phase: number
          suspect_id: string | null
          voter_id: string | null
        }
        Insert: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          phase: number
          suspect_id?: string | null
          voter_id?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          phase?: number
          suspect_id?: string | null
          voter_id?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      clue_partner_name: {
        Args: { assignment_id: string }
        Returns: string
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

// Domain aliases
export type Game = Tables<"games">
export type Player = Tables<"players">
export type StoryEvent = Tables<"story_events">
export type Clue = Tables<"clues">
export type ClueAssignment = Tables<"clue_assignments">
export type Tip = Tables<"tips">
export type TrustRating = Tables<"trust_ratings">
export type Vote = Tables<"votes">
export type Interaction = Tables<"interactions">
export type Revelation = Tables<"revelations">

export type GameStatus = "lobby" | "active" | "dispersal" | "finale"
export type ClueDecision = "revealed" | "hidden" | null
export type ClueVersion = "implicating" | "neutral"
