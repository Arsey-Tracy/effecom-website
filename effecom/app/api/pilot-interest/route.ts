type PilotInterest = {
  name?: string;
  contactMethod: "email" | "phone";
  contact: string;
  district?: string;
  communicationPreference?: string;
  consent: true;
};

const communicationPreferences = new Set([
  "Uganda Sign Language",
  "Written text",
  "Captions",
  "Another method",
  "Not sure yet",
]);

function isOptionalText(value: unknown, maxLength: number): value is string | undefined {
  return (
    value === undefined ||
    (typeof value === "string" && value.trim().length <= maxLength)
  );
}

function isPilotInterest(value: unknown): value is PilotInterest {
  if (typeof value !== "object" || value === null) return false;

  const body = value as Record<string, unknown>;
  if (
    (body.contactMethod !== "email" && body.contactMethod !== "phone") ||
    typeof body.contact !== "string" ||
    body.contact.length > 254 ||
    body.consent !== true ||
    !isOptionalText(body.name, 100) ||
    !isOptionalText(body.district, 100) ||
    (body.communicationPreference !== undefined &&
      (typeof body.communicationPreference !== "string" ||
        !communicationPreferences.has(body.communicationPreference)))
  ) {
    return false;
  }

  const contact = body.contact.trim();
  if (body.contactMethod === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  }
  const digits = contact.replace(/\D/g, "");
  return (
    /^\+?[0-9\s().-]{7,25}$/.test(contact) &&
    digits.length >= 7 &&
    digits.length <= 20
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "The form data could not be read. Please check your entries." },
      { status: 400 },
    );
  }

  if (!isPilotInterest(body)) {
    return Response.json(
      { error: "Please check the required contact and consent fields." },
      { status: 400 },
    );
  }

  const endpoint = process.env.EFFECOM_REGISTRATION_ENDPOINT;
  if (!endpoint) {
    return Response.json(
      {
        error:
          "Registration is not connected yet. Your details were not submitted.",
      },
      { status: 503 },
    );
  }

  let destination: URL;
  try {
    destination = new URL(endpoint);
  } catch {
    return Response.json(
      { error: "Registration is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const isLocalDevelopment =
    destination.hostname === "localhost" ||
    destination.hostname === "127.0.0.1";
  if (
    destination.protocol !== "https:" &&
    !(isLocalDevelopment && destination.protocol === "http:")
  ) {
    return Response.json(
      { error: "Registration is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }

  const headers = new Headers({ "Content-Type": "application/json" });
  const apiKey = process.env.EFFECOM_REGISTRATION_API_KEY;
  if (apiKey) {
    try {
      headers.set("Authorization", `Bearer ${apiKey}`);
    } catch {
      return Response.json(
        { error: "Registration is temporarily unavailable. Please try again later." },
        { status: 503 },
      );
    }
  }

  const payload = {
    name: body.name?.trim() || undefined,
    contact_method: body.contactMethod,
    contact: body.contact.trim(),
    district: body.district?.trim() || undefined,
    communication_preference: body.communicationPreference,
    consent: body.consent,
  };

  try {
    const response = await fetch(destination, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return Response.json(
        {
          error:
            "The registration service could not receive your interest. Please try again later.",
        },
        { status: 502 },
      );
    }
  } catch {
    return Response.json(
      {
        error:
          "The registration service could not be reached. Your interest was not confirmed as received.",
      },
      { status: 502 },
    );
  }

  return Response.json({ received: true }, { status: 200 });
}
