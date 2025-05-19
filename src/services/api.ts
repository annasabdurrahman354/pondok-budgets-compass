import { supabase } from "@/integrations/supabase/client";
import { LPJ, Periode, Pondok, RAB, UserProfile } from "@/types";

// Function to fetch all pondoks
export const fetchAllPondok = async (): Promise<Pondok[]> => {
  try {
    const { data, error } = await supabase
      .from('pondok')
      .select('*')
      .order('nama', { ascending: true });
    if (error) throw error;
    return data || [];
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
    return data || null;
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
    return data || [];
  } catch (error) {
    console.error("Error fetching RABs:", error);
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
    return data || null;
  } catch (error) {
    console.error("Error fetching RAB:", error);
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
    return data || [];
  } catch (error) {
    console.error("Error fetching LPJs:", error);
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
    return data || null;
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
      });

    if (error) throw error;

    // Fetch the created pondok to return
    const { data: newPondok } = await supabase
      .from('pondok')
      .select('*')
      .eq('id', pondokId)
      .single();

    return newPondok;
  } catch (error) {
    console.error("Error creating pondok:", error);
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

// Function to update RAB status
export const updateRABStatus = async (rabId: string, status: string, pesan_revisi: string | null = null): Promise<RAB | null> => {
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

    return data as RAB;
  } catch (error: any) {
    console.error("Error updating RAB status:", error.message);
    throw error;
  }
};

// Function to update LPJ status
export const updateLPJStatus = async (lpjId: string, status: string, pesan_revisi: string | null = null): Promise<LPJ | null> => {
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

    return data as LPJ;
  } catch (error: any) {
    console.error("Error updating LPJ status:", error.message);
    throw error;
  }
};
