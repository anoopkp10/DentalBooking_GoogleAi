import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Appointment = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  service?: { name?: string };
};

type ClinicSettings = {
  clinic_name: string;
  clinic_email: string;
  clinic_phone: string;
  clinic_address: string;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
  dateStyle: 'long',
});

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

async function sendEmail(appointment: Appointment, clinic: ClinicSettings) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  if (!apiKey || !from) return;

  const serviceName = appointment.service?.name || 'Dental appointment';
  const date = formatDate(appointment.appointment_date);
  const time = `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [appointment.email],
      subject: `Appointment confirmation - ${clinic.clinic_name}`,
      html: `<h2>Appointment confirmed</h2><p>Hello ${escapeHtml(appointment.full_name)},</p><p>Your appointment at <strong>${escapeHtml(clinic.clinic_name)}</strong> is confirmed.</p><ul><li><strong>Service:</strong> ${escapeHtml(serviceName)}</li><li><strong>Date:</strong> ${date}</li><li><strong>Time:</strong> ${time}</li><li><strong>Address:</strong> ${escapeHtml(clinic.clinic_address)}</li></ul><p>Phone: ${escapeHtml(clinic.clinic_phone)}</p>`,
    }),
  });

  if (!response.ok) throw new Error(`Resend returned ${response.status}`);
}

async function sendWhatsApp(appointment: Appointment, clinic: ClinicSettings) {
  const token = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  const templateName = Deno.env.get('WHATSAPP_TEMPLATE_NAME');
  if (!token || !phoneNumberId || !templateName) return;

  const recipient = appointment.phone.replace(/\D/g, '');
  if (!recipient) return;

  const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: templateName,
        language: { code: Deno.env.get('WHATSAPP_TEMPLATE_LANGUAGE') || 'en_US' },
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: appointment.full_name },
            { type: 'text', text: clinic.clinic_name },
            { type: 'text', text: formatDate(appointment.appointment_date) },
            { type: 'text', text: `${formatTime(appointment.start_time)} - ${formatTime(appointment.end_time)}` },
            { type: 'text', text: appointment.service?.name || 'Dental appointment' },
            { type: 'text', text: clinic.clinic_address },
          ],
        }],
      },
    }),
  });

  if (!response.ok) throw new Error(`WhatsApp Cloud API returned ${response.status}`);
}

serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const { appointment, clinicSettings } = await request.json() as {
      appointment: Appointment;
      clinicSettings: ClinicSettings;
    };

    if (!appointment?.email || !appointment?.phone || !clinicSettings?.clinic_name) {
      return jsonResponse({ error: 'Appointment and clinic details are required' }, 400);
    }

    const results = await Promise.allSettled([
      sendEmail(appointment, clinicSettings),
      sendWhatsApp(appointment, clinicSettings),
    ]);

    return jsonResponse({
      email: results[0].status,
      whatsapp: results[1].status,
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: 'Notification processing failed' }, 500);
  }
});