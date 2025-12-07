export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          login: string;
          password_hash: string;
          role: 'guest' | 'expert';
          created_at: string;
        };
        Insert: {
          id?: string;
          login: string;
          password_hash: string;
          role?: 'guest' | 'expert';
          created_at?: string;
        };
        Update: {
          id?: string;
          login?: string;
          password_hash?: string;
          role?: 'guest' | 'expert';
          created_at?: string;
        };
      };
      water_objects: {
        Row: {
          id: string;
          name: string;
          region: string;
          resource_type: 'lake' | 'canal' | 'reservoir';
          water_type: 'fresh' | 'non-fresh';
          fauna: boolean;
          passport_date: string;
          technical_condition: 1 | 2 | 3 | 4 | 5;
          latitude: number;
          longitude: number;
          pdf_url: string | null;
          priority: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          region: string;
          resource_type: 'lake' | 'canal' | 'reservoir';
          water_type: 'fresh' | 'non-fresh';
          fauna?: boolean;
          passport_date: string;
          technical_condition: 1 | 2 | 3 | 4 | 5;
          latitude: number;
          longitude: number;
          pdf_url?: string | null;
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          region?: string;
          resource_type?: 'lake' | 'canal' | 'reservoir';
          water_type?: 'fresh' | 'non-fresh';
          fauna?: boolean;
          passport_date?: string;
          technical_condition?: 1 | 2 | 3 | 4 | 5;
          latitude?: number;
          longitude?: number;
          pdf_url?: string | null;
          priority?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

export type WaterObject = Database['public']['Tables']['water_objects']['Row'];
export type User = Database['public']['Tables']['users']['Row'];

export interface Hardware {
  id: number;
  humidity: number;
  temperature: number;
  remote_control: number; // 1, -1, or 0
  created_at: string;
  updated_at: string;
}
