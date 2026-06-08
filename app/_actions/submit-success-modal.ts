"use server";

interface SubmitSuccessModalInput {
  email: string;
  first_name: string;
  last_name: string;
  opt_out: boolean;
  zip: string;
  utm_medium: string;
  utm_campaign: string;
  utm_source: string;
  path: string;
}

export async function submitSuccessModal(payload: SubmitSuccessModalInput) {
  const endpoint = process.env.SF_ENDPOINT;

  if (!endpoint) {
    console.error("SF endpoint is not configured (missing SF_ENDPOINT)");
    return { ok: false, error: "missing endpoint" as const };
  }

  const email = payload.email.trim();
  const firstName = payload.first_name.trim();
  const lastName = payload.last_name.trim();
  const zip = payload.zip.trim();
  const path = payload.path.trim();

  const emailValid =/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
  const zipValid = /^\d{5}(?:-\d{4})?$/.test(zip);
  const pathValid = path.startsWith("/");

  if (!emailValid || !firstName || !lastName || !zipValid || !pathValid) {
    return { ok: false, error: "invalid payload" as const };
  }

  const body = {
    ...payload,
    opt_out: payload.opt_out ? "true" : "false",
    date_submitted: new Date().toISOString(),
  };

   const cleanedData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value)
    ) as Record<string, string>

    console.log("Submitting lead with data:", cleanedData);

  try {
    const response = await fetch(endpoint, {
   method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(cleanedData),
      redirect: 'follow',
    });

    if (!response.ok) {
      return {
        ok: false,
        error: "request failed" as const,
        status: response.status,
      };
    }

    return { ok: true };
  } catch (error) {
    console.error("submitSuccessModal failed:", error);
    return { ok: false, error: "network error" as const };
  }
}