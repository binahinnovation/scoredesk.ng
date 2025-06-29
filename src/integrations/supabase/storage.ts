import { supabase } from "./client";

export const createAvatarBucket = async () => {
  try {
    const { data, error } = await supabase.storage.createBucket("avatars", {
      public: true,
      fileSizeLimit: 1024 * 1024 * 2, // 2MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    });
    
    if (error) {
      // Don't log errors for buckets that already exist
      if (error.message?.includes('already exists')) {
        return true;
      }
      console.warn("Could not create avatars bucket:", error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn("Storage service unavailable - continuing without storage features");
    return false;
  }
};

export const getBucketExists = async (name: string) => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.warn("Could not check bucket existence:", error.message);
      return false;
    }
    
    return data.some(bucket => bucket.name === name);
  } catch (error) {
    console.warn("Storage service unavailable - assuming bucket does not exist");
    return false;
  }
};

export const initStorage = async () => {
  try {
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Storage initialization timeout')), 5000);
    });
    
    const initPromise = async () => {
      const avatarBucketExists = await getBucketExists("avatars");
      
      if (!avatarBucketExists) {
        const created = await createAvatarBucket();
        if (created) {
          console.log("Storage initialized successfully");
        }
      } else {
        console.log("Storage already initialized");
      }
    };
    
    await Promise.race([initPromise(), timeoutPromise]);
  } catch (error) {
    // Silently handle storage initialization failures
    // The app should continue to work without storage features
    console.warn("Storage initialization skipped - app will continue without storage features");
  }
};