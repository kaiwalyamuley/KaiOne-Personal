import { supabase } from '../supabaseClient';

const STORAGE_KEY = 'kai_one_app_state';

// 1. Initial Load: Fetch remote user data from Supabase
export async function loadUserDataFromSupabase(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase load error:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Failed to load from Supabase:', err);
    return null;
  }
}

// 2. Save / Upsert state to Supabase
export async function syncUserDataToSupabase(userId: string, appState: any) {
  try {
    const payload = {
      id: userId,
      name: appState.profile?.name || 'Kaiwalya',
      email: appState.profile?.email || 'user@local.app',
      theme_preference: appState.theme || 'emerald',
      favorite_festivals: appState.favoriteFestivals || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Supabase sync error:', error.message);
    }
  } catch (err) {
    console.error('Failed to sync to Supabase:', err);
  }
}

// 3. Realtime Cross-Device Listener
export function subscribeToSupabaseSync(userId: string, onRemoteChange: (data: any) => void) {
  const channel = supabase
    .channel(`user-sync-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        if (payload.new) {
          onRemoteChange(payload.new);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
