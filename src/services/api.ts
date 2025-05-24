import { supabase } from "@/integrations/supabase/client";
import {
  Pondok,
  PondokJenis,
  RAB,
  LPJ,
  Periode,
  Pengurus,
  UserProfile,
  DocumentStatus,
} from "@/types";

export const fetchCurrentPeriode = async (): Promise<Periode | null> => {
  try {
    const { data, error } = await supabase
      .from('periode')
      .select('*')
      .order('tahun', { ascending: false })
      .order('bulan', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data as Periode;
  } catch (error) {
    console.error('Error fetching current periode:', error);
    return null;
  }
};

export const fetchAllPeriode = async (): Promise<Periode[]> => {
  try {
    const { data, error } = await supabase
      .from('periode')
      .select('*')
      .order('tahun', { ascending: false })
      .order('bulan', { ascending: false });
    
    if (error) throw error;
    return data as Periode[];
  } catch (error) {
    console.error('Error fetching all periode:', error);
    return [];
  }
};

export const fetchAllPondoks = async (): Promise<Pondok[]> => {
  try {
    const { data, error } = await supabase
      .from('pondok')
      .select('*')
      .order('nama');
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      jenis: item.jenis as PondokJenis
    })) as Pondok[];
  } catch (error) {
    console.error('Error fetching pondoks:', error);
    return [];
  }
};

export const fetchAllPondok = fetchAllPondoks; // Alias for compatibility

export const fetchPondok = async (id: string): Promise<Pondok | null> => {
  try {
    const { data, error } = await supabase
      .from('pondok')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      jenis: data.jenis as PondokJenis
    } as Pondok;
  } catch (error) {
    console.error('Error fetching pondok:', error);
    return null;
  }
};

export const fetchRABsByPondok = async (pondokId: string): Promise<RAB[]> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .eq('pondok_id', pondokId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      status: item.status as DocumentStatus
    })) as RAB[];
  } catch (error) {
    console.error('Error fetching RABs:', error);
    return [];
  }
};

export const fetchRABsByPeriode = async (periodeId: string): Promise<RAB[]> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .eq('periode_id', periodeId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      status: item.status as DocumentStatus,
      pondok: item.pondok ? {
        ...item.pondok,
        jenis: item.pondok.jenis as PondokJenis
      } : undefined
    })) as RAB[];
  } catch (error) {
    console.error('Error fetching RABs by periode:', error);
    return [];
  }
};

export const fetchRAB = async (id: string): Promise<RAB | null> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as DocumentStatus,
      pondok: data.pondok ? {
        ...data.pondok,
        jenis: data.pondok.jenis as PondokJenis
      } : undefined
    } as RAB;
  } catch (error) {
    console.error('Error fetching RAB:', error);
    return null;
  }
};

export const fetchRABDetail = async (id: string): Promise<RAB | null> => {
  return fetchRAB(id);
};

export const fetchAllRAB = async (): Promise<RAB[]> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      status: item.status as DocumentStatus,
      pondok: item.pondok ? {
        ...item.pondok,
        jenis: item.pondok.jenis as PondokJenis
      } : undefined
    })) as RAB[];
  } catch (error) {
    console.error('Error fetching all RABs:', error);
    return [];
  }
};

export const fetchLPJsByPondok = async (pondokId: string): Promise<LPJ[]> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .eq('pondok_id', pondokId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      status: item.status as DocumentStatus
    })) as LPJ[];
  } catch (error) {
    console.error('Error fetching LPJs:', error);
    return [];
  }
};

export const fetchLPJsByPeriode = async (periodeId: string): Promise<LPJ[]> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .eq('periode_id', periodeId)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      status: item.status as DocumentStatus,
      pondok: item.pondok ? {
        ...item.pondok,
        jenis: item.pondok.jenis as PondokJenis
      } : undefined
    })) as LPJ[];
  } catch (error) {
    console.error('Error fetching LPJs by periode:', error);
    return [];
  }
};

export const fetchLPJ = async (id: string): Promise<LPJ | null> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as DocumentStatus,
      pondok: data.pondok ? {
        ...data.pondok,
        jenis: data.pondok.jenis as PondokJenis
      } : undefined
    } as LPJ;
  } catch (error) {
    console.error('Error fetching LPJ:', error);
    return null;
  }
};

export const fetchLPJDetail = async (id: string): Promise<LPJ | null> => {
  return fetchLPJ(id);
};

export const fetchAllLPJ = async (): Promise<LPJ[]> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .select(`
        *,
        pondok:pondok_id(*),
        periode:periode_id(*)
      `)
      .order('submitted_at', { ascending: false });
    
    if (error) throw error;
    return data.map(item => ({
      ...item,
      status: item.status as DocumentStatus,
      pondok: item.pondok ? {
        ...item.pondok,
        jenis: item.pondok.jenis as PondokJenis
      } : undefined
    })) as LPJ[];
  } catch (error) {
    console.error('Error fetching all LPJs:', error);
    return [];
  }
};

export const createRAB = async (rabData: Omit<RAB, 'id'>): Promise<RAB | null> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .insert([rabData])
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as DocumentStatus
    } as RAB;
  } catch (error) {
    console.error('Error creating RAB:', error);
    return null;
  }
};

export const createLPJ = async (lpjData: Omit<LPJ, 'id'>): Promise<LPJ | null> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .insert([lpjData])
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      status: data.status as DocumentStatus
    } as LPJ;
  } catch (error) {
    console.error('Error creating LPJ:', error);
    return null;
  }
};

export const uploadRABFile = async (file: File, rabId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${rabId}.${fileExt}`;
    const filePath = `rab/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  } catch (error) {
    console.error('Error uploading RAB file:', error);
    return null;
  }
};

export const uploadLPJFile = async (file: File, lpjId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${lpjId}.${fileExt}`;
    const filePath = `lpj/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  } catch (error) {
    console.error('Error uploading LPJ file:', error);
    return null;
  }
};

export const getFileUrl = async (path: string): Promise<string> => {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(path);
  
  return data.publicUrl;
};

export const updateRABStatus = async (
  id: string, 
  status: DocumentStatus, 
  pesanRevisi?: string
): Promise<boolean> => {
  try {
    const updateData: any = { 
      status,
      ...(status === DocumentStatus.DITERIMA && { accepted_at: new Date().toISOString() }),
      ...(pesanRevisi && { pesan_revisi: pesanRevisi })
    };

    const { error } = await supabase
      .from('rab')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating RAB status:', error);
    return false;
  }
};

export const updateLPJStatus = async (
  id: string, 
  status: DocumentStatus, 
  pesanRevisi?: string
): Promise<boolean> => {
  try {
    const updateData: any = { 
      status,
      ...(status === DocumentStatus.DITERIMA && { accepted_at: new Date().toISOString() }),
      ...(pesanRevisi && { pesan_revisi: pesanRevisi })
    };

    const { error } = await supabase
      .from('lpj')
      .update(updateData)
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating LPJ status:', error);
    return false;
  }
};

export const approveLPJ = async (id: string): Promise<boolean> => {
  return updateLPJStatus(id, DocumentStatus.DITERIMA);
};

export const rejectLPJ = async (id: string, pesanRevisi: string): Promise<boolean> => {
  return updateLPJStatus(id, DocumentStatus.REVISI, pesanRevisi);
};

export const approveRAB = async (id: string): Promise<boolean> => {
  return updateRABStatus(id, DocumentStatus.DITERIMA);
};

export const rejectRAB = async (id: string, pesanRevisi: string): Promise<boolean> => {
  return updateRABStatus(id, DocumentStatus.REVISI, pesanRevisi);
};

export const createPondok = async (pondokData: Omit<Pondok, 'id'>): Promise<Pondok | null> => {
  try {
    const { data, error } = await supabase
      .from('pondok')
      .insert(pondokData)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      jenis: data.jenis as PondokJenis
    } as Pondok;
  } catch (error) {
    console.error('Error creating pondok:', error);
    return null;
  }
};

export const updatePondok = async (id: string, pondokData: Partial<Pondok>): Promise<Pondok | null> => {
  try {
    const { data, error } = await supabase
      .from('pondok')
      .update(pondokData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return {
      ...data,
      jenis: data.jenis as PondokJenis
    } as Pondok;
  } catch (error) {
    console.error('Error updating pondok:', error);
    return null;
  }
};

export const verifyPondok = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pondok')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error verifying pondok:', error);
    return false;
  }
};

export const createPengurus = async (pengurusData: Omit<Pengurus, 'id'>): Promise<Pengurus | null> => {
  try {
    const { data, error } = await supabase
      .from('pengurus')
      .insert([pengurusData])
      .select()
      .single();
    
    if (error) throw error;
    return data as Pengurus;
  } catch (error) {
    console.error('Error creating pengurus:', error);
    return null;
  }
};

export const addPengurus = async (pengurusData: Omit<Pengurus, 'id'>): Promise<Pengurus | null> => {
  return createPengurus(pengurusData);
};

export const updatePengurus = async (id: string, pengurusData: Partial<Pengurus>): Promise<Pengurus | null> => {
  try {
    const { data, error } = await supabase
      .from('pengurus')
      .update(pengurusData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Pengurus;
  } catch (error) {
    console.error('Error updating pengurus:', error);
    return null;
  }
};

export const deletePengurus = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pengurus')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting pengurus:', error);
    return false;
  }
};

export const createAdminPondok = async (userData: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profile')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data as UserProfile;
  } catch (error) {
    console.error('Error creating admin pondok:', error);
    return null;
  }
};
