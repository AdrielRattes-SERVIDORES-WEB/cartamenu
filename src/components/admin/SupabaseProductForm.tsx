import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { ProductOptionDB, OptionVariationDB } from '@/types/product';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTenant } from '@/contexts/TenantContext';
import ProductVariationGroups from './ProductVariationGroups';

// Esquema Zod para opções do produto (variantes)
const productOptionSchemaBase = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: 'Título da opção é obrigatório' }),
  required: z.boolean().default(false),
  allowMultiple: z.boolean().default(false),
  minSelections: z.number().int().min(0, { message: 'Mínimo deve ser 0 ou maior' }).nullable().optional(),
  maxSelections: z.number().int().min(0, { message: 'Máximo deve ser 0 ou maior' }).nullable().optional(),
  variations: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, { message: 'Nome da variante é obrigatório' }),
    price: z.preprocess(
      (val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
      z.number().min(0, { message: 'Preço deve ser maior ou igual a zero.' })
    ),
  })).min(1, { message: 'Adicione ao menos uma variante' })
});

const productOptionSchema = productOptionSchemaBase.superRefine((opt, ctx) => {
  if (typeof opt.minSelections === 'number' && typeof opt.maxSelections === 'number') {
    if (opt.maxSelections < opt.minSelections) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Máximo deve ser maior ou igual ao mínimo',
        path: ['maxSelections'],
      });
    }
  }
});

// Esquema Zod para validação do formulário de produto
const productFormSchema = z.object({
  name: z.string().min(3, { message: "Nome do produto deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val),
    z.number().min(0.01, { message: "Preço deve ser maior que zero." })
  ),
  category_id: z.string().uuid({ message: "Selecione uma categoria válida." }),
  image_url: z.string().url({ message: "URL da imagem inválida." }).optional().or(z.literal('')),
  popular: z.boolean().default(false),
  vegetarian: z.boolean().default(false),
  product_options: z.array(productOptionSchema).optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface SupabaseProductFormProps {
  product?: Tables<'products'> | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SupabaseProductForm: React.FC<SupabaseProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [categories, setCategories] = useState<Tables<'categories'>[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOptionDB[]>([]);
  const { t } = useTranslation();
  const { tenantId } = useTenant();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price ? Number(product.price) : 0,
      category_id: product?.category_id || '',
      image_url: product?.image_url || '',
      popular: product?.popular || false,
      vegetarian: product?.vegetarian || false,
      product_options: [],
    },
  });

  const draftKey = product?.id ? `productFormDraft:${product.id}` : 'productFormDraft:new';

  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw);
        form.reset({
          name: draft.name ?? '',
          description: draft.description ?? '',
          price: typeof draft.price === 'number' ? draft.price : 0,
          category_id: draft.category_id ?? '',
          image_url: draft.image_url ?? '',
          popular: !!draft.popular,
          vegetarian: !!draft.vegetarian,
          product_options: Array.isArray(draft.product_options) ? draft.product_options : [],
        });
      }
    } catch {}
    // eslint-disable-next-line
  }, [product?.id]);

  useEffect(() => {
    const sub = form.watch((values) => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(values));
      } catch {}
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line
  }, [draftKey]);

  // Setup for dynamic field arrays for product options and variations
  const { fields: optionsFields, append: appendOption, remove: removeOption } = 
    useFieldArray({
      name: "product_options",
      control: form.control,
    });

  useEffect(() => {
    const fetchCategories = async () => {
      let query = supabase.from('categories').select('*').order('name');
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) {
        toast.error("Erro ao buscar categorias.");
        console.error(error);
      } else {
        setCategories(data || []);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProductOptions = async () => {
      if (!product?.id) return;
      
      try {
        const { data: optionsData, error: optionsError } = await supabase
          .from('product_options')
          .select('*')
          .eq('product_id', product.id)
          .order('title');
        
        if (optionsError) throw optionsError;
        
        if (!optionsData || optionsData.length === 0) {
          setProductOptions([]);
          form.setValue('product_options', []);
          return;
        }
        
        const optionsWithVariations: ProductOptionDB[] = [];
        
        for (const option of optionsData) {
          const { data: variationsData, error: variationsError } = await supabase
            .from('option_variations')
            .select('*')
            .eq('option_id', option.id)
            .order('name');
          
          if (variationsError) throw variationsError;
          
          optionsWithVariations.push({
            ...option,
            option_variations: variationsData || []
          });
        }
        
        setProductOptions(optionsWithVariations);
        
        // Transform data for form
        const formattedOptions = optionsWithVariations.map((option) => ({
          id: option.id,
          title: option.title,
          required: option.required,
          allowMultiple: option.allow_multiple ?? false,
          minSelections: typeof option.min_selections === 'number' ? option.min_selections : undefined,
          maxSelections: typeof option.max_selections === 'number' ? option.max_selections : undefined,
          variations: option.option_variations ? option.option_variations.map((variation) => ({
            id: variation.id,
            name: variation.name,
            price: Number(variation.price || 0),
          })) : []
        }));
        
        form.setValue('product_options', formattedOptions);
      } catch (error: any) {
        toast.error("Erro ao buscar opções do produto: " + error.message);
        console.error(error);
      }
    };
    
    fetchProductOptions();
  }, [product, form]);

  useEffect(() => {
    // Reset form if product prop changes
    form.reset({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price ? Number(product.price) : 0,
      category_id: product?.category_id || '',
      image_url: product?.image_url || '',
      popular: product?.popular || false,
      vegetarian: product?.vegetarian || false,
    });
  }, [product, form]);

  const addOption = () => {
    appendOption({ 
      title: '',
      required: false,
      allowMultiple: false,
      minSelections: undefined,
      maxSelections: undefined,
      variations: [{ name: '', price: 0 }]
    });
  };

  const addVariation = (optionIndex: number) => {
    const currentOptions = form.getValues().product_options || [];
    if (!currentOptions[optionIndex]) return;
    
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex].variations.push({ name: '', price: 0 });
    
    form.setValue('product_options', updatedOptions);
  };

  const removeVariation = (optionIndex: number, variationIndex: number) => {
    const currentOptions = form.getValues().product_options || [];
    if (!currentOptions[optionIndex]) return;
    
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex].variations.splice(variationIndex, 1);
    
    form.setValue('product_options', updatedOptions);
  };

  const onSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // First, insert/update the product
      let productId = product?.id;
      
      if (product && product.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category_id: formData.category_id,
            image_url: formData.image_url,
            popular: formData.popular,
            vegetarian: formData.vegetarian
          })
          .eq('id', product.id)
          .eq('tenant_id', tenantId!);
          
        if (error) throw error;
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert({
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category_id: formData.category_id,
            image_url: formData.image_url,
            popular: formData.popular,
            vegetarian: formData.vegetarian,
            tenant_id: tenantId,
          })
          .select();
          
        if (error) throw error;
        if (data && data[0]) {
          productId = data[0].id;
        } else {
          throw new Error('Não foi possível obter o ID do produto criado');
        }
      }
      
      // Now handle product options if we have the product ID
      if (productId && formData.product_options && formData.product_options.length > 0) {
        // First, get existing options to compare
        const { data: existingOptions } = await supabase
          .from('product_options')
          .select('id')
          .eq('product_id', productId);
        
        const existingOptionIds = new Set((existingOptions || []).map(o => o.id) || []);
        const newOptionIds = new Set(formData.product_options.filter(o => o.id).map(o => o.id as string));
        
        // Delete options that no longer exist
        const optionsToDelete = [...existingOptionIds].filter(id => !newOptionIds.has(id));
        if (optionsToDelete.length > 0) {
          const { error } = await supabase
            .from('product_options')
            .delete()
            .in('id', optionsToDelete);
            
          if (error) throw error;
        }
        
        // Process each option
        for (const option of formData.product_options) {
            if (option.id) {
            // Update existing option
            const { error } = await supabase
              .from('product_options')
              .update({
                title: option.title,
                required: option.required,
                allow_multiple: option.allowMultiple ?? false,
                min_selections: option.minSelections ?? null,
                max_selections: option.maxSelections ?? null,
              })
              .eq('id', option.id);
              
            if (error) throw error;
            
            // Get existing variations
            const { data: existingVariations } = await supabase
              .from('option_variations')
              .select('id')
              .eq('option_id', option.id);
              
            const existingVariationIds = new Set((existingVariations || []).map(v => v.id) || []);
            const newVariationIds = new Set(option.variations.filter(v => v.id).map(v => v.id as string));
            
            // Delete variations that no longer exist
            const variationsToDelete = [...existingVariationIds].filter(id => !newVariationIds.has(id));
            if (variationsToDelete.length > 0) {
              const { error } = await supabase
                .from('option_variations')
                .delete()
                .in('id', variationsToDelete);
                
              if (error) throw error;
            }
            
            // Update or insert variations
            for (const variation of option.variations) {
              if (variation.id) {
                // Update existing variation
                const { error } = await supabase
                  .from('option_variations')
                  .update({
                    name: variation.name,
                    price: variation.price
                  })
                  .eq('id', variation.id);
                  
                if (error) throw error;
              } else {
                // Insert new variation
                const { error } = await supabase
                  .from('option_variations')
                  .insert({
                    option_id: option.id,
                    name: variation.name,
                    price: variation.price
                  });
                  
                if (error) throw error;
              }
            }
          } else {
            // Insert new option
            const { data: newOption, error } = await supabase
              .from('product_options')
              .insert({
                product_id: productId,
                title: option.title,
                required: option.required,
                allow_multiple: option.allowMultiple ?? false,
                min_selections: option.minSelections ?? null,
                max_selections: option.maxSelections ?? null,
              })
              .select();
              
            if (error) throw error;
            
            if (newOption && newOption[0]) {
              // Insert all variations for this new option
              const variationsToInsert = option.variations.map(variation => ({
                option_id: newOption[0].id,
                name: variation.name,
                price: variation.price
              }));
              
              const { error: variationError } = await supabase
                .from('option_variations')
                .insert(variationsToInsert);
                
              if (variationError) throw variationError;
            }
          }
        }
      }
      
      toast.success(`Produto "${formData.name}" ${product ? 'atualizado' : 'criado'} com sucesso!`);
      try { localStorage.removeItem(draftKey); } catch {}
      onSuccess();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(`Erro ao salvar produto: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{product ? t('admin.products_page.edit' ) || 'Editar Produto' : t('admin.products_page.addProduct') || 'Adicionar Novo Produto'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => { try { localStorage.removeItem(draftKey); } catch {}; onCancel(); }} aria-label="Fechar formulário">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <CardDescription>
          {product ? t('admin.products_page.editDescription') || 'Modifique os detalhes do produto abaixo.' : t('admin.products_page.addDescription') || 'Preencha os detalhes do novo produto.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.products_page.name') || 'Nome do Produto'}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Esfiha de Carne" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detalhes sobre o produto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="9.99" {...field} 
                       onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
                <FormField
                control={form.control}
                name="popular"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Produto Popular?</FormLabel>
                        <FormDescription>
                        Marque se este produto deve ser destacado como popular.
                        </FormDescription>
                    </div>
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="vegetarian"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>Vegetariano?</FormLabel>
                        <FormDescription>
                        Marque se este produto é vegetariano.
                        </FormDescription>
                    </div>
                    </FormItem>
                )}
                />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t('admin.products_page.productOptions') || 'Opções de Produto (Variantes)'}</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addOption}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> {t('admin.products_page.addOption') || 'Adicionar Opção'}
                </Button>
              </div>
              
              {optionsFields.map((optionField, optionIndex) => (
                <div key={optionField.id} className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{t('admin.products_page.optionName') || `Opção ${optionIndex + 1}`}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(optionIndex)}
                      className="h-7 w-7 p-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`product_options.${optionIndex}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.products_page.optionName') || 'Título'}</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Sabores" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`product_options.${optionIndex}.required`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t('menu.required') || 'Obrigatório?'}</FormLabel>
                            <FormDescription>
                              {t('admin.products_page.requiredDescription') || 'O cliente deve escolher pelo menos uma opção'}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`product_options.${optionIndex}.allowMultiple`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>{t('admin.products_page.allowMultipleLabel') || 'Permitir múltiplas seleções?'}</FormLabel>
                            <FormDescription>
                              {t('admin.products_page.allowMultipleDescription') || 'Permite selecionar mais de uma variante nesta opção'}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <FormField
                        control={form.control}
                        name={`product_options.${optionIndex}.minSelections`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mínimo</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`product_options.${optionIndex}.maxSelections`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Máximo</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h5 className="text-sm font-medium">{t('admin.products_page.variations') || 'Variantes'}</h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addVariation(optionIndex)}
                        className="h-7 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> {t('admin.products_page.addVariation') || 'Adicionar Variante'}
                      </Button>
                    </div>
                    
                    {form.getValues().product_options?.[optionIndex]?.variations.map((_, variationIndex) => (
                      <div key={variationIndex} className="flex items-end gap-2 border-b pb-2">
                        <FormField
                          control={form.control}
                          name={`product_options.${optionIndex}.variations.${variationIndex}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel className="text-xs">{t('common.name') || 'Nome'}</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Calabresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`product_options.${optionIndex}.variations.${variationIndex}.price`}
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormLabel className="text-xs">{t('common.price') || 'Preço Adicional'}</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  {...field}
                                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariation(optionIndex, variationIndex)}
                          className="h-8 w-8 rounded-full mb-1"
                          disabled={form.getValues().product_options?.[optionIndex]?.variations.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {optionsFields.length === 0 && (
                <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                  <p>Adicione opções para o produto como sabores, tamanhos, etc.</p>
                </div>
              )}
            </div>

            {/* Variation Groups Section */}
            {product?.id && (
              <Card>
                <CardHeader>
                  <CardTitle>Grupos de Variações Reutilizáveis</CardTitle>
                  <CardDescription>
                    Atribua grupos de variações pré-criados a este produto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductVariationGroups
                    productId={product.id}
                    onGroupsChange={(groups) => {
                      // Groups are managed directly in Supabase, no need to update form
                    }}
                  />
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (product ? 'Salvando...' : 'Criando...') : (product ? 'Salvar Alterações' : 'Criar Produto')}
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SupabaseProductForm;
