
import { supabase } from "./client";

export const createAvatarBucket = async () => {
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
};

export const getBucketExists = async (name: string) => {
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("Error listing buckets:", error);
    return false;
  }
  
  return data.some(bucket => bucket.name === name);
};

export const initStorage = async () => {
  const avatarBucketExists = await getBucketExists("avatars");
  
  if (!avatarBucketExists) {
    await createAvatarBucket();
    console.log("Created avatars bucket");
  }
};
