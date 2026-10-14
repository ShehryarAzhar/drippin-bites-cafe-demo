"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Send, ShoppingBag, Truck, UtensilsCrossed } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { Ref } from "react"
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DELIVERY_NOTE } from "@/lib/cart/copy"
import { menu } from "@/lib/menu"
import { ORDER_TYPE_LABELS } from "@/lib/order-types"
import { cn } from "@/lib/utils"
import {
  CHECKOUT_LIMITS,
  checkoutSchema,
  type CheckoutDetails,
  type CheckoutFormValues,
} from "@/lib/validations/checkout"
import type { OrderType } from "@/types/menu"

import { sectionLabel } from "./order-summary"
import { OrderTypePicker } from "./order-type-picker"
import { WhatsAppUnavailable } from "./whatsapp-unavailable"

const ORDER_TYPE_ICONS: Record<OrderType, LucideIcon> = {
  delivery: Truck,
  takeaway: ShoppingBag,
  "dine-in": UtensilsCrossed,
}

const orderTypeOptions = menu.restaurant.orderTypes.map((type) => ({
  value: type,
  label: ORDER_TYPE_LABELS[type],
  icon: ORDER_TYPE_ICONS[type],
}))

const defaultValues: Partial<CheckoutFormValues> = {
  name: "",
  phone: "",
  address: "",
  notes: "",
}

/** Space-separated ids for `aria-describedby`, leaving out the absent ones. */
function describedBy(...ids: (string | false | undefined)[]) {
  return ids.filter(Boolean).join(" ") || undefined
}

type CheckoutFormProps = {
  /** Sends the parsed details on; absent when no WhatsApp number is set. */
  onSend?: (details: CheckoutDetails) => void
  /** Lets checkout put focus back on the submit button. */
  submitRef?: Ref<HTMLButtonElement>
  className?: string
}

/** The customer's details: order type, name, phone, address and notes. */
function CheckoutForm({ onSend, submitRef, className }: CheckoutFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues, unknown, CheckoutDetails>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const orderType = useWatch({ control, name: "orderType" })
  const notes = useWatch({ control, name: "notes" }) ?? ""

  const sendOrder: SubmitHandler<CheckoutDetails> = (details) => {
    onSend?.(details)
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(sendOrder)}
      aria-label="Your details"
      className={cn("flex flex-col gap-8", className)}
    >

      <Controller
        control={control}
        name="orderType"
        render={({ field, fieldState }) => (
          <FieldSet className="gap-0">
            <FieldLegend id="order-type-legend" className="mb-3">
              <h2 className={sectionLabel}>How do you want it?</h2>
            </FieldLegend>
            <OrderTypePicker
              options={orderTypeOptions}
              value={field.value ?? null}
              onChange={field.onChange}
              onBlur={field.onBlur}
              focusRef={field.ref}
              invalid={fieldState.invalid}
              labelledBy="order-type-legend"
              describedBy={describedBy(
                field.value === "delivery" && "order-type-note",
                fieldState.error && "order-type-error"
              )}
            />
            {field.value === "delivery" ? (
              <FieldDescription id="order-type-note" className="mt-2.5">
                {DELIVERY_NOTE}
              </FieldDescription>
            ) : null}
            <FieldError id="order-type-error" className="mt-2">
              {fieldState.error?.message}
            </FieldError>
          </FieldSet>
        )}
      />

      <section aria-labelledby="checkout-details-heading" className="flex flex-col gap-5">
        <h2 id="checkout-details-heading" className={sectionLabel}>
          Your details
        </h2>

        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="checkout-name">Name</FieldLabel>
          <Input
            id="checkout-name"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            maxLength={CHECKOUT_LIMITS.name}
            aria-invalid={!!errors.name}
            aria-describedby={describedBy(errors.name && "checkout-name-error")}
            {...register("name")}
          />
          <FieldError id="checkout-name-error">{errors.name?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.phone || undefined}>
          <FieldLabel htmlFor="checkout-phone">Phone</FieldLabel>
          <Input
            id="checkout-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="03XX XXXXXXX"
            aria-invalid={!!errors.phone}
            aria-describedby={describedBy(
              "checkout-phone-hint",
              errors.phone && "checkout-phone-error"
            )}
            {...register("phone")}
          />
          <FieldDescription id="checkout-phone-hint">
            We&apos;ll confirm your order on this number.
          </FieldDescription>
          <FieldError id="checkout-phone-error">{errors.phone?.message}</FieldError>
        </Field>

        {orderType === "delivery" ? (
          // Opens from nothing on its first frame; no motion when reduced.
          <div className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-200 ease-out starting:grid-rows-[0fr] starting:opacity-0 motion-reduce:transition-none">
            {/* Clips while it opens; the padding keeps the focus ring visible. */}
            <div className="-m-1.5 min-h-0 overflow-hidden p-1.5">
              <Field data-invalid={!!errors.address || undefined}>
                <FieldLabel htmlFor="checkout-address">Delivery address</FieldLabel>
                <Textarea
                  id="checkout-address"
                  autoComplete="street-address"
                  maxLength={CHECKOUT_LIMITS.address}
                  aria-invalid={!!errors.address}
                  aria-describedby={describedBy(
                    "checkout-address-hint",
                    errors.address && "checkout-address-error"
                  )}
                  {...register("address")}
                />
                <FieldDescription id="checkout-address-hint">
                  House, street, block and nearby landmark.
                </FieldDescription>
                <FieldError id="checkout-address-error">
                  {errors.address?.message}
                </FieldError>
              </Field>
            </div>
          </div>
        ) : null}

        <Field data-invalid={!!errors.notes || undefined}>
          <FieldLabel htmlFor="checkout-notes">
            Notes
            <span className="font-normal text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Textarea
            id="checkout-notes"
            placeholder="Allergies, extra napkins, landmarks…"
            maxLength={CHECKOUT_LIMITS.notes}
            aria-invalid={!!errors.notes}
            aria-describedby={describedBy(
              "checkout-notes-count",
              errors.notes && "checkout-notes-error"
            )}
            {...register("notes")}
          />
          <div className="flex items-start justify-between gap-3">
            <FieldError id="checkout-notes-error">{errors.notes?.message}</FieldError>
            <p
              id="checkout-notes-count"
              className="ml-auto text-xs text-muted-foreground tabular-nums"
            >
              {notes.length} / {CHECKOUT_LIMITS.notes}
            </p>
          </div>
        </Field>
      </section>

      {onSend ? (
        <div className="flex flex-col gap-3">
          <Button
            ref={submitRef}
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            <Send aria-hidden="true" />
            Send Order on WhatsApp
          </Button>
          <p className="text-center text-[0.8125rem] text-muted-foreground">
            You&apos;ll review the message in WhatsApp before it&apos;s sent.
          </p>
        </div>
      ) : (
        <WhatsAppUnavailable />
      )}
    </form>
  )
}

export { CheckoutForm }
