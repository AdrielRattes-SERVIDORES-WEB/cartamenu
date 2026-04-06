import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useStore } from '@/contexts/StoreContext';
import { formatCurrency } from '@/lib/utils';
import type { VariationGroup, VariationGroupItem } from '@/types/product';
import VariationGroupForm from '@/components/admin/VariationGroupForm';

const AdminVariationGroups = () => {
  const { t } = useTranslation();
  const { storeInfo } = useStore();
  const [groups, setGroups] = useState<VariationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VariationGroup | null>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
    try {
      const { data: groupsData, error: groupsError } = await supabase
        .from('variation_groups')
        .select('*')
        .order('position', { ascending: true })
        .order('created_at', { ascending: false });

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

      // Filter by search term
      const filtered = groupsWithItems.filter(g =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setGroups(filtered);
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [searchTerm]);

  const handleAddGroup = () => {
    setEditingGroup(null);
    setIsFormOpen(true);
  };

  const handleEditGroup = (group: VariationGroup) => {
    setEditingGroup(group);
    setIsFormOpen(true);
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar "${groupName}"?`)) return;

    try {
      const { error } = await supabase
        .from('variation_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast.success(t('common.deleted'));
      fetchGroups();
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingGroup(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchGroups();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('variation_group.groups')}</CardTitle>
            <CardDescription>{t('variation_group.groupsDescription')}</CardDescription>
          </div>
          <Button onClick={handleAddGroup} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            {t('variation_group.newGroup')}
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <Search className="h-5 w-5 text-gray-400 ml-3 mt-2" />
            <Input
              placeholder={t('common.search') + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando...</div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhum grupo encontrado</div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('common.description')}</TableHead>
                    <TableHead className="text-right">{t('common.items') || 'Itens'}</TableHead>
                    <TableHead className="text-right">{t('variation_group.positionLabel')}</TableHead>
                    <TableHead className="text-right">{t('common.actions') || 'Ações'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.title}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {group.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">{group.items.length}</TableCell>
                      <TableCell className="text-right">{group.position || 0}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGroup(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.id, group.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <VariationGroupForm
            initialGroup={editingGroup}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVariationGroups;
