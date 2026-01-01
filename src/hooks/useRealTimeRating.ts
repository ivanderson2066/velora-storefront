import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface RatingStats {
  rating: number;
  count: number;
  isLoading: boolean;
}

export const useRealTimeRating = (
  productId: string, 
  handle?: string, 
  initialRating: number = 0, 
  initialCount: number = 0
): RatingStats => {
  const [stats, setStats] = useState<RatingStats>({
    rating: Number(initialRating) || 0,
    count: Number(initialCount) || 0,
    isLoading: true
  });

  useEffect(() => {
    if (!supabase) {
      setStats(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchRatings = async () => {
      try {
        const cleanId = productId.includes('/') 
          ? productId.split('/').pop() 
          : productId;

        let reviews: any[] = [];

        // ESTRATÉGIA UNIFICADA: Busca tudo que pode ser relevante
        // 1. Busca por ID
        const { data: idData } = await supabase
          .from('reviews')
          .select('id, rating') // Selecionamos ID para dedup
          .eq('product_id', cleanId);
        
        if (idData) reviews = [...reviews, ...idData];

        // 2. Busca por Handle (se existir)
        if (handle) {
           const { data: handleData } = await supabase
             .from('reviews')
             .select('id, rating')
             .eq('product_handle', handle);
           
           if (handleData) reviews = [...reviews, ...handleData];
        }

        // 3. Busca Handle na coluna ID (fallback comum)
        if (handle) {
            const { data: mixedData } = await supabase
              .from('reviews')
              .select('id, rating')
              .eq('product_id', handle);
            
            if (mixedData) reviews = [...reviews, ...mixedData];
        }

        // DEDUPLICAÇÃO (Crucial para evitar contagem "1 a mais")
        // Remove reviews duplicados baseados no ID do review no banco
        const uniqueReviews = Array.from(new Map(reviews.map(item => [item.id, item])).values());

        if (uniqueReviews.length > 0) {
          const supabaseCount = uniqueReviews.length;
          const supabaseSum = uniqueReviews.reduce((acc: any, curr: any) => acc + (curr.rating || 0), 0);

          // SOMA COM DADOS LOCAIS
          // Assumimos que dados locais (Shopify JSON) são reviews "antigos" importados que NÃO estão no Supabase.
          // Se você importou TUDO para o Supabase, então initialCount deveria ser ignorado.
          // Mas para segurança, mantemos a soma.
          
          const safeInitialCount = Number(initialCount) || 0;
          const safeInitialRating = Number(initialRating) || 0;

          const localSum = safeInitialRating * safeInitialCount;
          const totalCount = safeInitialCount + supabaseCount;
          const totalSum = localSum + supabaseSum;
          
          const finalAverage = totalCount > 0 ? totalSum / totalCount : 0;

          setStats({
            rating: finalAverage,
            count: totalCount,
            isLoading: false
          });
        } else {
            // Se não achou nada no banco, mantém o local
            setStats({
                rating: Number(initialRating) || 0,
                count: Number(initialCount) || 0,
                isLoading: false
            });
        }

      } catch (error) {
        console.warn('Erro ao buscar ratings:', error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchRatings();
  }, [productId, handle, initialRating, initialCount]);

  return stats;
};