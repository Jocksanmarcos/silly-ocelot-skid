export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  membership_date?: string | null;
  date_of_birth?: string | null;
  family_id?: string | null;
  marital_status?: string | null;
  family_role?: string | null;
  congregation_id?: string | null; // Adicionado
  created_at: string;
}

export interface Family {
  id: string;
  name: string;
  head_of_family_id?: string | null;
  created_at: string;
  members?: { first_name: string; last_name: string } | null;
}

export type UserRole = 'super_admin' | 'admin_missao' | 'pastor' | 'lider_celula' | 'membro';

export interface Profile {
  id: string;
  full_name?: string;
  reports_to_id?: string | null;
  role: UserRole; // Atualizado
  congregation_id?: string | null; // Adicionado
}

export interface Congregation {
  id: string;
  name: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  event_date: string;
  location?: string | null;
  price?: number | null;
  capacity?: number | null;
  type: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  status: string;
  payment_id?: string | null;
  checked_in: boolean;
  created_at: string;
}

export interface Cell {
  id: string;
  name: string;
  description?: string | null;
  leader_id?: string | null;
  supervisor_id?: string | null;
  meeting_day?: string | null;
  meeting_time?: string | null;
  location_type?: string | null;
  address?: string | null;
  age_group?: string | null;
  status: string;
  created_at: string;
  profiles?: { full_name: string } | null;
}

export interface CellMember {
  id: string;
  cell_id: string;
  user_id?: string | null;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  role: string;
  created_at: string;
}

export interface CellReport {
  id: string;
  cell_id: string;
  meeting_date: string;
  attendance_count: number;
  notes?: string | null;
  created_at: string;
}

export interface Contribution {
  id: string;
  member_id?: string | null;
  contributor_name?: string | null;
  amount: number;
  contribution_date: string;
  fund: string;
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
  members?: { first_name: string; last_name: string; } | null;
}

// Tipos para o Módulo de Ensino
export interface Course {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content_type: 'video' | 'text' | 'pdf';
  content_url?: string | null;
  order: number;
  created_at: string;
  lesson_progress?: { is_completed: boolean }[];
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'in_progress' | 'completed';
  enrolled_at: string;
  completed_at?: string | null;
}

// Tipos para o Módulo de Recepção
export interface Visitor {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  invited_by?: string | null;
  visit_status: 'Primeira vez' | 'Retorno';
  follow_up_status: 'Novo' | 'Em acompanhamento' | 'Decidiu por Cristo' | 'Aguardando Batismo' | 'Integrado como Membro';
  created_at: string;
}

// Tipos para o Módulo de Patrimônio
export interface AssetCategory {
  id: string;
  name: string;
}

export interface AssetLocation {
  id: string;
  name: string;
}

export interface Asset {
  id: string;
  name: string;
  description?: string | null;
  category_id?: string | null;
  location_id?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  current_value?: number | null;
  status: string;
  serial_number?: string | null;
  assigned_to?: string | null;
  asset_categories?: { name: string } | null;
  asset_locations?: { name: string } | null;
  profiles?: { full_name: string } | null;
}

export interface AssetMaintenance {
  id: string;
  asset_id: string;
  maintenance_date: string;
  description: string;
  cost?: number | null;
  provider?: string | null;
}

// Tipos para o Módulo de Agenda
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  is_all_day: boolean;
  visibility: 'public' | 'private';
  category?: string | null;
  created_by?: string | null;
}

// Tipos para o Módulo de Aconselhamento
export interface CounselingRequest {
  id: string;
  requester_name: string;
  requester_contact_email?: string | null;
  requester_contact_phone?: string | null;
  preferred_contact_method: string;
  reason_summary?: string | null;
  status: string;
  assigned_to?: string | null;
  internal_notes?: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
}