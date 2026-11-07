import { expect, it } from 'vitest';
import { isGoogleMapEmbed, isGoogleMapLink, mapUrlFromInput, whatsappUrl } from '../../src/lib/village-contact';
it('accepts Google Maps embeds and rejects arbitrary or deceptive iframe origins', () => {
  expect(isGoogleMapEmbed('https://www.google.com/maps/embed?pb=location')).toBe(true);
  for (const url of ['javascript:alert(1)', 'https://www.google.com.evil.example/maps/embed', 'http://www.google.com/maps/embed', 'https://evil.example/embed']) expect(isGoogleMapEmbed(url)).toBe(false);
  expect(isGoogleMapLink('https://maps.app.goo.gl/example')).toBe(true);
  expect(isGoogleMapLink('javascript:alert(1)')).toBe(false);
});
it('extracts only the map URL from pasted iframe markup and builds WhatsApp links', () => {
  expect(mapUrlFromInput('<iframe src="https://www.google.com/maps/embed?pb=test&amp;hl=id"></iframe>')).toBe('https://www.google.com/maps/embed?pb=test&hl=id');
  expect(whatsappUrl('0812-3456-7890')).toBe('https://wa.me/6281234567890');
});
