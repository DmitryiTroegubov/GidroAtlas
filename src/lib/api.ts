import { supabase } from './supabase';
import type { WaterObject, User, Hardware } from '../types/database';

export async function fetchWaterObjects(): Promise<{ data: WaterObject[] | null; error: any }> {
  const { data, error } = await supabase.from('water_objects').select('*');
  return { data: (data as WaterObject[]) ?? null, error };
}

export async function insertWaterObject(obj: Partial<WaterObject>): Promise<{ data: WaterObject | null; error: any }> {
  const { data, error } = await (supabase.from('water_objects') as any).insert([obj]).select().single();
  return { data: data as WaterObject ?? null, error };
}

export async function deleteWaterObject(id: string): Promise<{ error: any }> {
  const { error } = await (supabase.from('water_objects') as any).delete().eq('id', id);
  return { error };
}

export async function fetchUsers(): Promise<{ data: User[] | null; error: any }> {
  const { data, error } = await supabase.from('users').select('*');
  return { data: (data as User[]) ?? null, error };
}

export async function insertUser(u: { login: string; password_hash: string; role?: 'guest' | 'expert' }): Promise<{ data: User | null; error: any }> {
  const { data, error } = await (supabase.from('users') as any).insert([u]).select().single();
  return { data: data as User ?? null, error };
}

export async function deleteUser(id: string): Promise<{ error: any }> {
  const { error } = await (supabase.from('users') as any).delete().eq('id', id);
  return { error };
}

export async function updateUserRole(id: string, role: 'guest' | 'expert'): Promise<{ data: User | null; error: any }> {
  const { data, error } = await (supabase.from('users') as any).update({ role }).eq('id', id).select().single();
  return { data: data as User ?? null, error };
}

export async function updateUser(id: string, payload: Partial<User>): Promise<{ data: User | null; error: any }> {
  const { data, error } = await (supabase.from('users') as any).update(payload).eq('id', id).select().single();
  return { data: data as User ?? null, error };
}

export async function updateWaterObject(id: string, payload: Partial<WaterObject>): Promise<{ data: WaterObject | null; error: any }> {
  const { data, error } = await (supabase.from('water_objects') as any).update(payload).eq('id', id).select().single();
  return { data: data as WaterObject ?? null, error };
}

// Hardware API helpers
export async function fetchHardware(): Promise<{ data: Hardware | null; error: any }> {
  const { data, error } = await supabase.from('hardware').select('*').eq('id', 1).single();
  return { data: data ? (data as unknown as Hardware) : null, error };
}

export async function updateHardware(payload: Partial<Hardware>): Promise<{ data: Hardware | null; error: any }> {
  const { data, error } = await (supabase.from('hardware') as any).update(payload).eq('id', 1).select().single();
  return { data: data ? (data as unknown as Hardware) : null, error };
}
