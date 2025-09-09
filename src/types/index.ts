export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  membership_date?: string | null;
  created_at: string;
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
  leader_name: string;
  meeting_day?: string | null;
  meeting_time?: string | null;
  location_type?: string | null;
  address?: string | null;
  age_group?: string | null;
  status: string;
  created_at: string;
}

export interface CellMember {
  id: string;
  cell_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
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