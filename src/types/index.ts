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