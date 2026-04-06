import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/Header';
import CartIcon from '@/components/CartIcon';
import { ProductOption } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useStore } from '@/contexts/StoreContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useProductVariationGroups } from '@/hooks/useProductVariationGroups';
import VariationGroupSelect from '@/components/VariationGroupSelect';
import { useTenant } from '@/contexts/TenantContext';

const ProductDetail = () => {
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { storeInfo } = useStore();
  const { tenantId } = useTenant();
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { variantId: string; qty: number }[]>>({});
  const [selectedVariationGroups, setSelectedVariationGroups] = useState<Record<string, string[] | string>>({});
  const [product, setProduct] = useState<any>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { groups: variationGroups } = useProductVariationGroups(id || '');
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        
        if (!id) return;
        
        // Buscar produto (filtrado por tenant se disponível)
        let productQuery = supabase.from('products').select('*, categories (name)').eq('id', id);
        if (tenantId) productQuery = productQuery.eq('tenant_id', tenantId);
        const { data: productData, error: productError } = await productQuery.single();
        
        if (productError) {
          console.error("Error fetching product:", productError);
          toast.error("Erro ao carregar o produto");
          return;
        }
        
        // Buscar opções do produto
        const { data: optionsData, error: optionsError } = await supabase
          .from('product_options')
          .select(`
            *,
            option_variations (*)
          `)
          .eq('product_id', id);
        
        if (optionsError) {
          console.error("Error fetching product options:", optionsError);
        }
        
        if (productData) {
          setProduct({
            id: productData.id,
            name: productData.name,
            description: productData.description || '',
            price: Number(productData.price),
            image: productData.image_url || "https://source.unsplash.com/featured/?food",
            category: productData.categories?.name || "Sem categoria"
          });
          
          // Converter opções para o formato esperado (respeitando possíveis campos do admin)
          const formattedOptions: ProductOption[] = (optionsData || []).map(option => ({
            id: option.id,
            title: option.title,
            required: option.required || false,
            allowMultiple: option.allow_multiple ?? false,
            minSelections: typeof option.min_selections === 'number' ? option.min_selections : undefined,
            maxSelections: typeof option.max_selections === 'number' ? option.max_selections : (option.required ? 1 : undefined),
            variations: (option.option_variations || []).map(variation => ({
              id: variation.id,
              name: variation.name,
              price: Number(variation.price) || 0
            }))
          }));
          
          setProductOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erro ao carregar o produto");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, tenantId]);

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleIncreaseQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };
  
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };
  
  const handleRadioChange = (optionId: string, variationId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: [{ variantId: variationId, qty: 1 }]
    }));
  };
  
  const handleCheckboxChange = (optionId: string, variationId: string, checked: boolean) => {
    setSelectedOptions(prev => {
      const currentSelections = prev[optionId] || [];

      if (checked) {
        // Max selections check
        const option = productOptions.find(o => o.id === optionId);
        if (option?.maxSelections && currentSelections.length >= option.maxSelections) {
          toast.error(t('menu.max_selection_error', { max: option.maxSelections }));
          return prev;
        }
        return {
          ...prev,
          [optionId]: [...currentSelections, { variantId: variationId, qty: 1 }]
        };
      } else {
        return {
          ...prev,
          [optionId]: currentSelections.filter(s => s.variantId !== variationId)
        };
      }
    });
  };

  const changeVariantQty = (optionId: string, variantId: string, delta: number) => {
    setSelectedOptions(prev => {
      const currentSelections = prev[optionId] || [];
      const next = currentSelections.map(s => s.variantId === variantId ? { ...s, qty: Math.max(1, s.qty + delta) } : s);
      return { ...prev, [optionId]: next };
    });
  };
  
  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    let total = product.price;
    
    // Add product options prices
    Object.entries(selectedOptions).forEach(([optionId, selections]) => {
      const option = productOptions.find(opt => opt.id === optionId);
      if (!option) return;

      selections.forEach(sel => {
        const variation = option.variations.find(v => v.id === sel.variantId);
        if (variation) {
          total += variation.price * (sel.qty || 1);
        }
      });
    });

    // Add variation groups prices
    Object.entries(selectedVariationGroups).forEach(([groupId, selected]) => {
      const group = variationGroups.find(g => g.id === groupId);
      if (!group) return;

      const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : []);
      selectedArray.forEach(itemId => {
        const item = group.items.find(i => i.id === itemId);
        if (item) {
          total += item.price;
        }
      });
    });
    
    return total * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Criar objeto com nomes das opções selecionadas para melhor exibição
    const selectedOptionsWithNames: Record<string, string[]> = {};
    Object.entries(selectedOptions).forEach(([optionId, variationIds]) => {
      const option = productOptions.find(opt => opt.id === optionId);
      if (option) {
        selectedOptionsWithNames[option.title] = variationIds.map(sel => {
          const variation = option.variations.find(v => v.id === sel.variantId);
          return variation ? `${variation.name}${sel.qty && sel.qty > 1 ? ` x${sel.qty}` : ''}` : '';
        }).filter(name => name !== '');
      }
    });

    // Add variation groups to selected options
    Object.entries(selectedVariationGroups).forEach(([groupId, selected]) => {
      const group = variationGroups.find(g => g.id === groupId);
      if (!group) return;

      const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : []);
      selectedOptionsWithNames[group.title] = selectedArray.map(itemId => {
        const item = group.items.find(i => i.id === itemId);
        return item ? item.title : '';
      }).filter(name => name !== '');
    });
    
    addToCart({
      id: `${product.id}-${Date.now()}`,
      productId: product.id,
      name: product.name,
      price: calculateTotalPrice() / quantity,
      quantity: quantity,
      image: product.image,
      selectedOptions: selectedOptionsWithNames,
      totalPrice: calculateTotalPrice(),
    });
    
    navigate(slug ? `/${slug}/cart` : '/cart');
  };
  
  const isButtonDisabled = !product || productOptions.some(option => {
    const selections = selectedOptions[option.id] || [];
    if (option.required && selections.length === 0) return true;
    if (option.minSelections && selections.length < option.minSelections) return true;
    if (option.maxSelections && selections.length > option.maxSelections) return true;
    return false;
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header restaurantName={storeInfo.name} showSearch={false} />
        <div className="p-4 text-center">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Header restaurantName={storeInfo.name} showSearch={false} />
        <div className="p-4 text-center">
          <p>{t('common.error')}</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-48">
      <Header 
        restaurantName={storeInfo.name}
        showSearch={false}
        rightContent={<CartIcon />}
      />

      <div className="relative">
        <button 
          className="absolute top-4 left-4 z-10 bg-white rounded-full p-2 shadow-md"
          onClick={handleBack}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="h-72 md:h-96 bg-gray-300 relative">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover rounded-b-xl shadow-lg"
          />
        </div>
      </div>
      
      <div className="bg-white p-6 md:p-10 rounded-b-3xl -mt-10 relative z-10 shadow">
        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
        {product.description && (
          <p className="text-gray-700 mt-3 text-base md:text-lg">
            {product.description}
          </p>
        )}
        <p className="mt-2 font-semibold text-xl">
          {t('menu.from')} {formatCurrency(product.price, storeInfo.currency ?? 'EUR')}
        </p>
      </div>
      
      {productOptions.length > 0 && (
        <>
          <div className="h-2 bg-gray-50" />

          <div className="bg-white pb-8">
            {productOptions.map(option => (
              <Card 
                key={option.id} 
                className="mb-6 border-0 shadow-none px-0"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="font-semibold text-lg">{option.title}</h2>
                    {option.required && (
                      <span className="bg-gray-900 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {t('menu.required')}
                      </span>
                    )}
                  </div>
                  <p className="text-base text-gray-500 mb-4">
                    {option.minSelections && option.maxSelections
                      ? t('menu.choose_option_range', { min: option.minSelections, max: option.maxSelections })
                      : option.maxSelections && option.maxSelections > 1
                        ? t('menu.choose_option_up_to', { max: option.maxSelections })
                        : t('menu.choose_option_single')
                    }
                  </p>

                  <div className="space-y-5">
                    {option.variations.map(variation => {
                      const sel = (selectedOptions[option.id] || []).find(s => s.variantId === variation.id);
                      const checked = !!sel;

                      return (
                        <button
                          key={variation.id}
                          type="button"
                          onClick={() => {
                            const multi = option.allowMultiple || (option.maxSelections && option.maxSelections > 1);
                            if (multi) {
                              handleCheckboxChange(
                                option.id,
                                variation.id,
                                !checked
                              );
                            } else {
                              handleRadioChange(option.id, variation.id);
                            }
                          }}
                          className={`
                            flex items-center justify-between w-full 
                            rounded-2xl border-2 transition-all duration-200 shadow 
                            px-6 py-5 text-lg font-semibold
                            ${
                              checked
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/40 text-primary'
                                : 'border-gray-200 bg-gray-50 hover:border-primary/50 hover:bg-primary/5 text-gray-900'
                            }
                            focus:outline-none focus:ring-2 focus:ring-primary/40
                            active:scale-97
                          `}
                        >
                          <div className="flex items-center gap-4">
                            {/* Elemento visual para radio/checkbox */}
                            <span
                              className={`
                                ${option.allowMultiple || (option.maxSelections && option.maxSelections > 1)
                                  ? 'h-7 w-7 rounded-md'
                                  : 'h-7 w-7 rounded-full'
                                }
                                border-2 flex items-center justify-center transition-all
                                mr-2
                                ${
                                  checked
                                    ? 'border-primary bg-primary'
                                    : 'border-gray-300 bg-white'
                                }
                              `}
                            >
                              {checked && (
                                <span
                                  className={`
                                    block ${option.maxSelections && option.maxSelections > 1
                                      ? 'w-4 h-4 rounded-[3px]'
                                      : 'w-4 h-4 rounded-full'
                                    } bg-white`}
                                />
                              )}
                            </span>
                            <span>{variation.name}</span>
                          </div>
                            <div className="flex items-center gap-4">
                              <span className={`${variation.price > 0 ? "text-red-700 font-bold" : "text-gray-500 font-medium"}`}>
                                {variation.price > 0
                                  ? <>+ {formatCurrency(variation.price, storeInfo.currency ?? 'EUR')}</>
                                  : <>{t('menu.free')}</>
                                }
                              </span>

                              {checked && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); changeVariantQty(option.id, variation.id, -1); }}
                                    className="px-3 py-1 bg-gray-100 rounded"
                                    aria-label="Diminuir quantidade"
                                  >
                                    -
                                  </button>
                                  <div className="px-3">{sel?.qty ?? 1}</div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); changeVariantQty(option.id, variation.id, +1); }}
                                    className="px-3 py-1 bg-gray-100 rounded"
                                    aria-label="Aumentar quantidade"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}

            {/* Render Variation Groups */}
            {variationGroups.map(group => (
              <Card 
                key={group.id} 
                className="mb-6 border-0 shadow-none px-0"
              >
                <div className="p-4">
                  <VariationGroupSelect
                    group={group}
                    selected={selectedVariationGroups[group.id] || []}
                    onSelect={(selected) => {
                      setSelectedVariationGroups(prev => ({
                        ...prev,
                        [group.id]: selected
                      }));
                    }}
                    allowMultiple={false}
                    currency={storeInfo.currency}
                  />
                </div>
              </Card>
            ))}
          </div>
          <div className="h-24 md:h-32"></div>
        </>
      )}
      
      <div
        className={`
          fixed bottom-0 left-0 right-0 bg-white border-t p-4
          flex flex-col gap-3 items-stretch z-20 shadow-2xl
          md:flex-row md:items-center md:justify-between md:gap-0
        `}
      >
        <div className="flex items-center border rounded-md self-center md:self-auto">
          <button
            onClick={handleDecreaseQuantity}
            className="px-5 py-3 text-gray-500 text-lg"
            disabled={quantity <= 1}
          >
            <Minus className="h-5 w-5" />
          </button>
          <div className="px-5 py-3 border-x text-lg font-bold">
            {quantity}
          </div>
          <button
            onClick={handleIncreaseQuantity}
            className="px-5 py-3 text-gray-500 text-lg"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <Button
          className={`
            big-btn text-lg py-4 gap-3 rounded-full font-bold
            bg-primary hover:bg-primary/90 text-white transition-all
            w-full mt-3 md:w-auto md:ml-3 md:mt-0
          `}
          disabled={isButtonDisabled}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-6 w-6" />
          {t('menu.addToCart')}
          <span className="ml-1 font-bold">
            {formatCurrency(calculateTotalPrice(), storeInfo.currency ?? 'EUR')}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;
