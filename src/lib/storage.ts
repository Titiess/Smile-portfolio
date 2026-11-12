import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

function getStorageClient() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  client = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export function getStorageBucket(isPrivate: boolean) {
  const bucket = isPrivate
    ? process.env.SUPABASE_PRIVATE_BUCKET
    : process.env.SUPABASE_PUBLIC_BUCKET;
  if (!bucket) {
    throw new Error(
      `${isPrivate ? "SUPABASE_PRIVATE_BUCKET" : "SUPABASE_PUBLIC_BUCKET"} is not configured.`,
    );
  }
  return bucket;
}

export async function uploadStorageObject(
  bucket: string,
  key: string,
  content: ArrayBuffer,
  contentType: string,
) {
  const { error } = await getStorageClient()
    .storage.from(bucket)
    .upload(key, content, { contentType, upsert: false, cacheControl: "3600" });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
}

export async function deleteStorageObject(bucket: string, key: string) {
  const { error } = await getStorageClient().storage.from(bucket).remove([key]);
  if (error) throw new Error(`Storage deletion failed: ${error.message}`);
}

export async function getPublicStorageUrl(bucket: string, key: string) {
  const { data } = getStorageClient().storage.from(bucket).getPublicUrl(key);
  return data.publicUrl;
}

export async function getPrivateStorageUrl(bucket: string, key: string) {
  const { data, error } = await getStorageClient()
    .storage.from(bucket)
    .createSignedUrl(key, 90);
  if (error) throw new Error(`Could not create secure file access URL: ${error.message}`);
  return data.signedUrl;
}
