
import { supabase } from "@/integrations/supabase/client";

// Function to ensure storage buckets exist
export const initStorageBuckets = async () => {
  // Create bukti_rab bucket if it doesn't exist
  const { data: rabBucketData, error: rabBucketError } = await supabase
    .storage
    .getBucket('bukti_rab');
  
  if (rabBucketError && rabBucketError.message.includes('The resource was not found')) {
    const { error: createRabError } = await supabase
      .storage
      .createBucket('bukti_rab', {
        public: false,
        fileSizeLimit: 10485760 // 10MB limit
      });
    
    if (createRabError) {
      console.error('Error creating bukti_rab bucket:', createRabError);
    }
  }

  // Create bukti_lpj bucket if it doesn't exist
  const { data: lpjBucketData, error: lpjBucketError } = await supabase
    .storage
    .getBucket('bukti_lpj');
  
  if (lpjBucketError && lpjBucketError.message.includes('The resource was not found')) {
    const { error: createLpjError } = await supabase
      .storage
      .createBucket('bukti_lpj', {
        public: false,
        fileSizeLimit: 10485760 // 10MB limit
      });
    
    if (createLpjError) {
      console.error('Error creating bukti_lpj bucket:', createLpjError);
    }
  }

  // Set bucket policies to make them public readable
  await setBucketPolicy('bukti_rab');
  await setBucketPolicy('bukti_lpj');
};

// Set bucket public policy
const setBucketPolicy = async (bucketName: string) => {
  // Get existing policy
  const { data: existingPolicy, error: policyError } = await supabase
    .storage
    .getBucket(bucketName);

  if (policyError) {
    console.error(`Error getting policy for ${bucketName}:`, policyError);
    return;
  }

  // Update if not public
  if (!existingPolicy.public) {
    const { error } = await supabase
      .storage
      .updateBucket(bucketName, { public: true });

    if (error) {
      console.error(`Error updating policy for ${bucketName}:`, error);
    }
  }
};
