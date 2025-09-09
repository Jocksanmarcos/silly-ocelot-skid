import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const notification = await req.json();

    if (notification.type === 'payment' && notification.data?.id) {
      const paymentId = notification.data.id;
      
      const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      if (!MERCADO_PAGO_ACCESS_TOKEN) {
          throw new Error("A chave de acesso do Mercado Pago não foi configurada.");
      }

      // Fetch payment details from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      });

      if (!mpResponse.ok) {
        throw new Error(`Falha ao buscar dados do pagamento: ${paymentId}`);
      }

      const payment = await mpResponse.json();

      // If payment is approved, update our database
      if (payment.status === 'approved' && payment.external_reference) {
        const registrationId = payment.external_reference;

        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { error } = await supabaseAdmin
          .from('event_registrations')
          .update({ status: 'confirmed', payment_id: payment.id })
          .eq('id', registrationId);

        if (error) {
          throw new Error(`Erro ao atualizar inscrição ${registrationId}: ${error.message}`);
        }
        console.log(`Inscrição ${registrationId} confirmada com sucesso.`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Erro no webhook:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});