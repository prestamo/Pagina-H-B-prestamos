import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://rjstcmowxhlfbualhtao.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqc3RjbW93eGhsZmJ1YWxodGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjM3MTEsImV4cCI6MjA4NTYzOTcxMX0.JpEo5MbBXSEzftVCQqUip8wbH6NcQxX4QEcyUu2HK5M'

const supabase = createClient(supabaseUrl, supabaseKey)

const images = [
    { name: 'img_tabla.jpg', localPath: './public/assets/img/Tabla JPEG.jpeg' },
    { name: 'img_presentacion.jpg', localPath: './public/assets/img/Presentacion.jpeg' }
]

async function migrate() {
    console.log('--- Iniciando Migración de Imágenes (Fix Manual Upsert) ---');
    
    const bucketName = 'promocion';
    const urls = {};

    for (const img of images) {
        try {
            if (!fs.existsSync(img.localPath)) {
                console.log(`Aviso: ${img.localPath} no existe, se usarán fallbacks.`);
                continue;
            }
            const fileData = fs.readFileSync(img.localPath);
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(img.name, fileData, { upsert: true, contentType: 'image/jpeg' });

            if (error) {
                console.error(`Error subiendo ${img.name}:`, error.message);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(img.name);
            
            console.log(`Subido: ${img.name} -> ${publicUrl}`);
            urls[img.name === 'img_tabla.jpg' ? 'imgTable' : 'imgPresentation'] = publicUrl;
        } catch (e) {
            console.error(`Error en ${img.name}:`, e.message);
        }
    }

    const configData = {
        title1: 'Transparencia <span class="text-brand">Total</span>',
        subtitle1: '<p>Creemos en relaciones a largo plazo. Sin letras pequeñas, sin cargos ocultos. Solo soluciones reales.</p>',
        feature1: 'Tasas Competitivas',
        feature2: 'Aprobación en 24h',
        title2: 'Transparencia en cada cuota',
        desc2: '<p>En B&H Préstamos creemos en la claridad. Nuestra tabla de amortización te permite conocer exactamente lo que pagarás, sin sorpresas ni letras pequeñas.</p>',
        floatingText: '¡Somos tu mejor opción!',
        imgTable: urls.imgTable || 'assets/img/Tabla JPEG.jpeg',
        imgPresentation: urls.imgPresentation || 'assets/img/Presentacion.jpeg'
    };

    // Manual Upsert Logic
    const { data: existing } = await supabase.from('promotions').select('id').eq('title', 'CONFIG_CUOTAS').single();

    const payload = {
        title: 'CONFIG_CUOTAS',
        description: JSON.stringify(configData),
        image_url: urls.imgTable || null,
        active: false
    };

    let result;
    if (existing) {
        console.log('Actualizando registro existente...');
        result = await supabase.from('promotions').update(payload).eq('id', existing.id);
    } else {
        console.log('Insertando nuevo registro...');
        result = await supabase.from('promotions').insert([payload]);
    }

    if (result.error) console.error('Error DB:', result.error.message);
    else console.log('Éxito: Cuotas configuradas con identificador TITLE: CONFIG_CUOTAS');

    console.log('--- Migración Finalizada ---');
}

migrate();
