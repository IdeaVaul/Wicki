import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/** Wicki-konton. Projektet delas med Presento; Wickis data ligger i tabellen wicki_progress (RLS: bara egen rad).
 *  Nyckeln nedan är den publika (publishable) nyckeln och får finnas i appen. */
export const SUPABASE_URL = 'https://ubnspdiplzowhydgvefq.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_YhU1AwaaDK-DjmjyHQ8B3A_VuO5vi1g';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});
