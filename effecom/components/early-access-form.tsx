"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteContent } from "@/lib/site-content";

type ContactMethod = "email" | "phone";

type InterestDetails = {
  name: string;
  contactMethod: ContactMethod;
  contact: string;
  district: string;
  communicationPreference: string;
  consent: boolean;
};

type FieldErrors = Partial<Record<keyof InterestDetails, string>>;

const initialValues: InterestDetails = {
  name: "",
  contactMethod: "email",
  contact: "",
  district: "",
  communicationPreference: "",
  consent: false,
};

function validate(values: InterestDetails): FieldErrors {
  const errors: FieldErrors = {};
  const contact = values.contact.trim();

  if (!contact) {
    errors.contact = "Enter the email address or phone number you prefer.";
  } else if (
    values.contactMethod === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
  ) {
    errors.contact = "Enter an email address in a format like name@example.com.";
  } else if (
    values.contactMethod === "phone" &&
    (!/^\+?[0-9\s().-]{7,25}$/.test(contact) ||
      contact.replace(/\D/g, "").length < 7 ||
      contact.replace(/\D/g, "").length > 20)
  ) {
    errors.contact = "Enter a phone number with 7 to 20 digits.";
  }

  if (values.name.trim().length > 100) {
    errors.name = "Keep your name to 100 characters or fewer.";
  }
  if (values.district.trim().length > 100) {
    errors.district = "Keep your location to 100 characters or fewer.";
  }
  if (!values.consent) {
    errors.consent = "Please agree before sending your interest.";
  }

  return errors;
}

export function EarlyAccessForm({
  registrationConfigured,
}: {
  registrationConfigured: boolean | null;
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);
  const [status, setStatus] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  function update<K extends keyof InterestDetails>(
    key: K,
    value: InterestDetails[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setStatus(null);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      document.getElementById(`pilot-${firstInvalid}`)?.focus();
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/pilot-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim() || undefined,
          contactMethod: values.contactMethod,
          contact: values.contact.trim(),
          district: values.district.trim() || undefined,
          communicationPreference: values.communicationPreference || undefined,
          consent: values.consent,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(
          result?.error ??
            "We could not send your interest just now. Please try again later.",
        );
      }

      setStatus({
        kind: "success",
        message:
          "Your interest was received. This does not guarantee pilot participation or provide medical care.",
      });
      setValues(initialValues);
      setErrors({});
    } catch (error) {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "We could not send your interest. Your details have not been confirmed as received.",
      });
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div
        className={
          registrationConfigured
            ? "form-connection form-connection-ready"
            : "form-connection"
        }
        role="status"
      >
        <span className="form-connection-mark" aria-hidden="true">
          {registrationConfigured ? (
            <Check className="size-4" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
        </span>
        <p>
          {registrationConfigured === null
            ? "Checking registration availability. Your details have not been submitted."
            : registrationConfigured
              ? "Registration is connected. Your details will be sent securely to the configured pilot service."
              : "Registration is not connected yet. You can review the form, but your details will not be submitted or stored."}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pilot-name" className="form-label">
            Name or preferred name <span className="optional-label">Optional</span>
          </Label>
          <Input
            id="pilot-name"
            name="name"
            autoComplete="name"
            maxLength={100}
            disabled={registrationConfigured === null}
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "pilot-name-error" : undefined}
            onChange={(event) => update("name", event.target.value)}
            className="form-input"
          />
          {errors.name && (
            <p id="pilot-name-error" className="field-error" role="alert">
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pilot-contact-method" className="form-label">
            Preferred contact method <span aria-hidden="true" className="required-star">*</span>
          </Label>
          <select
            id="pilot-contact-method"
            name="contactMethod"
            disabled={registrationConfigured === null}
            value={values.contactMethod}
            onChange={(event) =>
              update(
                "contactMethod",
                event.target.value === "phone" ? "phone" : "email",
              )
            }
            className="form-select"
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
          </select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="pilot-contact" className="form-label">
            {values.contactMethod === "email" ? "Email address" : "Phone number"}{" "}
            <span aria-hidden="true" className="required-star">*</span>
            <span className="sr-only">Required</span>
          </Label>
          <Input
            id="pilot-contact"
            name="contact"
            type={values.contactMethod === "email" ? "email" : "tel"}
            inputMode={values.contactMethod === "email" ? "email" : "tel"}
            autoComplete={
              values.contactMethod === "email" ? "email" : "tel"
            }
            maxLength={254}
            required
            disabled={registrationConfigured === null}
            value={values.contact}
            aria-invalid={Boolean(errors.contact)}
            aria-describedby={
              errors.contact ? "pilot-contact-error" : undefined
            }
            onChange={(event) => update("contact", event.target.value)}
            className="form-input"
          />
          {errors.contact && (
            <p id="pilot-contact-error" className="field-error" role="alert">
              {errors.contact}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pilot-district" className="form-label">
            District or general location{" "}
            <span className="optional-label">Optional</span>
          </Label>
          <Input
            id="pilot-district"
            name="district"
            autoComplete="address-level2"
            maxLength={100}
            disabled={registrationConfigured === null}
            value={values.district}
            aria-invalid={Boolean(errors.district)}
            aria-describedby={
              errors.district ? "pilot-district-error" : undefined
            }
            onChange={(event) => update("district", event.target.value)}
            className="form-input"
          />
          {errors.district && (
            <p id="pilot-district-error" className="field-error" role="alert">
              {errors.district}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="pilot-preference" className="form-label">
            Communication preference{" "}
            <span className="optional-label">Optional</span>
          </Label>
          <select
            id="pilot-preference"
            name="communicationPreference"
            disabled={registrationConfigured === null}
            value={values.communicationPreference}
            onChange={(event) =>
              update("communicationPreference", event.target.value)
            }
            className="form-select"
          >
            <option value="">Choose if you wish</option>
            <option value="Uganda Sign Language">Uganda Sign Language</option>
            <option value="Written text">Written text</option>
            <option value="Captions">Captions</option>
            <option value="Another method">Another method</option>
            <option value="Not sure yet">Not sure yet</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-white p-4">
          <Checkbox
            id="pilot-consent"
            checked={values.consent}
            disabled={registrationConfigured === null}
            aria-labelledby="pilot-consent-label"
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? "pilot-consent-error" : undefined}
            onCheckedChange={(checked) => update("consent", checked === true)}
            className="mt-0.5 size-5 rounded border-[var(--line-strong)] data-checked:border-[var(--forest)] data-checked:bg-[var(--forest)]"
          />
          <p id="pilot-consent-label" className="text-sm leading-6 text-[var(--ink-soft)]">
            I agree to be contacted about Effecom&apos;s pilot and understand
            that registering my interest does not guarantee participation or
            provide medical care.{" "}
            <span aria-hidden="true" className="required-star">*</span>
            <span className="sr-only">Required.</span>
          </p>
        </div>
        {errors.consent && (
          <p id="pilot-consent-error" className="field-error" role="alert">
            {errors.consent}
          </p>
        )}
        <p className="form-privacy-copy">
          Your details are only for responding to your interest. Read our{" "}
          <a className="text-link" href={siteContent.links.privacy}>
            draft privacy notice
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || registrationConfigured === null}
          className="min-h-12 rounded-full bg-[var(--forest)] px-6 text-base font-semibold text-white hover:bg-[var(--forest-deep)]"
        >
          {isSubmitting
            ? "Sending…"
            : registrationConfigured === null
              ? "Checking…"
              : "Register My Interest"}
          {!isSubmitting && registrationConfigured !== null && (
            <ArrowRight aria-hidden="true" className="size-4" />
          )}
        </Button>
        <Badge className="w-fit rounded-full border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-xs font-medium text-[var(--ink-soft)] shadow-none">
          No medical details needed
        </Badge>
      </div>

      <div
        className="min-h-6 text-sm leading-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {status && (
          <p
            className={
              status.kind === "success" ? "form-success" : "form-error"
            }
            role={status.kind === "success" ? "status" : "alert"}
          >
            {status.message}
          </p>
        )}
      </div>
    </form>
  );
}
