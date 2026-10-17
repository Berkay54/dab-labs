import { useEffect, useRef } from 'react'
import { parkubi } from './projects'
import './SelectedWork.css'

export default function SelectedWork() {
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const targets = sectionRef.current!.querySelectorAll<HTMLElement>('[data-work-reveal]')
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.visible = ''
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: .12 })
    targets.forEach(target => {
      target.dataset.workMotion = ''
      observer.observe(target)
    })
    return () => {
      observer.disconnect()
      targets.forEach(target => { delete target.dataset.workMotion })
    }
  }, [])

  return (
    <section className="selected-work" id="projeler" ref={sectionRef} aria-labelledby="work-heading">
      <header className="work-intro" data-work-reveal>
        <p className="work-identifier">02 / SEÇİLİ PROJELER</p>
        <h2 id="work-heading">Fikirden ürüne,<br /><em>ekrandan deneyime.</em></h2>
        <span className="work-intro-arrow" aria-hidden="true">↙</span>
      </header>
      <article className="featured-work" aria-labelledby="parkubi-heading" data-work-reveal>
        <header className="project-identity">
          <span className="project-number">{parkubi.number} <span aria-hidden="true">/</span></span>
          <h3 id="parkubi-heading">{parkubi.name}</h3>
          <ul className="project-disciplines" aria-label="Proje alanları">
            {parkubi.disciplines.map(discipline => <li key={discipline}>{discipline}</li>)}
          </ul>
        </header>
        <div className="project-visual-entry">
          <div className="project-visual-depth">
            <figure className="project-stage" id="parkubi-gorsel" tabIndex={-1} aria-labelledby="parkubi-caption">
                <div className="project-visual-scene">
                  <div className="stage-topline" aria-hidden="true"><span>PARKUBI / ANDROID</span><span>01 — GÖRSEL ALANI</span></div>
                  <span className="stage-word" aria-hidden="true">PARKUBI</span>
                  <div className="project-image-slot">
                    <img className="project-real-visual" src={parkubi.visual.src} alt={parkubi.visual.alt}
                      width={parkubi.visual.width} height={parkubi.visual.height} loading="lazy" decoding="async" />
                  </div>
                </div>
              <figcaption id="parkubi-caption" className="project-visual-caption">
                <span>PARKUBI / Mobil Uygulama</span>
                <span>{parkubi.platform} / {parkubi.year}</span>
              </figcaption>
            </figure>
          </div>
        </div>
        <div className="project-summary">
          <p>{parkubi.description}</p>
          <a className="project-link" href="#parkubi-gorsel" aria-label="PARKUBI projesinin görsel alanını incele">
            Projeyi incele <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="project-bottomline"><span>KONUM ODAKLI MOBİL DENEYİM</span><span>{parkubi.year}</span></div>
      </article>
    </section>
  )
}
