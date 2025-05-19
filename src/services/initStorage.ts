
import { supabase } from "@/integrations/supabase/client";

// This function creates storage buckets if they don't exist
export const initStorageBuckets = async (): Promise<void> => {
  try {
    // Check if the storage buckets exist and create them if they don't
    const { data: buckets } = await supabase.storage.listBuckets();
    
    // Initialize 'bukti_rab' bucket if it doesn't exist
    if (!buckets?.some(bucket => bucket.name === 'bukti_rab')) {
      console.log('Creating bukti_rab bucket...');
      try {
        await supabase.storage.createBucket('bukti_rab', {
          public: true,
          allowedMimeTypes: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 10485760 // 10MB
        });
        console.log('bukti_rab bucket created successfully');
      } catch (error) {
        console.error('Error creating bukti_rab bucket:', error);
      }
    }
    
    // Initialize 'bukti_lpj' bucket if it doesn't exist
    if (!buckets?.some(bucket => bucket.name === 'bukti_lpj')) {
      console.log('Creating bukti_lpj bucket...');
      try {
        await supabase.storage.createBucket('bukti_lpj', {
          public: true,
          allowedMimeTypes: ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          fileSizeLimit: 10485760 // 10MB
        });
        console.log('bukti_lpj bucket created successfully');
      } catch (error) {
        console.error('Error creating bukti_lpj bucket:', error);
      }
    }
  } catch (error) {
    console.error('Error initializing storage buckets:', error);
  }
};
