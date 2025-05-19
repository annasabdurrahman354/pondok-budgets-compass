import { supabase } from "@/integrations/supabase/client";
import { DocumentStatus, LPJ, Periode, Pondok, RAB, PengurusJabatan, PondokJenis, UserProfile } from "@/types";

// Fetch data related to Pondok
export const fetchPondok = async (pondokId: string): Promise<Pondok | null> => {
  const { data, error } = await supabase
    .from('pondok')
    .select(`
      *,
      pengurus (*)
    `)
    .eq('id', pondokId)
    .single();

  if (error) {
    console.error('Error fetching pondok:', error);
    return null;
  }

  return data as Pondok;
};

export const fetchAllPondok = async (): Promise<Pondok[]> => {
  const { data, error } = await supabase
    .from('pondok')
    .select(`
      *,
      pengurus (*)
    `)
    .order('nama', { ascending: true });

  if (error) {
    console.error('Error fetching pondoks:', error);
    return [];
  }

  return data as Pondok[];
};

export const updatePondok = async (pondokData: Partial<Pondok> & { id: string }): Promise<Pondok | null> => {
  // Reset verification status when pondok data is updated
  const updateData = {
    ...pondokData,
    accepted_at: null,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('pondok')
    .update(updateData)
    .eq('id', pondokData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pondok:', error);
    throw new Error(error.message);
  }

  return data as Pondok;
};

export const createPondok = async (pondokData: Omit<Pondok, "accepted_at" | "id" | "pengurus">) => {
  const { data, error } = await supabase
    .from('pondok')
    .insert({ 
      ...pondokData,
      id: crypto.randomUUID() // Generate a UUID for the new pondok
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const verifyPondok = async (pondokId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pondok')
    .update({ 
      accepted_at: new Date().toISOString() 
    })
    .eq('id', pondokId);
  
  if (error) {
    console.error('Error verifying pondok:', error);
    throw new Error(error.message);
  }

  return true;
};

export const addPengurus = async (pengurusData: {
  pondok_id: string;
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon?: string;
}): Promise<any> => {
  // First update the pondok's verification status
  await supabase
    .from('pondok')
    .update({
      accepted_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', pengurusData.pondok_id);
  
  // Then add the pengurus
  const { data, error } = await supabase
    .from('pengurus')
    .insert(pengurusData)
    .select()
    .single();

  if (error) {
    console.error('Error adding pengurus:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updatePengurus = async (pengurusData: {
  id: string;
  pondok_id: string;
  nama: string;
  jabatan: PengurusJabatan;
  nomor_telepon?: string;
}): Promise<any> => {
  // First update the pondok's verification status
  await supabase
    .from('pondok')
    .update({
      accepted_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', pengurusData.pondok_id);
  
  // Then update the pengurus
  const { data, error } = await supabase
    .from('pengurus')
    .update({
      nama: pengurusData.nama,
      jabatan: pengurusData.jabatan,
      nomor_telepon: pengurusData.nomor_telepon
    })
    .eq('id', pengurusData.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pengurus:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deletePengurus = async (pengurusId: string, pondokId: string): Promise<boolean> => {
  // First update the pondok's verification status
  await supabase
    .from('pondok')
    .update({
      accepted_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', pondokId);
  
  // Then delete the pengurus
  const { error } = await supabase
    .from('pengurus')
    .delete()
    .eq('id', pengurusId);

  if (error) {
    console.error('Error deleting pengurus:', error);
    throw new Error(error.message);
  }

  return true;
};

export const createAdminPondok = async (userData: {
  nama: string;
  email: string;
  nomor_telepon?: string;
  pondok_id: string;
  role?: string;
}): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profile')
    .insert({
      ...userData,
      role: userData.role || 'admin_pondok',
      id: crypto.randomUUID() // Generate UUID for the user
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating admin pondok:', error);
    throw new Error(error.message);
  }

  return data as UserProfile;
};

// Fetch data related to Periode
export const fetchAllPeriode = async (): Promise<Periode[]> => {
  const { data, error } = await supabase
    .from('periode')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Error fetching periods:', error);
    return [];
  }

  return data as Periode[];
};

export const fetchCurrentPeriode = async (): Promise<Periode | null> => {
  const { data, error } = await supabase
    .from('periode')
    .select('*')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching current period:', error);
    return null;
  }

  return data as Periode;
};

// Fetch RAB data
export const fetchRABsByPondok = async (pondokId: string): Promise<RAB[]> => {
  const { data, error } = await supabase
    .from('rab')
    .select(`
      *,
      periode (*)
    `)
    .eq('pondok_id', pondokId)
    .order('periode_id', { ascending: false });

  if (error) {
    console.error('Error fetching RABs:', error);
    return [];
  }

  return data as RAB[];
};

export const fetchRABsByPeriode = async (periodeId: string): Promise<RAB[]> => {
  const { data, error } = await supabase
    .from('rab')
    .select(`
      *,
      pondok (*),
      periode (*)
    `)
    .eq('periode_id', periodeId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching RABs by period:', error);
    return [];
  }

  return data as RAB[];
};

export const fetchRABDetail = async (rabId: string): Promise<RAB | null> => {
  const { data, error } = await supabase
    .from('rab')
    .select(`
      *,
      pondok (*),
      periode (*)
    `)
    .eq('id', rabId)
    .single();

  if (error) {
    console.error('Error fetching RAB detail:', error);
    return null;
  }

  return data as RAB;
};

export const createRAB = async (rabData: Partial<RAB>): Promise<RAB | null> => {
  // Ensure status is set since it's required by the database
  const dataWithStatus = {
    ...rabData,
    status: rabData.status || DocumentStatus.DIAJUKAN,
  };

  const { data, error } = await supabase
    .from('rab')
    .insert(dataWithStatus)
    .select()
    .single();

  if (error) {
    console.error('Error creating RAB:', error);
    return null;
  }

  return data as RAB;
};

export const updateRABStatus = async (
  rabId: string, 
  status: DocumentStatus, 
  pesanRevisi?: string
): Promise<boolean> => {
  const updateData: Partial<RAB> = {
    status,
    pesan_revisi: pesanRevisi || null,
  };
  
  if (status === DocumentStatus.DITERIMA) {
    updateData.accepted_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('rab')
    .update(updateData)
    .eq('id', rabId);

  if (error) {
    console.error('Error updating RAB status:', error);
    return false;
  }

  return true;
};

// Fetch LPJ data
export const fetchLPJsByPondok = async (pondokId: string): Promise<LPJ[]> => {
  const { data, error } = await supabase
    .from('lpj')
    .select(`
      *,
      periode (*)
    `)
    .eq('pondok_id', pondokId)
    .order('periode_id', { ascending: false });

  if (error) {
    console.error('Error fetching LPJs:', error);
    return [];
  }

  return data as LPJ[];
};

export const fetchLPJsByPeriode = async (periodeId: string): Promise<LPJ[]> => {
  const { data, error } = await supabase
    .from('lpj')
    .select(`
      *,
      pondok (*),
      periode (*)
    `)
    .eq('periode_id', periodeId)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching LPJs by period:', error);
    return [];
  }

  return data as LPJ[];
};

export const fetchLPJDetail = async (lpjId: string): Promise<LPJ | null> => {
  const { data, error } = await supabase
    .from('lpj')
    .select(`
      *,
      pondok (*),
      periode (*)
    `)
    .eq('id', lpjId)
    .single();

  if (error) {
    console.error('Error fetching LPJ detail:', error);
    return null;
  }

  return data as LPJ;
};

export const createLPJ = async (lpjData: Partial<LPJ>): Promise<LPJ | null> => {
  // Ensure status is set since it's required by the database
  const dataWithStatus = {
    ...lpjData,
    status: lpjData.status || DocumentStatus.DIAJUKAN,
  };

  const { data, error } = await supabase
    .from('lpj')
    .insert(dataWithStatus)
    .select()
    .single();

  if (error) {
    console.error('Error creating LPJ:', error);
    return null;
  }

  return data as LPJ;
};

export const updateLPJStatus = async (
  lpjId: string, 
  status: DocumentStatus, 
  pesanRevisi?: string
): Promise<boolean> => {
  const updateData: Partial<LPJ> = {
    status,
    pesan_revisi: pesanRevisi || null,
  };
  
  if (status === DocumentStatus.DITERIMA) {
    updateData.accepted_at = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('lpj')
    .update(updateData)
    .eq('id', lpjId);

  if (error) {
    console.error('Error updating LPJ status:', error);
    return false;
  }

  return true;
};

// File upload functions
export const uploadRABFile = async (file: File, pondokId: string, periodeId: string): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const randomString = Math.random().toString(36).substring(2, 6);
  const fileName = `rab-${periodeId}-${pondokId.substring(0, 8)}-${randomString}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase
    .storage
    .from('bukti_rab')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading RAB file:', uploadError);
    return null;
  }

  return filePath;
};

export const uploadLPJFile = async (file: File, pondokId: string, periodeId: string): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const randomString = Math.random().toString(36).substring(2, 6);
  const fileName = `lpj-${periodeId}-${pondokId.substring(0, 8)}-${randomString}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase
    .storage
    .from('bukti_lpj')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading LPJ file:', uploadError);
    return null;
  }

  return filePath;
};

export const getFileUrl = (bucketName: string, path: string): string => {
  const { data } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(path);
    
  return data.publicUrl;
};
