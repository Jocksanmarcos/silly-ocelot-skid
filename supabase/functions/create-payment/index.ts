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
    const { event, userDetails } = await req.json();
    const { event_id, title, price } = event;
    const { full_name, email } = userDetails;

    if (!event_id || !title || !price || !full_name || !email) {
      return new Response(JSON.stringify({ error: "Dados incompletos." }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 1. Create a pending registration in our database
    const { data: registration, error: registrationError } = await supabaseAdmin
      .from('event_registrations')
      .insert({
        event_id,
        full_name,
        email,
        status: 'pending',
      })
      .select()
      .single();

    if (registrationError) {
      throw new Error(`Erro ao criar inscrição: ${registrationError.message}`);
    }

    const MERCADO_PAGO_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!MERCADO_PAGO_ACCESS_TOKEN) {
        throw new Error("A chave de acesso do Mercado Pago não foi configurada.");
    }

    // 2. Create a payment preference in Mercado Pago
    const preference = {
      items: [
        {
          title: title,
          quantity: 1,
          unit_price: price,
        },
      ],
      payer: {
        name: full_name,
        email: email,
      },
      back_urls: {
        success: `${Deno.env.get('SITE_URL')}/payment/success`,
        failure: `${Deno.env.get('SITE_URL')}/payment/failure`,
        pending: `${Deno.env.get('SITE_URL')}/payment/pending`,
      },
      auto_return: "approved",
      external_reference: registration.id, // Link payment to our registration ID
    };

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    if (!mpResponse.ok) {
      const errorBody = await mpResponse.json();
      console.error("Erro do Mercado Pago:", errorBody);
      throw new Error("Falha ao criar preferência de pagamento.");
    }

    const responseData = await mpResponse.json();

    return new Response(JSON.stringify({ preferenceId: responseData.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});