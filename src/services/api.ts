import { supabase } from "@/integrations/supabase/client";
import { DocumentStatus, LPJ, Pondok, PondokJenis, RAB, Pengurus, PengurusJabatan, Periode, UserProfile, UserRole } from "@/types";

// Helper function to convert string status to DocumentStatus enum
const toDocumentStatus = (status: string | null | undefined): DocumentStatus => {
  if (status === 'diterima') return DocumentStatus.DITERIMA;
  if (status === 'revisi') return DocumentStatus.REVISI;
  if (status === 'diajukan') return DocumentStatus.DIAJUKAN;
  return DocumentStatus.DIAJUKAN; // Default or handle as an error
};

// Helper function to convert string jenis to PondokJenis enum
const toPondokJenis = (jenis: string | null | undefined): PondokJenis => {
  if (jenis === 'ppm') return PondokJenis.PPM;
  if (jenis === 'pppm') return PondokJenis.PPPM;
  if (jenis === 'boarding') return PondokJenis.BOARDING;
  return PondokJenis.PPM; // Default or handle as an error
};


// --- Existing Functions (verified and kept) ---

export const fetchPondok = async (pondokId: string): Promise<Pondok | null> => {
  const { data, error } = await supabase
    .from('pondok')
    .select('*, pengurus(*)')
    .eq('id', pondokId)
    .single();
    
  if (error) {
    console.error("Error fetching pondok:", error.message);
    throw new Error(error.message);
  }
  if (!data) return null;
  
  return {
    ...data,
    jenis: toPondokJenis(data.jenis),
    pengurus: data.pengurus?.map(p => ({...p, jabatan: p.jabatan as PengurusJabatan})) || []
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
    pengurus: item.pengurus?.map(p => ({...p, jabatan: p.jabatan as PengurusJabatan})) || []
  })) as Pondok[];
};

export const verifyPondok = async (pondokId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pondok')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', pondokId);

  if (error) {
    console.error("Error verifying pondok:", error.message);
    throw new Error(error.message);
  }
  return true;
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

export const fetchRABDetail = async (rabId: string): Promise<RAB | null> => {
  const { data, error } = await supabase
    .from('rab')
    .select('*, pondok(*), periode(*)')
    .eq('id', rabId)
    .single();
    
  if (error) {
    console.error("Error fetching RAB detail:", error.message);
    throw new Error(error.message);
  }
  if (!data) return null;
  
  return {
    ...data,
    status: toDocumentStatus(data.status),
    pondok: data.pondok ? {
      ...data.pondok,
      jenis: toPondokJenis(data.pondok.jenis)
    } : null
  } as RAB;
};

export const approveRAB = async (rabId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('rab')
    .update({ status: DocumentStatus.DITERIMA, accepted_at: new Date().toISOString(), pesan_revisi: null })
    .eq('id', rabId);

  if (error) {
    console.error("Error approving RAB:", error.message);
    throw new Error(error.message);
  }
  return true;
};

export const rejectRAB = async (rabId: string, message: string): Promise<boolean> => {
  const { error } = await supabase
    .from('rab')
    .update({ status: DocumentStatus.REVISI, pesan_revisi: message, accepted_at: null })
    .eq('id', rabId);

  if (error) {
    console.error("Error rejecting RAB:", error.message);
    throw new Error(error.message);
  }
  return true;
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

export const fetchLPJDetail = async (lpjId: string): Promise<LPJ | null> => {
  const { data, error } = await supabase
    .from('lpj')
    .select('*, pondok(*), periode(*)')
    .eq('id', lpjId)
    .single();
    
  if (error) {
    console.error("Error fetching LPJ detail:", error.message);
    throw new Error(error.message);
  }
  if (!data) return null;
  
  return {
    ...data,
    status: toDocumentStatus(data.status),
    pondok: data.pondok ? {
      ...data.pondok,
      jenis: toPondokJenis(data.pondok.jenis)
    } : null
  } as LPJ;
};

export const approveLPJ = async (lpjId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('lpj')
    .update({ status: DocumentStatus.DITERIMA, accepted_at: new Date().toISOString(), pesan_revisi: null })
    .eq('id', lpjId);

  if (error) {
    console.error("Error approving LPJ:", error.message);
    throw new Error(error.message);
  }
  return true;
};

export const rejectLPJ = async (lpjId: string, message: string): Promise<boolean> => {
  const { error } = await supabase
    .from('lpj')
    .update({ status: DocumentStatus.REVISI, pesan_revisi: message, accepted_at: null })
    .eq('id', lpjId);

  if (error) {
    console.error("Error rejecting LPJ:", error.message);
    throw new Error(error.message);
  }
  return true;
};

export const fetchAllPeriode = async (): Promise<Periode[]> => {
  const { data, error } = await supabase
    .from('periode')
    .select('*')
    .order('id', { ascending: false }); // Show newest first

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
};

export const getFileUrl = async (path: string): Promise<string> => {
  if (!path) return '';
  
  const { data, error } = await supabase.storage
    .from('documents') // Assuming 'documents' is the correct bucket name based on existing functions
    .createSignedUrl(path, 60 * 60); // 1 hour expiry
  
  if (error || !data) {
    console.error('Error getting signed URL:', error);
    return '';
  }
  
  return data.signedUrl;
};

export const updatePondok = async (pondokId: string, data: Partial<Pondok>): Promise<Pondok | null> => {
  const { data: updatedData, error } = await supabase
    .from('pondok')
    .update({...data, updated_at: new Date().toISOString()})
    .eq('id', pondokId)
    .select('*, pengurus(*)')
    .single();
  
  if (error) {
    console.error("Error updating pondok:", error.message);
    throw new Error(error.message);
  }
  if (!updatedData) return null;
  
  return {
    ...updatedData,
    jenis: toPondokJenis(updatedData.jenis),
    pengurus: updatedData.pengurus?.map(p => ({...p, jabatan: p.jabatan as PengurusJabatan})) || []
  } as Pondok;
};

export const updatePengurus = async (pengurusId: string, data: Partial<Pengurus>): Promise<Pengurus | null> => {
  const { data: updatedData, error } = await supabase
    .from('pengurus')
    .update(data)
    .eq('id', pengurusId)
    .select('*')
    .single();
  
  if (error) {
    console.error("Error updating pengurus:", error.message);
    throw new Error(error.message);
  }
  return updatedData as Pengurus || null;
};

export const addPengurus = async (data: Omit<Pengurus, 'id'>): Promise<Pengurus | null> => {
  const { data: newData, error } = await supabase
    .from('pengurus')
    .insert([data])
    .select('*')
    .single();
  
  if (error) {
    console.error("Error adding pengurus:", error.message);
    throw new Error(error.message);
  }
  return newData as Pengurus || null;
};

export const deletePengurus = async (pengurusId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('pengurus')
    .delete()
    .eq('id', pengurusId);
  
  if (error) {
    console.error("Error deleting pengurus:", error.message);
    throw new Error(error.message);
  }
  return true;
};

export const createPondok = async (pondokData: Omit<Pondok, 'id' | 'accepted_at' | 'pengurus' | 'updated_at'>): Promise<Pondok | null> => {
  const { data, error } = await supabase
    .from('pondok')
    .insert([{...pondokData, updated_at: new Date().toISOString()}])
    .select('*')
    .single();

  if (error) {
    console.error("Error creating pondok:", error.message);
    throw new Error(error.message);
  }
  if (!data) return null;

  return {
    ...data,
    jenis: toPondokJenis(data.jenis)
  } as Pondok;
};

export const createRAB = async (rabData: Partial<RAB>): Promise<RAB | null> => {
  const { data, error } = await supabase
    .from('rab')
    .insert([{
      ...rabData,
      status: rabData.status || DocumentStatus.DIAJUKAN,
      submitted_at: new Date().toISOString()
    }])
    .select('*, pondok(*), periode(*)')
    .single();
  
  if (error) {
    console.error("Error creating RAB:", error.message);
    throw new Error(error.message);
  }
  if (!data) return null;
  
  return {
    ...data,
    status: toDocumentStatus(data.status),
    pondok: data.pondok ? {
      ...data.pondok,
      jenis: toPondokJenis(data.pondok.jenis)
    } : null
  } as RAB;
};

export const createLPJ = async (lpjData: Partial<LPJ>): Promise<LPJ | null> => {
  const { data, error } = await supabase
    .from('lpj')
    .insert([{
      ...lpjData,
      status: lpjData.status || DocumentStatus.DIAJUKAN,
      submitted_at: new Date().toISOString()
    }])
    .select('*, pondok(*), periode(*)')
    .single();
  
  if (error) {
    console.error("Error creating LPJ:", error.message);
    throw new Error(error.message);
  }
  if (!data) return null;
  
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
  const fileName = `rab-${periodeId}-${pondokId}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
  const filePath = `rab/${fileName}`; // Store in 'rab' folder inside 'documents' bucket
  
  const { error: uploadError } = await supabase.storage
    .from('documents') // Main bucket
    .upload(filePath, file, {
      upsert: true, // Overwrite if file with same name exists
    });
  
  if (uploadError) throw new Error(`Upload RAB File Error: ${uploadError.message}`);
  
  return filePath;
};

export const uploadLPJFile = async (file: File, pondokId: string, periodeId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `lpj-${periodeId}-${pondokId}-${Math.random().toString(36).substring(2, 6)}.${fileExt}`;
  const filePath = `lpj/${fileName}`; // Store in 'lpj' folder inside 'documents' bucket
  
  const { error: uploadError } = await supabase.storage
    .from('documents') // Main bucket
    .upload(filePath, file, {
      upsert: true, // Overwrite if file with same name exists
    });
  
  if (uploadError) throw new Error(`Upload LPJ File Error: ${uploadError.message}`);
  
  return filePath;
};


// --- New Functions to Address Missing Imports ---

/**
 * Fetches the current active periode based on the current date.
 * Your prompt implies identifying the current YYYYMM period.
 * This function fetches all and you might need to filter client-side,
 * or adjust the query if "current" has a specific DB marker.
 * For simplicity, this fetches the periode matching current YYYYMM.
 */
export const fetchCurrentPeriode = async (): Promise<Periode | null> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentPeriodeId = `${year}${String(month).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('periode')
    .select('*')
    .eq('id', currentPeriodeId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    console.error("Error fetching current periode:", error.message);
    throw new Error(error.message);
  }
  
  return data as Periode | null;
};

/**
 * Updates the status of an RAB.
 * This is a generic status update function.
 */
export const updateRABStatus = async (rabId: string, status: DocumentStatus, pesanRevisi?: string): Promise<boolean> => {
  const updateData: Partial<RAB> = { status };
  if (status === DocumentStatus.DITERIMA) {
    updateData.accepted_at = new Date().toISOString();
    updateData.pesan_revisi = null;
  } else if (status === DocumentStatus.REVISI && pesanRevisi) {
    updateData.pesan_revisi = pesanRevisi;
    updateData.accepted_at = null;
  } else if (status === DocumentStatus.DIAJUKAN) {
    // Resetting fields if it's re-submitted or status changed back to diajukan
    updateData.accepted_at = null;
    updateData.pesan_revisi = null;
  }

  const { error } = await supabase
    .from('rab')
    .update(updateData)
    .eq('id', rabId);

  if (error) {
    console.error("Error updating RAB status:", error.message);
    throw new Error(error.message);
  }
  return true;
};

/**
 * Updates the status of an LPJ.
 * This is a generic status update function.
 */
export const updateLPJStatus = async (lpjId: string, status: DocumentStatus, pesanRevisi?: string): Promise<boolean> => {
  const updateData: Partial<LPJ> = { status };
  if (status === DocumentStatus.DITERIMA) {
    updateData.accepted_at = new Date().toISOString();
    updateData.pesan_revisi = null;
  } else if (status === DocumentStatus.REVISI && pesanRevisi) {
    updateData.pesan_revisi = pesanRevisi;
    updateData.accepted_at = null;
  } else if (status === DocumentStatus.DIAJUKAN) {
    updateData.accepted_at = null;
    updateData.pesan_revisi = null;
  }

  const { error } = await supabase
    .from('lpj')
    .update(updateData)
    .eq('id', lpjId);

  if (error) {
    console.error("Error updating LPJ status:", error.message);
    throw new Error(error.message);
  }
  return true;
};

/**
 * Fetches all LPJ records.
 */
export const fetchAllLPJ = async (): Promise<LPJ[]> => {
  const { data, error } = await supabase
    .from('lpj')
    .select('*, pondok(*), periode(*)'); // Fetch related pondok and periode
    
  if (error) {
    console.error("Error fetching all LPJs:", error.message);
    throw new Error(error.message);
  }
  
  return (data || []).map(item => ({
    ...item,
    status: toDocumentStatus(item.status),
    pondok: item.pondok ? {
      ...item.pondok,
      jenis: toPondokJenis(item.pondok.jenis)
    } : null
  })) as LPJ[];
};

/**
 * Creates a new Pengurus record.
 * This is similar to addPengurus, providing the name expected by PondokCreate.tsx.
 */
export const createPengurus = async (pengurusData: Omit<Pengurus, 'id'>): Promise<Pengurus | null> => {
  return addPengurus(pengurusData); // Delegates to the existing addPengurus
};

/**
 * Creates an Admin Pondok user (auth user and user_profile record).
 */
export const createAdminPondok = async (adminData: {
  email: string;
  password?: string; // Password should be handled securely, ideally set by user or via invite
  nama: string;
  nomor_telepon?: string | null;
  pondok_id: string;
}): Promise<UserProfile | null> => {
  // Step 1: Create user in Supabase Auth
  // IMPORTANT: For production, user creation with a fixed password here is not secure.
  // Consider an invitation flow or allowing the user to set their password.
  // The prompt implies Admin Pusat creates the user, so password might be temporary.
  const tempPassword = adminData.password || `password-${Math.random().toString(36).substring(2,10)}`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: adminData.email,
    password: tempPassword, // Ensure this password handling meets your security requirements
    options: {
      data: {
        nama: adminData.nama, // Store name in user_metadata if needed during signup
        role: UserRole.ADMIN_PONDOK
      }
    }
  });

  if (authError) {
    console.error('Error creating Supabase auth user:', authError.message);
    throw new Error(`Auth Error: ${authError.message}`);
  }

  if (!authData.user) {
    throw new Error('User not created in Supabase Auth.');
  }

  // Step 2: Create user profile in 'user_profile' table
  const userProfileData: Omit<UserProfile, 'created_at' | 'updated_at' | 'pondok'> = {
    id: authData.user.id,
    email: adminData.email,
    nama: adminData.nama,
    nomor_telepon: adminData.nomor_telepon || null,
    role: UserRole.ADMIN_PONDOK,
    pondok_id: adminData.pondok_id,
  };

  const { data: profile, error: profileError } = await supabase
    .from('user_profile')
    .insert(userProfileData)
    .select()
    .single();

  if (profileError) {
    console.error('Error creating user profile:', profileError.message);
    // Potentially delete the auth user if profile creation fails to avoid orphaned auth users
    // await supabase.auth.admin.deleteUser(authData.user.id); // Requires admin privileges
    throw new Error(`Profile Error: ${profileError.message}`);
  }
  
  // Optionally, inform about the temporary password if it was auto-generated.
  if (!adminData.password) {
    console.warn(`Admin Pondok ${adminData.email} created with temporary password: ${tempPassword}`);
    // You might want to communicate this password securely or force a password change on first login.
  }

  return profile as UserProfile | null;
};


/**
 * Fetches all RAB records.
 */
export const fetchAllRAB = async (): Promise<RAB[]> => {
  const { data, error } = await supabase
    .from('rab')
    .select('*, pondok(*), periode(*)'); // Fetch related pondok and periode
    
  if (error) {
    console.error("Error fetching all RABs:", error.message);
    throw new Error(error.message);
  }
  
  return (data || []).map(item => ({
    ...item,
    status: toDocumentStatus(item.status),
    pondok: item.pondok ? {
      ...item.pondok,
      jenis: toPondokJenis(item.pondok.jenis)
    } : null
  })) as RAB[];
};
