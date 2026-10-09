// Shared builder for the order-confirmation WhatsApp message.
// Pure function so it can be unit-tested in isolation.

import { formatPrice } from './products';

export interface WhatsAppOrderItem {
  title: string;
  qty: number;
  price: number;
}

export interface WhatsAppOrderInput {
  orderId: string;
  customerName: string;
  shippingPhone: string;
  mpesaPhone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  pickupLocation?: { lat: number; lng: number; label?: string } | null;
  items: WhatsAppOrderItem[];
  total: number;
}

export const buildWhatsAppOrderMessage = (input: WhatsAppOrderInput): string => {
  const shortId = String(input.orderId).slice(0, 8).toUpperCase();
  const addrLine = `${input.addressLine1}${input.addressLine2 ? ', ' + input.addressLine2 : ''}`;
  const cityLine = `${input.city} ${input.postalCode ?? ''}`.trim();
  const mapLine = input.pickupLocation
    ? `*Pickup Map:* https://maps.google.com/?q=${input.pickupLocation.lat},${input.pickupLocation.lng}`
    : '';
  const labelLine = input.pickupLocation?.label
    ? `*Pickup Label:* ${input.pickupLocation.label}`
    : '';

  const lines = [
    `🛒 *New Order #${shortId}*`,
    ``,
    `*Customer:* ${input.customerName}`,
    `*Phone:* ${input.shippingPhone}`,
    ...(input.mpesaPhone ? [`*M-Pesa:* ${input.mpesaPhone}`] : []),
    ``,
    `*Shipping Address:*`,
    addrLine,
    cityLine,
    ...(labelLine ? [labelLine] : []),
    ...(mapLine ? [mapLine] : []),
    ``,
    `*Items:*`,
    ...input.items.map(i => `• ${i.title} × ${i.qty} — ${formatPrice(i.price * i.qty)}`),
    ``,
    `*Total: ${formatPrice(input.total)}*`,
  ];
  return lines.filter(l => l !== null && l !== undefined).join('\n');
};

export const buildWhatsAppOrderUrl = (
  businessNumber: string,
  input: WhatsAppOrderInput
): string => {
  const cleanedNumber = businessNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(buildWhatsAppOrderMessage(input))}`;
};
