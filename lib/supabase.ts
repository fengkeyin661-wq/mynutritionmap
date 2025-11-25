import { createClient } from '@supabase/supabase-js';

// ⚠️ 在实际生产环境中，这些应该放在 .env 文件中
const SUPABASE_URL = 'https://bxrkilsdmuwoerzmylwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4cmtpbHNkbXV3b2Vyem15bHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTA2MzcsImV4cCI6MjA3OTYyNjYzN30.1YsL8Loijnnz4k2Fhk93gtHhAlNo4Yk7YJ3dsg6otzo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 辅助函数：上传图片到 Storage (需要先在 Supabase Dashboard 创建 bucket 'images')
export const uploadImage = async (file: File, bucket: string = 'images'): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};
