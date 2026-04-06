import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { VariationGroup } from '@/types/product';

export const useProductVariationGroups = (productId: string) => {
  const [groups, setGroups] = useState<VariationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!productId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch assigned groups for this product
        const { data: assignedData, error: assignedError } = await supabase
          .from('product_variation_groups')
          .select('variation_group_id, position')
          .eq('product_id', productId)
          .order('position', { ascending: true });

        if (assignedError) throw assignedError;

        if (!assignedData || assignedData.length === 0) {
          setGroups([]);
          return;
        }

        // Fetch full group details
        const groupIds = assignedData.map(a => a.variation_group_id);
        const { data: groupsData, error: groupsError } = await supabase
          .from('variation_groups')
          .select('*')
          .in('id', groupIds);

        if (groupsError) throw groupsError;

        // Fetch items for each group
        const groupsWithItems = await Promise.all(
          (groupsData || []).map(async (group) => {
            const { data: itemsData, error: itemsError } = await supabase
              .from('variation_group_items')
              .select('*')
              .eq('group_id', group.id)
              .order('position', { ascending: true });

            if (itemsError) throw itemsError;

            return {
              ...group,
              items: itemsData || []
            };
          })
        );

        // Sort by assigned position
        const sortedGroups = groupsWithItems.sort((a, b) => {
          const posA = assignedData.find(d => d.variation_group_id === a.id)?.position || 0;
          const posB = assignedData.find(d => d.variation_group_id === b.id)?.position || 0;
          return posA - posB;
        });

        setGroups(sortedGroups);
      } catch (err: any) {
        console.error('Error fetching variation groups:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [productId]);

  return { groups, isLoading, error };
};
