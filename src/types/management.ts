export interface ParentRecord {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  username?: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  is_active: boolean;
}

export interface StudentRecord {
  id: number;
  admission_no: string | null;
  full_name: string;
  parent_id: number;
  class_section_id: number;
  class_name?: string | null;
  section?: string | null;
  pickup_address: string | null;
  drop_address: string | null;
  is_active: boolean;
  parent?: ParentRecord | null;
  class_section?: {
    id: number;
    class_name?: string;
    section?: string | null;
    display_name?: string;
  } | null;
}
