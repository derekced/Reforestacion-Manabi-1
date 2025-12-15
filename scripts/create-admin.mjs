// Script para crear usuario administrador
// Ejecutar: node scripts/create-admin.mjs

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necesitas agregar esta variable

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.log('Asegúrate de tener en .env.local:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY (obtener de Settings → API)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  console.log('🚀 Creando usuario administrador...\n');

  const email = 'admin@reforestacion.com';
  const password = 'Admin123!Seguro'; // Cambia esto por una contraseña segura

  try {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nombre: 'Administrador'
      }
    });

    if (authError) throw authError;

    console.log('✅ Usuario creado en Auth:', authData.user.id);
    console.log('   Email:', email);

    // 2. El perfil se crea automáticamente por el trigger
    // Esperar un momento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. Actualizar rol a admin
    const { data: profileData, error: profileError } = await supabase
      .from('perfiles')
      .update({ role: 'admin' })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) throw profileError;

    console.log('✅ Perfil actualizado a rol admin');
    console.log('\n🎉 ¡Usuario administrador creado exitosamente!');
    console.log('\nCredenciales:');
    console.log('  Email:', email);
    console.log('  Password:', password);
    console.log('\n⚠️  Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('already exists')) {
      console.log('\n💡 El usuario ya existe. Para convertirlo en admin, ejecuta:');
      console.log(`
UPDATE perfiles 
SET role = 'admin'
WHERE email = '${email}';
      `);
    }
  }
}

createAdmin();
