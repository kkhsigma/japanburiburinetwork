import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings } from '@/lib/api';
import { useSettingsStore } from '@/stores/settingsStore';
import type { UserSettings } from '@/types';

export function useSettings() {
  const { setSettings } = useSettingsStore.getState();

  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const result = await fetchSettings();
      setSettings(result.data);
      return result;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettings>) => updateSettings(settings),
    onSuccess: (result) => {
      useSettingsStore.getState().setSettings(result.data);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
