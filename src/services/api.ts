import { supabase } from "@/integrations/supabase/client";
import { DocumentStatus, LPJ, Pondok, PondokJenis, RAB, Pengurus } from "@/types";

// Add these conversion functions at the top of the file, after imports

// Convert string to DocumentStatus enum
const toDocumentStatus = (status: string): DocumentStatus => {
  if (status === 'DITERIMA') return DocumentStatus.DITERIMA;
  if (status === 'REVISI') return DocumentStatus.REVISI;
  return DocumentStatus.DIAJUKAN;
};

// Convert string to PondokJenis enum
const toPondokJenis = (jenis: string): PondokJenis => {
  if (jenis === 'PPM') return PondokJenis.PPM;
  if (jenis === 'PPPM') return PondokJenis.PPPM;
  if (jenis === 'BOARDING') return PondokJenis.BOARDING;
  return PondokJenis.PPM; // Default
};

export const fetchPondok = async (pondokId: string): Promise<Pondok> => {
  const { data, error } = await supabase
    .from('pondok')
    .select('*, pengurus(*)')
    .eq('id', pondokId)
    .single();
    
  if (error) throw new Error(error.message);
  
  return {
    ...data,
    jenis: toPondokJenis(data.jenis),
    pengurus: data.pengurus || []
  } as Pondok;
};

export const fetchAllPondok = async (): Promise<Pondok[]> => {
  const { data, error } = await supabase
    .from('pondok')
    .select('*, pengurus(*)');
    
  if (error) throw new Error(error.message);
  
  return (data || []).map(item => ({
    ...item,
    jenis: toPondokJenis(item.jenis),
    pengurus: item.pengurus || []
  })) as Pondok[];
};

export const verifyPondok = async (pondokId: string): Promise<void> => {
  const { error } = await supabase
    .from('pondok')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', pondokId);

  if (error) {
    throw new Error(error.message);
  }
};

export const fetchRABsByPondok = async (pondokId: string): Promise<RAB[]> => {
  const { data, error } = await supabase
    .from('rab')
    .select('*, pondok!inner(*), periode(*)')
    .eq('pondok_id', pondokId);
  
  if (error) throw new Error(error.message);
  
  return (data || []).map(item => ({
    ...item,
    status: toDocumentStatus(item.status),
    pondok: item.pondok ? {
      ...item.pondok,
      jenis: toPondokJenis(item.pondok.jenis)
    } : null
  })) as RAB[];
};

export const fetchRABsByPeriode = async (periodeId: string): Promise<RAB[]> => {
  const { data, error } = await supabase
    .from('rab')
    .select('*, pondok!inner(*), periode(*)')
    .eq('periode_id', periodeId);
  
  if (error) throw new Error(error.message);
  
  return (data || []).map(item => ({
    ...item,
    status: toDocumentStatus(item.status),
    pondok: item.pondok ? {
      ...item.pondok,
      jenis: toPondokJenis(item.pondok.jenis)
    } : null
  })) as RAB[];
};

export const fetchRABDetail = async (rabId: string): Promise<RAB> => {
  const { data, error } = await supabase
    .from('rab')
    .select('*, pondok(*), periode(*)')
    .eq('id', rabId)
    .single();
    
  if (error) throw new Error(error.message);
  
  return {
    ...data,
    status: toDocumentStatus(data.status),
    pondok: data.pondok ? {
      ...data.pondok,
      jenis: toPondokJenis(data.pondok.jenis)
    } : null
  } as RAB;
};

export const approveRAB = async (rabId: string): Promise<void> => {
  const { error } = await supabase
    .from('rab')
    .update({ status: DocumentStatus.DITERIMA })
    .eq('id', rabId);

  if (error) {
    throw new Error(error.message);
  }
};

export const rejectRAB = async (rabId: string, message: string): Promise<void> => {
  const { error } = await supabase
    .from('rab')
    .update({ status: DocumentStatus.REVISI, pesan_revisi: message })
    .eq('id', rabId);

  if (error) {
    throw new Error(error.message);
  }
};

export const fetchLPJsByPondok = async (pondokId: string): Promise<LPJ[]> => {
  const { data, error } = await supabase
    .from('lpj')
    .select('*, pondok!inner(*), periode(*)')
    .eq('pondok_id', pondokId);
  
  if (error) throw new Error(error.message);
  
  return (data || []).map(item => ({
    ...item,
    status: toDocumentStatus(item.status),
    pondok: item.pondok ? {
      ...item.pondok,
      jenis: toPondokJenis(item.pondok.jenis)
    } : null
  })) as LPJ[];
};

export const fetchLPJsByPeriode = async (periodeId: string): Promise<LPJ[]> => {
  const { data, error } = await supabase
    .from('lpj')
    .select('*, pondok!inner(*), periode(*)')
    .eq('periode_id', periodeId);
  
  if (error) throw new Error(error.message);
  
  return (data || []).map(item => ({
    ...item,
    status: toDocumentStatus(item.status),
    pondok: item.pondok ? {
      ...item.pondok,
      jenis: toPondokJenis(item.pondok.jenis)
    } : null
  })) as LPJ[];
};

export const fetchLPJDetail = async (lpjId: string): Promise<LPJ> => {
  const { data, error } = await supabase
    .from('lpj')
    .select('*, pondok(*), periode(*)')
    .eq('id', lpjId)
    .single();
    
  if (error) throw new Error(error.message);
  
  return {
    ...data,
    status: toDocumentStatus(data.status),
    pondok: data.pondok ? {
      ...data.pondok,
      jenis: toPondokJenis(data.pondok.jenis)
    } : null
  } as LPJ;
};

export const approveLPJ = async (lpjId: string): Promise<void> => {
  const { error } = await supabase
    .from('lpj')
    .update({ status: DocumentStatus.DITERIMA })
    .eq('id', lpjId);

  if (error) {
    throw new Error(error.message);
  }
};

export const rejectLPJ = async (lpjId: string, message: string): Promise<void> => {
  const { error } = await supabase
    .from('lpj')
    .update({ status: DocumentStatus.REVISI, pesan_revisi: message })
    .eq('id', lpjId);

  if (error) {
    throw new Error(error.message);
  }
};

export const fetchAllPeriode = async () => {
  const { data, error } = await supabase
    .from('periode')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getFileUrl = async (path: string): Promise<string> => {
  if (!path) return '';
  
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 60 * 60); // 1 hour expiry
  
  if (error || !data) {
    console.error('Error getting signed URL:', error);
    return '';
  }
  
  return data.signedUrl;
};

export const updatePondok = async (pondokId: string, data: Partial<Pondok>): Promise<Pondok> => {
  const { data: updatedData, error } = await supabase
    .from('pondok')
    .update(data)
    .eq('id', pondokId)
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  
  return {
    ...updatedData,
    jenis: toPondokJenis(updatedData.jenis)
  } as Pondok;
};

export const updatePengurus = async (pengurusId: string, data: Partial<Pengurus>): Promise<Pengurus> => {
  const { data: updatedData, error } = await supabase
    .from('pengurus')
    .update(data)
    .eq('id', pengurusId)
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  
  return updatedData as Pengurus;
};

export const addPengurus = async (data: Omit<Pengurus, 'id'>): Promise<Pengurus> => {
  const { data: newData, error } = await supabase
    .from('pengurus')
    .insert([data])
    .select('*')
    .single();
  
  if (error) throw new Error(error.message);
  
  return newData as Pengurus;
};

export const deletePengurus = async (pengurusId: string): Promise<void> => {
  const { error } = await supabase
    .from('pengurus')
    .delete()
    .eq('id', pengurusId);
  
  if (error) throw new Error(error.message);
};

export const createPondok = async (pondokData: Omit<Pondok, 'id' | 'accepted_at'>): Promise<Pondok> => {
  const { data, error } = await supabase
    .from('pondok')
    .insert([pondokData])
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Pondok;
};

export const createRAB = async (rabData: Partial<RAB>): Promise<RAB> => {
  const { data, error } = await supabase
    .from('rab')
    .insert([{
      ...rabData,
      status: rabData.status || DocumentStatus.DIAJUKAN
    }])
    .select('*, pondok(*), periode(*)')
    .single();
  
  if (error) throw new Error(error.message);
  
  return {
    ...data,
    status: toDocumentStatus(data.status),
    pondok: data.pondok ? {
      ...data.pondok,
      jenis: toPondokJenis(data.pondok.jenis)
    } : null
  } as RAB;
};

export const createLPJ = async (lpjData: Partial<LPJ>): Promise<LPJ> => {
  const { data, error } = await supabase
    .from('lpj')
    .insert([{
      ...lpjData,
      status: lpjData.status || DocumentStatus.DIAJUKAN
    }])
    .select('*, pondok(*), periode(*)')
    .single();
  
  if (error) throw new Error(error.message);
  
  return {
    ...data,
    status: toDocumentStatus(data.status),
    pondok: data.pondok ? {
      ...data.pondok,
      jenis: toPondokJenis(data.pondok.jenis)
    } : null
  } as LPJ;
};

export const uploadRABFile = async (file: File, pondokId: string, periodeId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pondokId}_${periodeId}_${Date.now()}.${fileExt}`;
  const filePath = `rab/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      upsert: true,
    });
  
  if (uploadError) throw new Error(uploadError.message);
  
  return filePath;
};

export const uploadLPJFile = async (file: File, pondokId: string, periodeId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pondokId}_${periodeId}_${Date.now()}.${fileExt}`;
  const filePath = `lpj/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      upsert: true,
    });
  
  if (uploadError) throw new Error(uploadError.message);
  
  return filePath;
};
