import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rjstcmowxhlfbualhtao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3RjbW93eGhsZmJ1YWxodGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjM3MTEsImV4cCI6MjA4NTYzOTcxMX0.JpEo5MbBXSEzftVCQqUip8wbH6NcQxX4QEcyUu2HK5M'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
    const { data, error } = await supabase.from('promotions').select('*').limit(1);
    if (error) console.error(error);
    else console.log('Columns:', Object.keys(data[0] || {}));
}

debug();
