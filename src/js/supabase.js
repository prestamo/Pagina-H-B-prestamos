import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rjstcmowxhlfbualhtao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3RjbW93eGhsZmJ1YWxodGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjM3MTEsImV4cCI6MjA4NTYzOTcxMX0.JpEo5MbBXSEzftVCQqUip8wbH6NcQxX4QEcyUu2HK5M'

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Funciones de ayuda para obtener contenido dinámico
 */
export const getBanners = async () => {
    const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
    return { data, error }
}

export const getCarouselImages = async () => {
    const { data, error } = await supabase
        .from('carousel')
        .select('*')
        .eq('active', true)
        .order('order', { ascending: true })
    return { data, error }
}

export const getPromotions = async () => {
    const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
    return { data, error }
}
