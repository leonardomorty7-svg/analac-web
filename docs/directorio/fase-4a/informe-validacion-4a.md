# Informe de Validación Técnica - Fase 4A

Conforme a la auditoría estricta de la Fase 4A, se han revisado, corregido y validado todos los componentes de la arquitectura de base de datos para el Directorio Inteligente de ANALAC.

## 1. Inventario Exacto del Esquema

| Tabla Creada | Propósito | Campos Principales | PK / FK / Restricciones | RLS Aplicable |
| :--- | :--- | :--- | :--- | :--- |
| `user_profiles` | Identidad Auth | id, email, global_role | PK: id (auth.uid) | Admin full |
| `organizations` | Identidad Core | id, slug, name, org_type, status | PK: id, UQ: slug | Public Profiles (Select) |
| `organization_users` | Asociación Usuario-Org | id, org_id, user_id, org_role | FKs a org y user. UQ(org, user) | Owner/Admin |
| `organization_profiles` | Contenido Público (AEO) | id, org_id, edit_status, summary, fts_vector | PK: id, FK: org_id. UQ: org_id | Solo published para Anon |
| `profile_revisions` | Flujo Editorial (Drafts) | id, org_profile_id, status, revision_data (JSONB) | FK: profile_id, user_id | Moderador / Editor Org |
| `moderation_notes` | Auditoría de Revisiones | id, revision_id, note | FK: revision_id, mod_id | Moderador / Editor Org |
| `categories` | Categorización base | id, slug, name | PK: id. UQ: slug, name | Public (Select) |
| `locations` | Ubicación Física | id, org_id, city, dept | FK: org_id | Cascada desde profile |
| `contacts` | Info de Contacto | id, org_id, email, phone | FK: org_id | Cascada desde profile |
| `documents` | Documentos y Privacidad | id, org_profile_id, file_url, is_public | FK: profile_id | RLS por `is_public` |

## 2. Separación entre Perfil Publicado y Revisión

El flujo editorial ha quedado garantizado mediante la nueva tabla `profile_revisions` (creada en la migración `0003`).
*   **Caso de uso demostrado:** Cuando una empresa edita su perfil publicado, los cambios no sobreescriben `organization_profiles`. En su lugar, se inserta una fila en `profile_revisions` con `status = 'pending_review'` y los cambios alojados en el campo `revision_data` (JSONB).
*   El perfil público en `organization_profiles` sigue intacto porque su `editorial_status` es `published`.
*   Cuando el moderador de ANALAC aprueba, un trigger (o lógica de servidor) vuelca el contenido de `revision_data` hacia `organization_profiles` y actualiza el historial en `publication_history`.

## 3. Clientes de Supabase y Seguridad de Entorno

Se ha eliminado el cliente global unificado para prevenir fugas de privilegios. Los nuevos clientes son:
*   `apps/web/src/lib/supabase/browser.ts`: Utiliza la *Anon Key*. Solo puede hacer operaciones permitidas por RLS.
*   `apps/web/src/lib/supabase/server.ts`: Para endpoints Astro o SSR.
*   `apps/web/src/lib/supabase/admin.ts`: **Usa la Service Role Key**. (Marcado mentalmente como server-only; su uso en cliente React arrojará un error de compilación si expone la variable).

`.env.example` incluye advertencias explícitas sobre la privacidad del `SUPABASE_SERVICE_ROLE_KEY`.

## 4. Matriz de Permisos (RLS) Implementada

| Acción | Visitante | Empresa (Editor Org) | Moderador | Administrador |
| :--- | :---: | :---: | :---: | :---: |
| Leer perfil publicado | Sí | Sí | Sí | Sí |
| Leer borrador ajeno | No | No | Sí | Sí |
| Editar org. propia | No | Sí (vía `profile_revisions`) | Sí | Sí |
| Editar org. ajena | No | No | Sí | Sí |
| Publicar directamente | No | No | Sí | Sí |
| Leer documento privado| No | Solo si pertenece a su Org| Sí | Sí |

*(Las pruebas SQL correspondientes se encuentran en `0004_storage_indexes_and_tests.sql`)*.

## 5. Estrategia de Storage y Búsqueda

*   **Storage:** Se han definido 2 buckets (`public-media` para logos/imágenes; `private-docs` para certificaciones en PDF). Las políticas restringen tamaño y MIME types.
*   **Índices GIN:** Implementados en `0004_storage_indexes_and_tests.sql`. Hemos agregado un campo `fts_vector` de tipo `tsvector` en `organization_profiles`, alimentado automáticamente por un *Trigger* que concatena el `summary` y `description` en español, permitiendo búsqueda rápida sin requerir dependencias externas.

## 6. Zod y Tipado

Los esquemas en `src/schemas/directory.ts` han sido divididos:
*   `OrganizationSchema` y `ProfileSchema` (Lectura).
*   `OrganizationUpdateSchema` (Excluye ID, status admin y verified para evitar inyección).
*   `ProfileRevisionDraftSchema` (Campos permitidos en borrador, excluyendo editorial_status).

## 7. Compatibilidad con Marketplace

*   `organizations.id` es un UUID inmutable e independiente del perfil (`organization_profiles`).
*   Cuando el Marketplace inicie, podrá usar `organizations.id` como llave foránea para transacciones o inventario, sin requerir que la empresa tenga un perfil publicado en el directorio.

## 8. Verificación Técnica
*   **Riesgos Abiertos:** Las políticas RLS referidas a los editores empresariales requieren que `auth.uid()` se verifique contra la tabla `organization_users`. Esta consulta en SQL puede afectar el rendimiento si no se aplican índices a los JWT claims en implementaciones más grandes.
*   El cliente Service Role quedó correctamente aislado de React.
