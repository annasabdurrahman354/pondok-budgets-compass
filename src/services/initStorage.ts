
import { supabase } from "@/integrations/supabase/client";

// This function creates storage buckets if they don't exist
export const initStorageBuckets = async (): Promise<void> => {
  try {
    // Initialize 'bukti_rab' bucket
    try {
      const { data: rabBucket, error: rabError } = await supabase.storage.getBucket('bukti_rab');
      
      if (rabError && rabError.message === 'Bucket not found') {
        console.log('Creating bukti_rab bucket...');
        const { error: createRabError } = await supabase.storage.createBucket('bukti_rab', {
          public: true,
        });
        
        if (createRabError) {
          console.error('Error creating bukti_rab bucket:', createRabError);
        } else {
          console.log('bukti_rab bucket created successfully');
        }
      }
    } catch (error) {
      console.error('Error checking bukti_rab bucket:', error);
    }
    
    // Initialize 'bukti_lpj' bucket
    try {
      const { data: lpjBucket, error: lpjError } = await supabase.storage.getBucket('bukti_lpj');
      
      if (lpjError && lpjError.message === 'Bucket not found') {
        console.log('Creating bukti_lpj bucket...');
        const { error: createLpjError } = await supabase.storage.createBucket('bukti_lpj', {
          public: true,
        });
        
        if (createLpjError) {
          console.error('Error creating bukti_lpj bucket:', createLpjError);
        } else {
          console.log('bukti_lpj bucket created successfully');
        }
      }
    } catch (error) {
      console.error('Error checking bukti_lpj bucket:', error);
    }
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
};
