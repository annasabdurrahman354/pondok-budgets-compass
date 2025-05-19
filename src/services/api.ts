
import { supabase } from "@/integrations/supabase/client";
import { DocumentStatus, LPJ, Periode, Pondok, PondokJenis, RAB, UserProfile } from "@/types";

// Function to fetch all pondoks
export const fetchAllPondok = async (): Promise<Pondok[]> => {
  try {
    const { data, error } = await supabase
      .from('pondok')
      .select('*')
      .order('nama', { ascending: true });
    if (error) throw error;
    
    // Convert jenis string to PondokJenis enum
    return (data || []).map(pondok => ({
      ...pondok,
      jenis: pondok.jenis as PondokJenis
    }));
  } catch (error) {
    console.error("Error fetching pondoks:", error);
    return [];
  }
};

// Function to fetch a single pondok by ID
export const fetchPondok = async (id: string): Promise<Pondok | null> => {
  try {
    const { data, error } = await supabase
      .from('pondok')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    
    if (data) {
      return {
        ...data,
        jenis: data.jenis as PondokJenis
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching pondok:", error);
    return null;
  }
};

// Function to verify a pondok
export const verifyPondok = async (pondokId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('pondok')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', pondokId);
    if (error) throw error;
  } catch (error) {
    console.error("Error verifying pondok:", error);
    throw error;
  }
};

// Function to fetch all RABs for a pondok
export const fetchRABsByPondok = async (pondokId: string): Promise<RAB[]> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select('*, pondok(*), periode(*)')
      .eq('pondok_id', pondokId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    
    // Convert status string to DocumentStatus enum
    return (data || []).map(rab => ({
      ...rab,
      status: rab.status as DocumentStatus
    }));
  } catch (error) {
    console.error("Error fetching RABs:", error);
    return [];
  }
};

// Function to fetch RABs by period
export const fetchRABsByPeriode = async (periodeId: string): Promise<RAB[]> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select('*, pondok(*), periode(*)')
      .eq('periode_id', periodeId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    
    // Convert status string to DocumentStatus enum
    return (data || []).map(rab => ({
      ...rab,
      status: rab.status as DocumentStatus
    }));
  } catch (error) {
    console.error("Error fetching RABs by period:", error);
    return [];
  }
};

// Function to fetch a single RAB by ID
export const fetchRAB = async (rabId: string): Promise<RAB | null> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select('*, pondok(*), periode(*)')
      .eq('id', rabId)
      .single();
    if (error) throw error;
    
    if (data) {
      return {
        ...data,
        status: data.status as DocumentStatus
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching RAB:", error);
    return null;
  }
};

// Function to fetch RAB detail for a specific period and pondok
export const fetchRABDetail = async (pondokId: string, periodeId: string): Promise<RAB | null> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .select('*, pondok(*), periode(*)')
      .eq('pondok_id', pondokId)
      .eq('periode_id', periodeId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - not an error in this context
        return null;
      }
      throw error;
    }
    
    if (data) {
      return {
        ...data,
        status: data.status as DocumentStatus
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching RAB detail:", error);
    return null;
  }
};

// Function to fetch all LPJs for a pondok
export const fetchLPJsByPondok = async (pondokId: string): Promise<LPJ[]> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .select('*, pondok(*), periode(*)')
      .eq('pondok_id', pondokId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    
    // Convert status string to DocumentStatus enum
    return (data || []).map(lpj => ({
      ...lpj,
      status: lpj.status as DocumentStatus
    }));
  } catch (error) {
    console.error("Error fetching LPJs:", error);
    return [];
  }
};

// Function to fetch LPJs by period
export const fetchLPJsByPeriode = async (periodeId: string): Promise<LPJ[]> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .select('*, pondok(*), periode(*)')
      .eq('periode_id', periodeId)
      .order('submitted_at', { ascending: false });
    if (error) throw error;
    
    // Convert status string to DocumentStatus enum
    return (data || []).map(lpj => ({
      ...lpj,
      status: lpj.status as DocumentStatus
    }));
  } catch (error) {
    console.error("Error fetching LPJs by period:", error);
    return [];
  }
};

// Function to fetch a single LPJ by ID
export const fetchLPJ = async (lpjId: string): Promise<LPJ | null> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .select('*, pondok(*), periode(*)')
      .eq('id', lpjId)
      .single();
    if (error) throw error;
    
    if (data) {
      return {
        ...data,
        status: data.status as DocumentStatus
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching LPJ:", error);
    return null;
  }
};

// Function to fetch current periode
export const fetchCurrentPeriode = async (): Promise<Periode | null> => {
  try {
    const today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
    const { data, error } = await supabase
      .from('periode')
      .select('*')
      .lte('awal_rab', today)
      .gte('akhir_lpj', today)
      .single();
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error("Error fetching current periode:", error);
    return null;
  }
};

// Function to fetch all periodes
export const fetchAllPeriode = async (): Promise<Periode[]> => {
    try {
      const { data, error } = await supabase
        .from('periode')
        .select('*')
        .order('tahun', { ascending: false })
        .order('bulan', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching all periode:", error);
      return [];
    }
  };

// Function to create a new periode
export const createPeriode = async (periodeData: Omit<Periode, "id">): Promise<Periode | null> => {
    try {
      // Generate a new ID for the periode (YYYYMM)
      const periodeId = `${periodeData.tahun}${String(periodeData.bulan).padStart(2, '0')}`;
  
      const { error } = await supabase
        .from('periode')
        .insert({
          id: periodeId,
          ...periodeData,
        });
  
      if (error) throw error;
  
      // Fetch the created periode to return
      const { data: newPeriode } = await supabase
        .from('periode')
        .select('*')
        .eq('id', periodeId)
        .single();
  
      return newPeriode;
    } catch (error) {
      console.error("Error creating periode:", error);
      return null;
    }
  };

// Function to update a periode
export const updatePeriode = async (periodeId: string, periodeData: Omit<Periode, "id">): Promise<Periode | null> => {
  try {
    const { error } = await supabase
      .from('periode')
      .update(periodeData)
      .eq('id', periodeId);

    if (error) throw error;

    // Fetch the updated periode to return
    const { data: updatedPeriode } = await supabase
      .from('periode')
      .select('*')
      .eq('id', periodeId)
      .single();

    return updatedPeriode;
  } catch (error) {
    console.error("Error updating periode:", error);
    return null;
  }
};

// Function to delete a periode
export const deletePeriode = async (periodeId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('periode')
      .delete()
      .eq('id', periodeId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting periode:", error);
    throw error;
  }
};

// Function to update a pondok
export const updatePondok = async (pondokId: string, pondokData: Partial<Pondok>): Promise<Pondok | null> => {
  try {
    const { error } = await supabase
      .from('pondok')
      .update(pondokData)
      .eq('id', pondokId);

    if (error) throw error;

    // Fetch the updated pondok to return
    const { data: updatedPondok } = await supabase
      .from('pondok')
      .select('*')
      .eq('id', pondokId)
      .single();

    if (updatedPondok) {
      return {
        ...updatedPondok,
        jenis: updatedPondok.jenis as PondokJenis
      };
    }
    return null;
  } catch (error) {
    console.error("Error updating pondok:", error);
    return null;
  }
};

// Function to create a new pondok
export const createPondok = async (pondokData: Omit<Pondok, "id" | "accepted_at" | "pengurus">): Promise<Pondok | null> => {
  try {
    // Generate a new UUID for the pondok
    const pondokId = crypto.randomUUID();
    
    const { error } = await supabase
      .from('pondok')
      .insert({
        id: pondokId,
        ...pondokData,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    // Fetch the created pondok to return
    const { data: newPondok } = await supabase
      .from('pondok')
      .select('*')
      .eq('id', pondokId)
      .single();

    if (newPondok) {
      return {
        ...newPondok,
        jenis: newPondok.jenis as PondokJenis
      };
    }
    return null;
  } catch (error) {
    console.error("Error creating pondok:", error);
    throw error;
  }
};

// Function to add a pengurus
export const addPengurus = async (pengurusData: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('pengurus')
      .insert(pengurusData)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error adding pengurus:", error);
    throw error;
  }
};

// Function to update a pengurus
export const updatePengurus = async (pengurusId: string, pengurusData: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('pengurus')
      .update(pengurusData)
      .eq('id', pengurusId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating pengurus:", error);
    throw error;
  }
};

// Function to delete a pengurus
export const deletePengurus = async (pengurusId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('pengurus')
      .delete()
      .eq('id', pengurusId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting pengurus:", error);
    throw error;
  }
};

// Function to create pengurus for a pondok
export const createPengurus = async (pengurusData: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('pengurus')
      .insert(pengurusData);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating pengurus:", error);
    throw error;
  }
};

// Function to create admin pondok user
export const createAdminPondok = async (userData: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('user_profile')
      .insert(userData);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating admin pondok:", error);
    throw error;
  }
};

// Function to upload RAB file
export const uploadRABFile = async (file: File, pondokId: string, periodeId: string): Promise<string | null> => {
  try {
    const filePath = `rab/${pondokId}/${periodeId}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase
      .storage
      .from('documents')
      .upload(filePath, file);
      
    if (error) throw error;
    
    return filePath;
  } catch (error) {
    console.error("Error uploading RAB file:", error);
    return null;
  }
};

// Function to upload LPJ file
export const uploadLPJFile = async (file: File, pondokId: string, periodeId: string): Promise<string | null> => {
  try {
    const filePath = `lpj/${pondokId}/${periodeId}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase
      .storage
      .from('documents')
      .upload(filePath, file);
      
    if (error) throw error;
    
    return filePath;
  } catch (error) {
    console.error("Error uploading LPJ file:", error);
    return null;
  }
};

// Function to get a file URL
export const getFileUrl = async (path: string): Promise<string | null> => {
  if (!path) return null;
  
  try {
    const { data } = await supabase
      .storage
      .from('documents')
      .getPublicUrl(path);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Error getting file URL:", error);
    return null;
  }
};

// Function to create a new RAB
export const createRAB = async (rabData: Partial<RAB>): Promise<RAB | null> => {
  try {
    const { error } = await supabase
      .from('rab')
      .insert(rabData);
      
    if (error) throw error;
    
    // Get the newly created RAB
    const { data } = await supabase
      .from('rab')
      .select('*, pondok(*), periode(*)')
      .eq('pondok_id', rabData.pondok_id)
      .eq('periode_id', rabData.periode_id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      return {
        ...data,
        status: data.status as DocumentStatus
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error creating RAB:", error);
    return null;
  }
};

// Function to create a new LPJ
export const createLPJ = async (lpjData: Partial<LPJ>): Promise<LPJ | null> => {
  try {
    const { error } = await supabase
      .from('lpj')
      .insert(lpjData);
      
    if (error) throw error;
    
    // Get the newly created LPJ
    const { data } = await supabase
      .from('lpj')
      .select('*, pondok(*), periode(*)')
      .eq('pondok_id', lpjData.pondok_id)
      .eq('periode_id', lpjData.periode_id)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();
    
    if (data) {
      return {
        ...data,
        status: data.status as DocumentStatus
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error creating LPJ:", error);
    return null;
  }
};

// Function to update RAB status
export const updateRABStatus = async (rabId: string, status: DocumentStatus, pesan_revisi: string | null = null): Promise<RAB | null> => {
  try {
    const { data, error } = await supabase
      .from('rab')
      .update({ status, pesan_revisi })
      .eq('id', rabId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update RAB status: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as DocumentStatus
    } as RAB;
  } catch (error: any) {
    console.error("Error updating RAB status:", error.message);
    throw error;
  }
};

// Function to update LPJ status
export const updateLPJStatus = async (lpjId: string, status: DocumentStatus, pesan_revisi: string | null = null): Promise<LPJ | null> => {
  try {
    const { data, error } = await supabase
      .from('lpj')
      .update({ status, pesan_revisi })
      .eq('id', lpjId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update LPJ status: ${error.message}`);
    }

    return {
      ...data,
      status: data.status as DocumentStatus
    } as LPJ;
  } catch (error: any) {
    console.error("Error updating LPJ status:", error.message);
    throw error;
  }
};
