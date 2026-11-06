"use client";

export default function VillageMaps() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Lokasi Desa</h2>
          <p className="text-gray-600">Temukan lokasi Desa Gimpubia di peta</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31913.123053851446!2d119.70672850000001!3d-1.0562395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2d8c75f9ebfa2169%3A0xd9db005d197e03a7!2sGimpubia%2C%20Kec.%20Pinembani%2C%20Kabupaten%20Donggala%2C%20Sulawesi%20Tengah!5e0!3m2!1sid!2sid!4v1753144275546!5m2!1sid!2sid" 
              width="100%" 
              height="450" 
              style={{border: 0}} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-red-600 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Alamat</h3>
              <p className="text-gray-600 text-sm">Gimpubia, Kec. Pinembani, Kabupaten Donggala, Sulawesi Tengah</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-red-600 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Jam Operasional</h3>
              <p className="text-gray-600 text-sm">Senin - Jumat<br />08:00 - 16:00 WITA</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="text-red-600 mb-3">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Kontak</h3>
              <p className="text-gray-600 text-sm">Kantor Desa Gimpubia<br />Hubungi untuk informasi lebih lanjut</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}