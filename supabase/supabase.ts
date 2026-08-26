'use client';

/**
 * Kept so existing `import { supabase } from '@/supabase/supabase'` calls keep
 * working. It is now a cookie-backed browser client rather than a
 * localStorage one — see ./client.ts for why that matters.
 *
 * New code should call `createClient()` from './client' directly; a client
 * created inside the component tree is easier to swap when this moves to a
 * Node + Prisma backend.
 */

import { createClient } from './client';

export const supabase = createClient();
