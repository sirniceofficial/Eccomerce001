import { describe, it, expect } from 'vitest';
import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from './whatsapp';

const baseOrder = {
  orderId: 'abcd1234-5678-90ef-1234-567890abcdef',
  customerName: 'Jane Doe',
  shippingPhone: '0712345678',
  mpesaPhone: '0712345678',
  addressLine1: '123 Mombasa Rd',
  addressLine2: 'Apt 4B',
  city: 'Nairobi',
  postalCode: '00100',
  pickupLocation: { lat: -1.2921, lng: 36.8219, label: 'Westlands Mall' },
  items: [
    { title: 'Test Product', qty: 2, price: 1500 },
  ],
  total: 3000,
};

describe('WhatsApp order message builder', () => {
  it('includes the shipping phone, full address, and pickup map link', () => {
    const msg = buildWhatsAppOrderMessage(baseOrder);
    expect(msg).toContain('0712345678');
    expect(msg).toContain('123 Mombasa Rd');
    expect(msg).toContain('Apt 4B');
    expect(msg).toContain('Nairobi');
    expect(msg).toContain('00100');
    expect(msg).toContain('Westlands Mall');
    expect(msg).toContain('https://maps.google.com/?q=-1.2921,36.8219');
  });

  it('includes the order id (short form), items and total', () => {
    const msg = buildWhatsAppOrderMessage(baseOrder);
    expect(msg).toContain('ABCD1234');
    expect(msg).toContain('Test Product × 2');
    expect(msg).toMatch(/Total:/);
  });

  it('omits map line when no pickup location is provided', () => {
    const msg = buildWhatsAppOrderMessage({ ...baseOrder, pickupLocation: null });
    expect(msg).not.toContain('Pickup Map:');
    expect(msg).not.toContain('maps.google.com');
  });

  it('builds a wa.me URL with the cleaned number and encoded message', () => {
    const url = buildWhatsAppOrderUrl('+254 769 353 430', baseOrder);
    expect(url.startsWith('https://wa.me/254769353430?text=')).toBe(true);
    const decoded = decodeURIComponent(url.split('?text=')[1]);
    expect(decoded).toContain('0712345678');
    expect(decoded).toContain('123 Mombasa Rd');
    expect(decoded).toContain('https://maps.google.com/?q=-1.2921,36.8219');
  });
});
