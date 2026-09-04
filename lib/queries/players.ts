import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database, Position } from '../../types/database';

type PlayerInsert = Database['public']['Tables']['players']['Insert'];

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

export function useAddPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (player: { nome: string; cognome: string; pos: Position; birthdate?: string | null }) => {
      const { error } = await supabase.from('players').insert(player);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useBulkImportPlayers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (players: PlayerInsert[]) => {
      const { error } = await supabase.from('players').insert(players);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['players'] }),
  });
}
