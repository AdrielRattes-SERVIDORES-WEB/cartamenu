import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/contexts/StoreContext';
import { useTenant } from '@/contexts/TenantContext';
import { formatCurrency } from '@/lib/utils';

interface ProductWithOrder {
  id: string;
  name: string;
  price: number;
  position: number;
  image_url?: string;
}

const AdminMenuOrdering = () => {
  const { t } = useTranslation();
  const { storeInfo } = useStore();
  const { tenantId } = useTenant();
  const [products, setProducts] = useState<ProductWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [tenantId]);

  const fetchProducts = async () => {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, position, image_url')
        .eq('tenant_id', tenantId)
        .order('position', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      setProducts(data || []);
      setHasChanges(false);
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;

    const updated = [...products];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;

    // Update positions
    updated.forEach((product, i) => {
      product.position = i;
    });

    setProducts(updated);
    setHasChanges(true);
  };

  const handleMoveDown = (index: number) => {
    if (index === products.length - 1) return;

    const updated = [...products];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;

    // Update positions
    updated.forEach((product, i) => {
      product.position = i;
    });

    setProducts(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const updates = products.map((product, index) => ({
        id: product.id,
        position: index
      }));

      // Use Promise.all to update all products in parallel
      await Promise.all(
        updates.map(update =>
          supabase
            .from('products')
            .update({ position: update.position })
            .eq('id', update.id)
            .eq('tenant_id', tenantId!)
        )
      );

      toast.success('Ordem do cardápio salva com sucesso!');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(t('common.error') + ': ' + error.message);
    }
  };

  const handleCancel = () => {
    fetchProducts();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('variation_group.menuOrdering')}</CardTitle>
                  <CardDescription>{t('variation_group.menuOrderingDescription')}</CardDescription>
                </div>
                {hasChanges && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>
                      {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSave}>
                      {t('common.save')}
                    </Button>
                  </div>
                )}
        </CardHeader>

        <CardContent className="space-y-2">
          {products.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nenhum produto cadastrado</p>
          ) : (
            <div className="space-y-2 border rounded-lg overflow-hidden">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-gray-400 flex-shrink-0" />

                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(product.price, storeInfo.currency ?? 'EUR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === products.length - 1}
                      className="h-8 w-8 p-0"
                    >
                        toast.success(t('variation_group.menuOrderingSaved') || 'Ordem do cardápio salva com sucesso!');
                    </Button>
                  </div>

                  <div className="text-xs font-medium text-gray-500 w-8 text-right">
                    {index + 1}º
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMenuOrdering;
