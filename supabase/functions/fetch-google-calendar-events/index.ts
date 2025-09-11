import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const API_KEY = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    const CALENDAR_ID = Deno.env.get('GOOGLE_CALENDAR_ID');

    if (!API_KEY || !CALENDAR_ID) {
      throw new Error("Google Calendar API Key or Calendar ID is not configured in secrets.");
    }

    const timeMin = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime`;

    const response = await fetch(url);
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Google Calendar API Error:", errorBody);
      throw new Error(`Failed to fetch Google Calendar events: ${errorBody.error.message}`);
    }

    const data = await response.json();
    
    const formattedEvents = data.items.map((item: any) => ({
      id: `google-${item.id}`,
      title: item.summary,
      start: item.start.dateTime || item.start.date,
      end: item.end.dateTime || item.end.date,
      allDay: !!item.start.date,
      extendedProps: {
        googleEvent: true,
        description: item.description,
        location: item.location,
      },
      color: '#34A853', // Google's green color
      editable: false,
    }));

    return new Response(JSON.stringify(formattedEvents), {
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