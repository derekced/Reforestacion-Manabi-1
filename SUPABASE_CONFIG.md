# Configuración de Supabase

## Desactivar confirmación de email (Desarrollo)

Para poder registrar usuarios sin necesidad de confirmar email en desarrollo:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Authentication** → **Providers** → **Email**
3. Desactiva la opción **"Confirm email"**
4. Guarda los cambios

## Verificar que el trigger funciona correctamente

El trigger `handle_new_user()` debería capturar automáticamente los datos del registro:

```sql
-- Ver el trigger actual
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar la función
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'handle_new_user';
```

## Probar registro manualmente

Para probar que un usuario se crea correctamente:

1. Registra un nuevo usuario desde `/register`
2. Verifica en Supabase:
   ```sql
   -- Ver usuario en auth.users
   SELECT id, email, raw_user_meta_data 
   FROM auth.users 
   ORDER BY created_at DESC 
   LIMIT 1;
   
   -- Ver perfil creado
   SELECT * FROM perfiles 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

## Confirmar email manualmente (si es necesario)

Si ya tienes usuarios sin confirmar, puedes confirmarlos manualmente:

```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'usuario@ejemplo.com';
```

## Probar diferentes roles

- **Voluntario**: Registrar en `/register` (rol por defecto)
- **Organizador**: Registrar en `/register` y seleccionar "Quiero ser organizador"
- **Admin**: Registrar en `/register/admin` con código `ADMIN2025MANABI`
