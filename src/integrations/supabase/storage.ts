import { supabase } from "./client";

export const createAvatarBucket = async () => {
  try {
    const { data, error } = await supabase.storage.createBucket("avatars", {
      public: true,
      fileSizeLimit: 1024 * 1024 * 2, // 2MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    });
    
    if (error) {
      console.error("Error creating avatars bucket:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Network error creating avatars bucket:", error);
    return false;
  }
};

export const getBucketExists = async (name: string) => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Error listing buckets:", error);
      return false;
    }
    
    return data.some(bucket => bucket.name === name);
  } catch (error) {
    console.error("Network error listing buckets:", error);
    return false;
  }
};

export const initStorage = async () => {
  try {
    const avatarBucketExists = await getBucketExists("avatars");
    
    if (!avatarBucketExists) {
      const created = await createAvatarBucket();
      if (created) {
        console.log("Created avatars bucket");
      } else {
        console.warn("Failed to create avatars bucket - storage features may be limited");
      }
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    console.warn("Storage initialization failed - continuing without storage features");
  }
};