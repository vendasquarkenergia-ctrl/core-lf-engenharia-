import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { addToSyncQueue } from '../../lib/offlineSync';

export interface Post {
    id: string;
    obra_id: string;
    author_id: string;
    description: string;
    image_url?: string;
    climate?: 'sol' | 'chuva' | 'nublado';
    workforce_count?: number;
    stage?: string;
    status: 'success' | 'warning' | 'critical';
    latitude?: number;
    longitude?: number;
    created_at: string;
}

const checkHasEnv = () => import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('sua-url-aqui');

// ==========================================
// HOOKS (SERVICES)
// ==========================================

export const useTimelinePosts = (obraId?: string) => {
    return useQuery({
        queryKey: ['timeline_posts', obraId],
        queryFn: async () => {
            // Retorna array vazio se não houver Supabase configurado ainda (Fallback Mock pode ser preenchido na UI)
            if (!checkHasEnv()) return [];

            let query = supabase.from('timeline_posts')
                .select('*, users:users_profiles(name, avatar_url, role)');

            if (obraId) query = query.eq('obra_id', obraId);

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
    });
};

export const useCreatePost = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPost: Omit<Post, 'id' | 'created_at'>) => {
            // 1. Storage Upload if File is present (Simulated here)
            let photoUrl = newPost.image_url;
            if (photoUrl && photoUrl.startsWith('data:image')) {
                // Here you would do:
                // const file = base64ToFile(photoUrl);
                // const { data } = await supabase.storage.from('rdo').upload(`${Date.now()}.jpg`, file);
                // photoUrl = supabase.storage.from('rdo').getPublicUrl(data.path).data.publicUrl;
            }

            const payload = { ...newPost, image_url: photoUrl };

            // 2. Offline Mode handling
            if (!navigator.onLine || !checkHasEnv()) {
                await addToSyncQueue({
                    action: 'mutation',
                    cacheKey: ['timeline_posts'],
                    data: payload,
                    table: 'timeline_posts'
                });
                return payload;
            }

            // 3. Real Supabase Call
            const { data, error } = await supabase
                .from('timeline_posts')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onMutate: async (newPost) => {
            await queryClient.cancelQueries({ queryKey: ['timeline_posts'] });
            const previousPosts = queryClient.getQueryData(['timeline_posts']) || [];

            const optimisticPost = {
                ...newPost,
                id: `optimistic-${Date.now()}`,
                created_at: new Date().toISOString(),
                users: { name: 'Você (Enviando...)', role: 'COLABORADOR' }
            };

            queryClient.setQueryData(['timeline_posts'], (old: any) => [optimisticPost, ...(old || [])]);
            return { previousPosts };
        },
        onError: (err, newPost, context) => {
            queryClient.setQueryData(['timeline_posts'], context?.previousPosts);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['timeline_posts'] });
        },
    });
};
