
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase Environment Variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFile(file: File | Blob, bucket: string, path?: string): Promise<string | null> {
  const fileName = path || `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  if (error) {
    console.error(`Error uploading to ${bucket}:`, error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function saveGenerationRecord(
  sketchUrl: string,
  resultUrl: string,
  photoUrl: string,
  prompt: any,
  stage: string
) {
  const { data, error } = await supabase
    .from('pAIntBoard')
    .insert([
      {
        drawing_url: sketchUrl,
        result_url: resultUrl,
        photo_url: photoUrl,
        prompts_used: prompt,
        stage: stage,
      },
    ])
    .select();

  if (error) {
    console.error('Error saving record:', error);
    throw error;
  }

  return data;
}
