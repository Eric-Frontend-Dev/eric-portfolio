import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://kygqxmkqlongrhceuqab.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Z3F4bWtxbG9uZ3JoY2V1cWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2NDI4MjYsImV4cCI6MjA5NjIxODgyNn0.LNvn-HXqTPMEedZ9GoFFJ7trzbOcU1a7OhhLGYE5YX0'
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const getPublicUrl = (bucket, path) => {
  if (!path) return null
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
export const uploadFile = async (bucket, file, path) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error
  return getPublicUrl(bucket, data.path)
}
