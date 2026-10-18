import { useState } from 'react'
import FerrisWheelGallery from '../../components/FerrisWheelGallery/FerrisWheelGallery'
import { projects } from './projects'
import './SelectedWork.css'

export default function SelectedWork() {
  const [active, setActive] = useState(0)
  return (
    <section className="selected-work" id="projeler" aria-labelledby="work-heading">
      <header className="selected-work-heading">
        <h2 id="work-heading">02 / SEÇİLİ PROJELER</h2>
        <p>Dijital ürünlerden seçilmiş çalışmalar.</p>
      </header>
      <FerrisWheelGallery items={projects} active={active} onActiveChange={setActive} autoplay={false} />
    </section>
  )
}
