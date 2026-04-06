import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { VariationGroup } from '@/types/product';

interface ProductVariationGroupsProps {
  productId: string;
  onGroupsChange?: (groups: { variation_group_id: string; position: number }[]) => void;
}

const ProductVariationGroups: React.FC<ProductVariationGroupsProps> = ({
  productId,
  onGroupsChange
}) => {
  const { t } = useTranslation();
  const [availableGroups, setAvailableGroups] = useState<VariationGroup[]>([]);
  const [assignedGroups, setAssignedGroups] = useState<{ variation_group_id: string; position: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available variation groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data: groupsData, error: groupsError } = await supabase
          .from('variation_groups')
          .select('*')
          .order('position', { ascending: true });

        if (groupsError) throw groupsError;

        // Fetch items for each group
        const groupsWithItems = await Promise.all((groupsData || []).map(async (group) => {
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
        }));

        setAvailableGroups(groupsWithItems);
      } catch (error: any) {
        console.error('Error fetching groups:', error);
        toast.error('Erro ao buscar grupos de variações');
      }
    };

    fetchGroups();
  }, []);

  // Fetch assigned groups for this product
  useEffect(() => {
    const fetchAssignedGroups = async () => {
      try {
        const { data, error } = await supabase
          .from('product_variation_groups')
          .select('*')
          .eq('product_id', productId)
          .order('position', { ascending: true });

        if (error) throw error;

        setAssignedGroups(data || []);
      } catch (error: any) {
        console.error('Error fetching assigned groups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchAssignedGroups();
    }
  }, [productId]);

  const handleToggleGroup = async (groupId: string) => {
    const isAssigned = assignedGroups.some(g => g.variation_group_id === groupId);

    try {
      if (isAssigned) {
        // Remove assignment
        const { error } = await supabase
          .from('product_variation_groups')
          .delete()
          .eq('product_id', productId)
          .eq('variation_group_id', groupId);

        if (error) throw error;

        const updated = assignedGroups.filter(g => g.variation_group_id !== groupId);
        setAssignedGroups(updated);
        onGroupsChange?.(updated);
        toast.success('Grupo removido');
      } else {
        // Add assignment
        const newPosition = assignedGroups.length;
        const { error } = await supabase
          .from('product_variation_groups')
          .insert({
            product_id: productId,
            variation_group_id: groupId,
            position: newPosition
          });

        if (error) throw error;

        const updated = [
          ...assignedGroups,
          { variation_group_id: groupId, position: newPosition }
        ];
        setAssignedGroups(updated);
        onGroupsChange?.(updated);
        toast.success('Grupo adicionado');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar grupo');
    }
  };

  const handleRemoveGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('product_variation_groups')
        .delete()
        .eq('product_id', productId)
        .eq('variation_group_id', groupId);

      if (error) throw error;

      const updated = assignedGroups.filter(g => g.variation_group_id !== groupId);
      setAssignedGroups(updated);
      onGroupsChange?.(updated);
      toast.success('Grupo removido');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover grupo');
    }
  };

  const handleReorderUp = async (index: number) => {
    if (index === 0) return;

    const updated = [...assignedGroups];
    const temp = updated[index];
    updated[index] = { ...updated[index - 1], position: index };
    updated[index - 1] = { ...temp, position: index - 1 };

    setAssignedGroups(updated);

    try {
      await Promise.all(updated.map(g =>
        supabase
          .from('product_variation_groups')
          .update({ position: g.position })
          .eq('product_id', productId)
          .eq('variation_group_id', g.variation_group_id)
      ));

      onGroupsChange?.(updated);
    } catch (error: any) {
      toast.error('Erro ao reordenar');
      // Revert
      setAssignedGroups(assignedGroups);
    }
  };

  const handleReorderDown = async (index: number) => {
    if (index === assignedGroups.length - 1) return;

    const updated = [...assignedGroups];
    const temp = updated[index];
    updated[index] = { ...updated[index + 1], position: index };
    updated[index + 1] = { ...temp, position: index + 1 };

    setAssignedGroups(updated);

    try {
      await Promise.all(updated.map(g =>
        supabase
          .from('product_variation_groups')
          .update({ position: g.position })
          .eq('product_id', productId)
          .eq('variation_group_id', g.variation_group_id)
      ));

      onGroupsChange?.(updated);
    } catch (error: any) {
      toast.error('Erro ao reordenar');
      // Revert
      setAssignedGroups(assignedGroups);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Carregando grupos...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Grupos de Variações Atribuídos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedGroups.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum grupo atribuído ainda</p>
          ) : (
            <div className="space-y-2">
              {assignedGroups.map((assignment, index) => {
                const group = availableGroups.find(g => g.id === assignment.variation_group_id);
                if (!group) return null;

                return (
                  <div key={assignment.variation_group_id} className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{group.title}</p>
                      <p className="text-xs text-gray-500">{group.items.length} item(ns)</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorderUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorderDown(index)}
                        disabled={index === assignedGroups.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGroup(assignment.variation_group_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grupos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableGroups.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum grupo disponível. Crie um na seção de Variações.</p>
          ) : (
            availableGroups.map(group => {
              const isAssigned = assignedGroups.some(g => g.variation_group_id === group.id);

              return (
                <div key={group.id} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                  <Checkbox
                    checked={isAssigned}
                    onCheckedChange={() => handleToggleGroup(group.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{group.title}</p>
                    <p className="text-xs text-gray-500">{group.items.length} item(ns)</p>
                  </div>
                  {isAssigned && <Badge>Atribuído</Badge>}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductVariationGroups;
