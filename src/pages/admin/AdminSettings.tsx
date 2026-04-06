import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useStore } from '@/contexts/StoreContext';
import { useTenant } from '@/contexts/TenantContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Settings, Store, Image, Globe } from 'lucide-react';
import StoreAddressForm from "@/components/admin/StoreAddressForm";
import { supabase } from '@/integrations/supabase/client';

const AdminSettings = () => {
  const { storeInfo, updateStoreInfo } = useStore();
  const { tenantId } = useTenant();
  const { t } = useTranslation();
  const [logoPreview, setLogoPreview] = useState<string>(storeInfo.logo || "");
  const [bannerPreview, setBannerPreview] = useState<string>(storeInfo.banner || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'loading' | 'pending_dns' | 'active' | 'error'>('idle');
  const [domainInstructions, setDomainInstructions] = useState('');
  
  const formSchema = z.object({
    name: z.string().min(2, { message: t('admin.settings_page.storeName') }),
    description: z.string().optional(),
    cuisineType: z.string().min(2, { message: t('common.category') }),
    deliveryFee: z.coerce.number().min(0, { message: t('admin.settings_page.deliveryFee') }),
    minOrder: z.coerce.number().min(0, { message: t('checkout.orderSummary') }),
    enableDelivery: z.boolean().default(true),
    enablePickup: z.boolean().default(true),
    currency: z.enum(['EUR']).default('EUR'),
    // Stripe fields
    stripePublishableKey: z.string().optional(),
    stripeSecretKey: z.string().optional(),
    stripeWebhookSecret: z.string().optional(),
    stripeMode: z.enum(['test', 'live']).optional(),
    // PayPal fields
    paypalClientId: z.string().optional(),
    paypalSecret: z.string().optional(),
    paypalMode: z.enum(['sandbox', 'live']).optional(),
    // Theme
    primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  });
  
  type FormData = z.infer<typeof formSchema>;
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: storeInfo.name || "",
      description: storeInfo.description || '',
      cuisineType: storeInfo.cuisineType || "",
      deliveryFee: storeInfo.deliveryFee || 0,
      minOrder: storeInfo.minOrder || 0,
      enableDelivery: storeInfo.enableDelivery ?? true,
      enablePickup: storeInfo.enablePickup ?? true,
      currency: storeInfo.currency ?? 'EUR',
      stripePublishableKey: storeInfo.stripePublishableKey || '',
      stripeSecretKey: storeInfo.stripeSecretKey || '',
      stripeWebhookSecret: storeInfo.stripeWebhookSecret || '',
      stripeMode: (storeInfo.stripeMode as 'test' | 'live') || 'test',
      paypalClientId: storeInfo.paypalClientId || '',
      paypalSecret: storeInfo.paypalSecret || '',
      paypalMode: (storeInfo.paypalMode as 'sandbox' | 'live') || 'sandbox',
      primaryColor: storeInfo.primaryColor || '#FF5500',
    },
  });

  // Reset the form when storeInfo changes
  useEffect(() => {
    form.reset({
      name: storeInfo.name || "",
      description: storeInfo.description || '',
      cuisineType: storeInfo.cuisineType || "",
      deliveryFee: storeInfo.deliveryFee || 0,
      minOrder: storeInfo.minOrder || 0,
      enableDelivery: storeInfo.enableDelivery ?? true,
      enablePickup: storeInfo.enablePickup ?? true,
      currency: storeInfo.currency ?? 'EUR',
      stripePublishableKey: storeInfo.stripePublishableKey || '',
      stripeSecretKey: storeInfo.stripeSecretKey || '',
      stripeWebhookSecret: storeInfo.stripeWebhookSecret || '',
      stripeMode: (storeInfo.stripeMode as 'test' | 'live') || 'test',
      paypalClientId: storeInfo.paypalClientId || '',
      paypalSecret: storeInfo.paypalSecret || '',
      paypalMode: (storeInfo.paypalMode as 'sandbox' | 'live') || 'sandbox',
      primaryColor: storeInfo.primaryColor || '#FF5500',
    });
    setLogoPreview(storeInfo.logo || "");
    setBannerPreview(storeInfo.banner || "");
  }, [storeInfo, form]);
  
  const uploadImageToStorage = async (file: File, type: 'logo' | 'banner'): Promise<string | null> => {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `store-images/${tenantId}-${type}.${ext}`;
      const { error } = await supabase.storage
        .from('products')
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from('products').getPublicUrl(path);
      // Bust cache com timestamp
      return `${data.publicUrl}?t=${Date.now()}`;
    } catch (err: any) {
      toast.error(`Erro ao fazer upload: ${err.message}`);
      return null;
    }
  };

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview imediato com blob URL
    const preview = URL.createObjectURL(file);
    setLogoPreview(preview);
    // Upload para Storage
    const url = await uploadImageToStorage(file, 'logo');
    if (url) {
      setLogoPreview(url);
      updateStoreInfo({ logo: url });
    }
  };

  const handleBannerChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setBannerPreview(preview);
    const url = await uploadImageToStorage(file, 'banner');
    if (url) {
      setBannerPreview(url);
      updateStoreInfo({ banner: url });
    }
  };
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Save store_info fields
      await updateStoreInfo({
        name: data.name,
        description: data.description || "",
        cuisineType: data.cuisineType,
        deliveryFee: Number(data.deliveryFee),
        minOrder: Number(data.minOrder),
        logo: logoPreview,
        banner: bannerPreview,
        enableDelivery: data.enableDelivery,
        enablePickup: data.enablePickup,
        currency: data.currency,
        stripePublishableKey: data.stripePublishableKey || '',
        stripeMode: data.stripeMode || 'test',
        primaryColor: data.primaryColor || '#FF5500',
      });

      // Save PayPal/Stripe secrets to tenants table (never stored in store_info)
      if (tenantId) {
        const tenantUpdates: Record<string, string> = {};
        if (data.paypalClientId !== undefined) tenantUpdates.paypal_client_id = data.paypalClientId || '';
        if (data.paypalSecret !== undefined) tenantUpdates.paypal_secret = data.paypalSecret || '';
        if (data.paypalMode !== undefined) tenantUpdates.paypal_mode = data.paypalMode || 'sandbox';
        if (data.stripeSecretKey !== undefined) tenantUpdates.stripe_secret_key = data.stripeSecretKey || '';
        if (data.stripeWebhookSecret !== undefined) tenantUpdates.stripe_webhook_secret = data.stripeWebhookSecret || '';
        if (Object.keys(tenantUpdates).length > 0) {
          const { error } = await supabase
            .from('tenants')
            .update(tenantUpdates)
            .eq('id', tenantId);
          if (error) throw error;
        }
      }

      toast.success(t('admin.settings_page.settingsSaved'));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t('admin.settings_page.settingsError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleConnectDomain = async () => {
    if (!customDomain || !tenantId) {
      toast.error('Domínio e ID do tenant são necessários');
      return;
    }
    setDomainStatus('loading');
    try {
      const { data, error } = await supabase.functions.invoke('add-custom-domain', {
        body: { domain: customDomain, tenantId },
      });
      if (error) throw error;
      setDomainStatus('pending_dns');
      setDomainInstructions(data.instructions || '');
      toast.success('Domínio enviado para verificação');
    } catch (err: any) {
      setDomainStatus('error');
      toast.error(err.message || 'Erro ao conectar domínio');
    }
  };

  const handleCheckDomainStatus = async () => {
    if (!customDomain) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-domain-status', {
        body: { domain: customDomain },
      });
      if (error) throw error;
      setDomainStatus(data.verified ? 'active' : 'pending_dns');
      toast.info(data.verified ? 'Domínio ativo!' : 'DNS ainda não propagado');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao verificar domínio');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{t('admin.settings_page.title')}</h1>
        <p className="text-gray-500">{t('admin.settings_page.storeInfoDescription')}</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span>{t('admin.settings_page.general')}</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span>{t('admin.settings_page.images')}</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>{t('admin.settings_page.delivery')}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4" fill="currentColor" stroke="none"/></svg>
            <span>Cores</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 7h20M2 12h20M2 17h20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>{t('admin.settings_page.payments')}</span>
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Domínio</span>
          </TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.settings_page.storeInfo')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.storeName')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('admin.settings_page.storeNamePlaceholder')} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cuisineType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.cuisineType')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('admin.settings_page.cuisineTypePlaceholder')} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.cuisineTypeDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.settings_page.storeDescription')}</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              className="min-h-[100px]"
                              placeholder={t('admin.settings_page.storeDescriptionPlaceholder')}
                            />
                          </FormControl>
                          <FormDescription>
                            {t('admin.settings_page.storeDescriptionDescription')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.currency')}</FormLabel>
                        <FormControl>
                          <select className="border rounded h-10 px-3" value="EUR" disabled>
                            <option value="EUR">EUR</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.currencyFixed')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableDelivery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.enableDelivery')}</FormLabel>
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.enableDeliveryDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enablePickup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.enablePickup')}</FormLabel>
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                        </FormControl>
                        <FormDescription>
                          {t('admin.settings_page.enablePickupDescription')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="images">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.settings_page.images')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <FormLabel>{t('admin.settings_page.storeLogo')}</FormLabel>
                    <div className="mt-4">
                      <div className="h-40 w-40 rounded-lg bg-gray-100 overflow-hidden mb-4 mx-auto border-2 border-dashed border-gray-300">
                        {logoPreview ? (
                          <img 
                            src={logoPreview} 
                            alt="Logo preview" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error("Erro ao carregar logo:", e);
                              e.currentTarget.src = "/placeholder.svg"; 
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <Store className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <label 
                          htmlFor="logo-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          <Upload size={18} />
                          <span>{logoPreview ? t('admin.settings_page.changeLogo') : t('admin.settings_page.addLogo')}</span>
                          <Input 
                            id="logo-upload"
                            type="file" 
                            accept="image/*" 
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <FormDescription className="mt-2 text-center">
                        {t('admin.settings_page.logoRecommendation')}
                      </FormDescription>
                    </div>
                  </div>
                  
                  <div>
                    <FormLabel>{t('admin.settings_page.storeBanner')}</FormLabel>
                    <div className="mt-4">
                      <div className="h-40 w-full rounded-lg bg-gray-100 overflow-hidden mb-4 border-2 border-dashed border-gray-300">
                        {bannerPreview ? (
                          <img 
                            src={bannerPreview} 
                            alt="Banner preview" 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error("Erro ao carregar banner:", e);
                              e.currentTarget.src = "/placeholder.svg"; 
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gray-200">
                            <Image className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center">
                        <label 
                          htmlFor="banner-upload"
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          <Upload size={18} />
                          <span>{bannerPreview ? t('admin.settings_page.changeBanner') : t('admin.settings_page.addBanner')}</span>
                          <Input 
                            id="banner-upload"
                            type="file" 
                            accept="image/*" 
                            onChange={handleBannerChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <FormDescription className="mt-2 text-center">
                        {t('admin.settings_page.bannerRecommendation')}
                      </FormDescription>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="delivery">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.settings_page.deliverySettings')}</h2>
                
                <div className="mb-6">
                  <StoreAddressForm />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="deliveryFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.deliveryFee')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0,00"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.minOrder')}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            placeholder="0,00"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="appearance">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-1">Cor principal da loja</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Esta cor é aplicada em botões, links e destaques de toda a loja.
                </p>

                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => {
                    const PRESETS = [
                      { label: 'Laranja',   hex: '#FF5500' },
                      { label: 'Vermelho',  hex: '#E53E3E' },
                      { label: 'Rosa',      hex: '#D53F8C' },
                      { label: 'Roxo',      hex: '#805AD5' },
                      { label: 'Azul',      hex: '#3182CE' },
                      { label: 'Teal',      hex: '#2C7A7B' },
                      { label: 'Verde',     hex: '#38A169' },
                      { label: 'Amarelo',   hex: '#D69E2E' },
                      { label: 'Cinza',     hex: '#4A5568' },
                      { label: 'Preto',     hex: '#1A202C' },
                    ];
                    const current = field.value || '#FF5500';
                    return (
                      <FormItem>
                        {/* Swatches */}
                        <div className="flex flex-wrap gap-3 mb-5">
                          {PRESETS.map(p => (
                            <button
                              key={p.hex}
                              type="button"
                              title={p.label}
                              onClick={() => field.onChange(p.hex)}
                              className="relative w-10 h-10 rounded-full transition-transform hover:scale-110 focus:outline-none"
                              style={{ backgroundColor: p.hex }}
                            >
                              {current.toLowerCase() === p.hex.toLowerCase() && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </span>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Custom hex input + color picker */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm font-medium text-gray-700">Cor personalizada</label>
                          <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white w-fit">
                            <input
                              type="color"
                              value={current}
                              onChange={e => field.onChange(e.target.value)}
                              className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                              style={{ WebkitAppearance: 'none' } as any}
                            />
                            <input
                              type="text"
                              value={current}
                              onChange={e => {
                                const v = e.target.value;
                                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) field.onChange(v);
                              }}
                              className="w-24 text-sm font-mono border-0 outline-none"
                              placeholder="#FF5500"
                              maxLength={7}
                            />
                          </div>
                        </div>

                        {/* Live preview */}
                        <div className="mt-6">
                          <p className="text-sm font-medium text-gray-700 mb-3">Pré-visualização</p>
                          <div className="flex flex-wrap gap-3 items-center">
                            <button
                              type="button"
                              className="px-5 py-2 rounded-xl text-white text-sm font-semibold shadow-sm"
                              style={{ backgroundColor: current }}
                            >
                              Adicionar ao carrinho
                            </button>
                            <button
                              type="button"
                              className="px-5 py-2 rounded-xl text-sm font-semibold border-2"
                              style={{ borderColor: current, color: current }}
                            >
                              Ver cardápio
                            </button>
                            <span
                              className="text-sm font-semibold underline"
                              style={{ color: current }}
                            >
                              Link de exemplo
                            </span>
                          </div>
                        </div>

                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">{t('admin.settings_page.paymentsSettings')}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="stripePublishableKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.stripePublishableKey')}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t('admin.settings_page.stripePublishableKeyPlaceholder')} />
                        </FormControl>
                        <FormDescription>{t('admin.settings_page.stripePublishableKeyDescription')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stripeSecretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.stripeSecretKey')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder={t('admin.settings_page.stripeSecretKeyPlaceholder')} />
                        </FormControl>
                        <FormDescription>{t('admin.settings_page.stripeSecretKeyDescription')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stripeWebhookSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.stripeWebhookSecret')}</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder={t('admin.settings_page.stripeWebhookSecretPlaceholder')} />
                        </FormControl>
                        <FormDescription>{t('admin.settings_page.stripeWebhookSecretDescription')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stripeMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('admin.settings_page.stripeMode')}</FormLabel>
                        <FormControl>
                          <select {...field} className="border rounded h-10 px-3">
                            <option value="test">{t('admin.settings_page.stripeModeTest')}</option>
                            <option value="live">{t('admin.settings_page.stripeModeLive')}</option>
                          </select>
                        </FormControl>
                        <FormDescription>{t('admin.settings_page.stripeModeDescription')}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <hr className="my-6" />
                <h3 className="text-base font-semibold mb-4">PayPal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="paypalClientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PayPal Client ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="AXxx..." />
                        </FormControl>
                        <FormDescription>Client ID da sua aplicação PayPal</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paypalSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PayPal Secret</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} placeholder="Secret da aplicação PayPal" />
                        </FormControl>
                        <FormDescription>Secret da sua aplicação PayPal</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paypalMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modo PayPal</FormLabel>
                        <FormControl>
                          <select {...field} className="border rounded h-10 px-3">
                            <option value="sandbox">Sandbox (teste)</option>
                            <option value="live">Live (produção)</option>
                          </select>
                        </FormControl>
                        <FormDescription>Use sandbox para testes, live para cobranças reais</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="domain">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-2">Domínio Customizado</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Conecte seu próprio domínio à sua loja CartaMenu.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Seu domínio</label>
                    <Input
                      value={customDomain}
                      onChange={e => setCustomDomain(e.target.value)}
                      placeholder="meurestaurante.com.br"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleConnectDomain}
                      disabled={domainStatus === 'loading' || !customDomain}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {domainStatus === 'loading' ? 'Conectando...' : 'Conectar domínio'}
                    </Button>
                    {(domainStatus === 'pending_dns' || domainStatus === 'active') && (
                      <Button type="button" variant="outline" onClick={handleCheckDomainStatus}>
                        Verificar status
                      </Button>
                    )}
                  </div>

                  {domainStatus === 'pending_dns' && (
                    <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4 text-sm space-y-2">
                      <p className="font-medium text-yellow-800">Aguardando propagação DNS</p>
                      <p className="text-yellow-700">
                        Adicione o seguinte registro no painel DNS do seu domínio:
                      </p>
                      <div className="bg-white rounded border border-yellow-100 p-3 font-mono text-xs">
                        <div><span className="text-gray-500">Tipo:</span> CNAME</div>
                        <div><span className="text-gray-500">Nome:</span> {customDomain}</div>
                        <div><span className="text-gray-500">Valor:</span> cname.vercel-dns.com</div>
                      </div>
                      {domainInstructions && (
                        <p className="text-yellow-700 text-xs">{domainInstructions}</p>
                      )}
                    </div>
                  )}

                  {domainStatus === 'active' && (
                    <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm">
                      <p className="font-medium text-green-800">Domínio ativo!</p>
                      <p className="text-green-700">Seu domínio {customDomain} está configurado e funcionando.</p>
                    </div>
                  )}

                  {domainStatus === 'error' && (
                    <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm">
                      <p className="font-medium text-red-800">Erro ao conectar domínio</p>
                      <p className="text-red-700">Verifique se o domínio é válido e tente novamente.</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? t('admin.settings_page.saving') : t('admin.settings_page.saveAllSettings')}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
