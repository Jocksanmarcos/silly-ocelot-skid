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