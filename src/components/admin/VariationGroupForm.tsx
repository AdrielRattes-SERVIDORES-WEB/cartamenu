import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { VariationGroup } from '@/types/product';

const variationGroupSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  position: z.coerce.number().default(0),
  items: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Nome do item é obrigatório'),
    price: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
    sku: z.string().optional(),
    position: z.coerce.number().default(0)
  })).min(1, 'Adicione pelo menos um item')
});

type VariationGroupFormData = z.infer<typeof variationGroupSchema>;

interface VariationGroupFormProps {
  initialGroup?: VariationGroup | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const VariationGroupForm: React.FC<VariationGroupFormProps> = ({
  initialGroup,
  onSuccess,
  onCancel
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VariationGroupFormData>({
    resolver: zodResolver(variationGroupSchema),
    defaultValues: initialGroup ? {
      title: initialGroup.title,
      description: initialGroup.description,
      position: initialGroup.position || 0,
      items: initialGroup.items
    } : {
      title: '',
      description: '',
      position: 0,
      items: [{ id: '', title: '', price: 0, sku: '', position: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items'
  });

  const onSubmit = async (data: VariationGroupFormData) => {
    setIsLoading(true);
    try {
      if (initialGroup) {
        // Update existing group
        const { error: updateError } = await supabase
          .from('variation_groups')
          .update({
            title: data.title,
            description: data.description,
            position: data.position
          })
          .eq('id', initialGroup.id);

        if (updateError) throw updateError;

        // Delete old items and create new ones
        const { error: deleteError } = await supabase
          .from('variation_group_items')
          .delete()
          .eq('group_id', initialGroup.id);

        if (deleteError) throw deleteError;

        // Insert new items
        const itemsToInsert = data.items.map((item, index) => ({
          group_id: initialGroup.id,
          title: item.title,
          price: item.price,
          sku: item.sku || null,
          position: index
        }));

        const { error: insertError } = await supabase
          .from('variation_group_items')
          .insert(itemsToInsert);

        if (insertError) throw insertError;

        toast.success('Grupo atualizado com sucesso!');
      } else {
        // Create new group
        const { data: groupData, error: groupError } = await supabase
          .from('variation_groups')
          .insert({
            title: data.title,
            description: data.description,
            position: data.position
          })
          .select()
          .single();

        if (groupError) throw groupError;

        // Insert items
        const itemsToInsert = data.items.map((item, index) => ({
          group_id: groupData.id,
          title: item.title,
          price: item.price,
          sku: item.sku || null,
          position: index
        }));

        const { error: insertError } = await supabase
          .from('variation_group_items')
          .insert(itemsToInsert);

        if (insertError) throw insertError;

        toast.success('Grupo criado com sucesso!');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar grupo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {initialGroup ? t('variation_group.editGroup') : t('variation_group.newGroup')}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do Grupo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Extras, Bebidas, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrição opcional do grupo"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Position */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posição</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>{t('variation_group.itemsLabel')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Item Title */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Calabresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item Price */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              step="0.01"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item SKU */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: CAL001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Item Position */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.position`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posição</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={String(index)}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Remove Button */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('variation_group.removeItem')}
                    </Button>
                  )}
                </div>
              ))}

              {/* Add Item Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ id: '', title: '', price: 0, sku: '', position: fields.length })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('variation_group.addItem')}
              </Button>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VariationGroupForm;
