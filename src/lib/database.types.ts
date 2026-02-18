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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'supervisor' | 'driver'
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'admin' | 'supervisor' | 'driver'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'admin' | 'supervisor' | 'driver'
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      vehicle_types: {
        Row: {
          id: string
          name: string
          description: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          active?: boolean
          created_at?: string
        }
      }
      inspection_parts: {
        Row: {
          id: string
          name: string
          description: string | null
          active: boolean
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          active?: boolean
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          active?: boolean
          display_order?: number
          created_at?: string
        }
      }
      vehicle_type_parts: {
        Row: {
          id: string
          vehicle_type_id: string
          inspection_part_id: string
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_type_id: string
          inspection_part_id: string
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_type_id?: string
          inspection_part_id?: string
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          vehicle_type_id: string
          unit_number: string
          license_plate: string | null
          brand: string | null
          model: string | null
          year: number | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_type_id: string
          unit_number: string
          license_plate?: string | null
          brand?: string | null
          model?: string | null
          year?: number | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_type_id?: string
          unit_number?: string
          license_plate?: string | null
          brand?: string | null
          model?: string | null
          year?: number | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      inspections: {
        Row: {
          id: string
          folio: string
          vehicle_id: string
          inspection_type: 'departure' | 'return'
          inspector_id: string
          driver_id: string | null
          status: 'in_progress' | 'completed'
          inspector_signature: string | null
          driver_signature: string | null
          observations: string | null
          inspection_date: string
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          folio?: string
          vehicle_id: string
          inspection_type: 'departure' | 'return'
          inspector_id: string
          driver_id?: string | null
          status?: 'in_progress' | 'completed'
          inspector_signature?: string | null
          driver_signature?: string | null
          observations?: string | null
          inspection_date?: string
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          folio?: string
          vehicle_id?: string
          inspection_type?: 'departure' | 'return'
          inspector_id?: string
          driver_id?: string | null
          status?: 'in_progress' | 'completed'
          inspector_signature?: string | null
          driver_signature?: string | null
          observations?: string | null
          inspection_date?: string
          created_at?: string
          completed_at?: string | null
        }
      }
      inspection_items: {
        Row: {
          id: string
          inspection_id: string
          inspection_part_id: string
          status: 'no_damage' | 'damaged' | 'not_applicable'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          inspection_part_id: string
          status: 'no_damage' | 'damaged' | 'not_applicable'
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          inspection_part_id?: string
          status?: 'no_damage' | 'damaged' | 'not_applicable'
          notes?: string | null
          created_at?: string
        }
      }
      inspection_evidence: {
        Row: {
          id: string
          inspection_id: string
          file_path: string
          file_type: 'image' | 'video'
          file_name: string
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          inspection_id: string
          file_path: string
          file_type: 'image' | 'video'
          file_name: string
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          inspection_id?: string
          file_path?: string
          file_type?: 'image' | 'video'
          file_name?: string
          file_size?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
