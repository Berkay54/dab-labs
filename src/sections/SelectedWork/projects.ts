export interface FeaturedProject {
  name: string
  number: string
  disciplines: string[]
  platform: string
  year: string
  description: string
  visual: { src: string; alt: string; width: number; height: number }
}

export const parkubi: FeaturedProject = {
  name: 'PARKUBI', number: '01',
  disciplines: ['Mobil Uygulama', 'Konum Teknolojileri'],
  platform: 'Android', year: '2026',
  visual: {
    src: '/projects/parkubi/parkubi-showcase.png',
    alt: 'PARKUBI uygulamasının harita üzerinde otopark arama ve otopark detay ekranlarını gösteren iki telefon.',
    width: 1086,
    height: 1448,
  },
  description: 'Şehirde park yeri bulmayı daha hızlı ve anlaşılır hale getiren mobil deneyim.',
}
