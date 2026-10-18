import type { FerrisWheelItem } from '../../components/FerrisWheelGallery/FerrisWheelGallery'

export const projects: FerrisWheelItem[] = [
  {
    id: 'parkubi', title: 'PARKUBI', category: 'Mobil Uygulama',
    discipline: 'Konum Teknolojileri', year: '2026',
    description: 'Şehirde park yeri bulmayı daha hızlı ve anlaşılır hale getiren mobil deneyim.',
    src: '/projects/parkubi/parkubi-showcase.png',
    alt: 'PARKUBI harita üzerinde otopark arama ve otopark detay ekranlarını gösteren iki telefon.',
    accent: '#3e648a', href: '#aktif-proje-gorseli',
    imageFit: 'contain', thumbnailFit: 'cover',
    imagePosition: 'center', thumbnailPosition: 'center',
  },
  ...[
    { id: 'ayluma', title: 'AYLUMA', category: 'Mobil Uygulama', discipline: 'Astroloji', accent: '#81728e', thumbnailPosition: '20% center', src: '/projects/ayluma/ayluma-showcase.png', alt: 'AYLUMA mobil uygulaması: gökyüzü teması, doğum haritası ve telefon ile dizüstü bilgisayar üzerinde arayüz görünümleri.' },
    { id: 'veron', title: 'VERON', category: 'Web Sitesi', discipline: 'Lüks Saat', accent: '#5a5e5a', thumbnailPosition: 'left center', src: '/projects/veron/veron-showcase.png', alt: 'VERON web sitesi: koyu zemin üzerinde mekanik saat ve editorial başlık kompozisyonu.' },
    { id: 'veyra', title: 'VEYRA', category: 'Web Sitesi', discipline: 'Eyewear', accent: '#918475', thumbnailPosition: 'left center', src: '/projects/veyra/veyra-showcase.png', alt: 'VEYRA web sitesi: sıcak nötr zemin üzerinde güneş gözlüğü ve tipografik ürün sunumu.' },
    { id: 'nox', title: 'NOX', category: 'Web Sitesi', discipline: 'Parfüm', accent: '#9b8050', thumbnailPosition: 'left center', src: '/projects/nox/nox-showcase.png', alt: 'NOX web sitesi: koyu taşlar ve duman arasında parfüm şişesi ve marka tipografisi.' },
  ].map(project => ({
    ...project,
    description: `${project.title} ${project.category.toLocaleLowerCase('tr-TR')} tasarımından bir görünüm.`,
    imageFit: 'cover' as const,
    thumbnailFit: 'cover' as const,
    imagePosition: project.thumbnailPosition,
  })),
]

