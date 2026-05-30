import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase project URL and Anon/Public API key
const supabaseUrl = 'https://thvpvxfzikqpcfngwuct.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRodnB2eGZ6aWtxcGNmbmd3dWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTE0MjQsImV4cCI6MjA5NTcyNzQyNH0.VPHjCJP0JXb9_svn8vikFeOc0RxvB3v9xHy5vZaeEz0'

export const supabase = createClient(supabaseUrl, supabaseKey)

async function getSpecificData() {
  const { data, error } = await supabase
    .from('users')                 // Your table name
    .select('id, name, email')     // Only fetch these specific columns        // Optional: Filter rows where status is active

  if (error) {
    console.error('Error fetching data:', error)
    return
  }
  
  console.log('Retrieved columns:', data)
}