import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase.from('players').select('*').order('cognome', { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
