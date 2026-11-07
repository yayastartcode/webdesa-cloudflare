import { useEffect, useState } from 'react';
import { Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { defaultVillageContact, isGoogleMapEmbed, whatsappUrl, type VillageContact } from '@/lib/village-contact';

export default function VillageMaps() {
  const [contact, setContact] = useState<VillageContact>(defaultVillageContact);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/village-contact', { signal: controller.signal }).then(async response => {
      if (response.ok) { const result = await response.json(); if (result.success) setContact(result.data); }
    }).catch(() => {});
    return () => controller.abort();
  }, []);
  return <section id="kontak" className="bg-gray-50 py-16 dark:bg-gray-900">
    <div className="container mx-auto px-4">
      <div className="mb-10 text-center"><h2 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">Lokasi Desa</h2><p className="text-gray-600 dark:text-gray-400">{contact.officeName}</p></div>
      <div className="mx-auto max-w-5xl">
        {contact.mapEmbedUrl && isGoogleMapEmbed(contact.mapEmbedUrl) && <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <iframe title="Peta lokasi kantor desa" src={contact.mapEmbedUrl} width="100%" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full" />
        </div>}
        {contact.mapLink && <div className="mt-4 text-center"><a href={contact.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><ExternalLink className="h-4 w-4" />Buka di Google Maps</a></div>}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-gray-800"><MapPin className="mx-auto mb-3 h-7 w-7 text-red-600" /><h3 className="mb-2 font-semibold">Alamat</h3><p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">{contact.address}</p></div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-gray-800"><Clock className="mx-auto mb-3 h-7 w-7 text-red-600" /><h3 className="mb-2 font-semibold">Jam Operasional</h3><p className="whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">{contact.openingHours || 'Hubungi kantor desa untuk informasi layanan.'}</p></div>
          <div className="rounded-xl bg-white p-6 text-center shadow-sm dark:bg-gray-800"><Phone className="mx-auto mb-3 h-7 w-7 text-red-600" /><h3 className="mb-2 font-semibold">Kontak</h3><div className="space-y-2 break-words text-sm text-gray-600 dark:text-gray-300">
            <p>{contact.officeName}</p>
            {contact.phone && <a href={`tel:${contact.phone.replace(/[^+\d]/g, '')}`} className="block hover:text-red-600">{contact.phone}</a>}
            {contact.email && <a href={`mailto:${contact.email}`} className="inline-flex max-w-full items-center gap-1 hover:text-red-600"><Mail className="h-4 w-4 shrink-0" /><span className="break-all">{contact.email}</span></a>}
            {contact.whatsapp && <a href={whatsappUrl(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 font-medium text-green-700 dark:text-green-400"><MessageCircle className="h-4 w-4" />Hubungi via WhatsApp</a>}
            {!contact.phone && !contact.email && !contact.whatsapp && <p>Hubungi untuk informasi lebih lanjut</p>}
          </div></div>
        </div>
      </div>
    </div>
  </section>;
}
