import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export function useMvpAwards() {
  return useQuery({
    queryKey: ['mvp_awards'],
    queryFn: async () => {
      const { data, error } = await supabase.from('mvp_awards').select('*').order('awarded_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAssignMvp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, playerId }: { matchId: number; playerId: number }) => {
      const { error } = await supabase.from('mvp_awards').insert({ match_id: matchId, player_id: playerId });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mvp_awards'] }),
  });
}
