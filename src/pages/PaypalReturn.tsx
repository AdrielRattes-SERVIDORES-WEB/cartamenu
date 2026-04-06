import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

const PaypalReturn = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();
  const { currentUser } = useUser();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleReturn = async () => {
      const token = searchParams.get('token'); // PayPal order ID
      if (!token) {
        toast.error('Parâmetros de pagamento inválidos');
        navigate(slug ? `/${slug}/checkout` : '/checkout');
        return;
      }

      const raw = sessionStorage.getItem('paypal_pending_order');
      if (!raw) {
        toast.error('Dados do pedido não encontrados');
        navigate(slug ? `/${slug}/checkout` : '/checkout');
        return;
      }

      const pending = JSON.parse(raw);

      try {
        // Capture the PayPal order
        const { data: captureData, error: captureError } = await supabase.functions.invoke('capture-paypal-order', {
          body: {
            paypalOrderId: token,
            orderId: null, // will update after DB insert
            tenantId: pending.tenantId,
          }
        });

        if (captureError || !captureData?.success) {
          throw new Error(captureData?.error || 'Captura PayPal falhou');
        }

        // Create user if not logged in
        let effectiveUserId = currentUser?.id;
        if (!effectiveUserId) {
          const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          const { data: signupData } = await supabase.auth.signUp({
            email: pending.formData.email,
            password: tempPassword,
            options: { data: { name: pending.formData.name } },
          });
          effectiveUserId = signupData?.user?.id;
          if (effectiveUserId) {
            await supabase.from('profiles').upsert({
              id: effectiveUserId,
              name: pending.formData.name,
              email: pending.formData.email,
              phone: pending.formData.phone,
            });
          }
        }

        // Insert order into DB
        const { data: insertedOrders, error: orderError } = await supabase
          .from('orders')
          .insert([{
            user_id: effectiveUserId || null,
            tenant_id: pending.tenantId || null,
            items: pending.cartItems.map((item: any) => ({
              product_id: item.productId,
              name: item.name,
              quantity: item.quantity,
              unit_price: item.price,
              total_price: item.totalPrice,
              selected_options: item.selectedOptions,
            })),
            address: {
              street: pending.formData.street,
              number: pending.formData.number,
              neighborhood: pending.formData.neighborhood,
              city: pending.formData.city,
              state: pending.formData.state,
              zipCode: pending.formData.zipCode,
              customer_name: pending.formData.name,
              customer_email: pending.formData.email,
              customer_phone: pending.formData.phone,
            },
            total: pending.total,
            delivery_fee: pending.deliveryFee,
            status: 'processing',
            payment_intent_id: token,
          }])
          .select()
          .limit(1);

        if (orderError) throw new Error(orderError.message);

        // Update the PayPal capture with the real order ID
        if (insertedOrders?.[0]?.id) {
          await supabase
            .from('orders')
            .update({ status: 'processing' })
            .eq('id', insertedOrders[0].id);
        }

        sessionStorage.removeItem('paypal_pending_order');
        setStatus('success');
        toast.success('Pagamento confirmado! Pedido realizado com sucesso.');

        // Send confirmation email (non-blocking)
        if (insertedOrders?.[0]) {
          supabase.functions.invoke('send-email', {
            body: {
              type: 'order_confirmation',
              data: {
                customerName: pending.formData.name,
                customerEmail: pending.formData.email,
                orderId: insertedOrders[0].id,
                total: pending.total,
                items: pending.cartItems,
                storeName: pending.storeName,
              }
            }
          }).catch(() => {});
        }

        navigate('/customer/orders');
      } catch (err: any) {
        console.error('Erro ao processar retorno PayPal:', err);
        setStatus('error');
        toast.error(err.message || 'Erro ao confirmar pagamento');
        setTimeout(() => navigate(slug ? `/${slug}/checkout` : '/checkout'), 3000);
      }
    };

    handleReturn();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Confirmando pagamento...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✓</div>
            <p className="text-lg font-medium text-green-600">Pagamento confirmado!</p>
            <p className="text-gray-500">Redirecionando...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">✗</div>
            <p className="text-lg font-medium text-red-600">Erro ao confirmar pagamento</p>
            <p className="text-gray-500">Redirecionando para o checkout...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaypalReturn;
