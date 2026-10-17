import LiquidSculpture from './components/LiquidSculpture'
import './App.css'
import SelectedWork from './sections/SelectedWork/SelectedWork'

export default function App() {
  return <main className="opening" id="baslangic">
    <a className="skip-link" href="#icerik">İçeriğe geç</a>
    <header className="navigation">
      <a className="wordmark" href="#baslangic" aria-label="DAB Labs ana sayfa">
        <img src="/logo/dab-labs-logo-dark.png" alt="DAB Labs" width="2162" height="727" />
      </a>
      <nav aria-label="Ana gezinme">
        <a href="#projeler">Projeler</a>
        <a href="#hizmetler">Hizmetler</a>
        <a href="#surec">Süreç</a>
        <a href="#hakkimizda">Hakkımızda</a>
        <a href="#iletisim">İletişim <span aria-hidden="true">↗</span></a>
      </nav>
    </header>
    <section className="hero" aria-labelledby="hero-title" id="icerik">
      <div className="hero-art"><span className="backdrop" aria-hidden="true">DAB</span><LiquidSculpture /></div>
      <div className="hero-copy">
        <p className="hero-eyebrow">DİJİTAL ÜRÜNLER / WEB &amp; MOBİL</p>
        <h1 id="hero-title"><span>Dijital dünyada</span><span className="serif">iz bırakan işler.</span></h1>
        <div className="hero-aside">
          <p>Web siteleri, mobil uygulamalar ve dijital ürünler tasarlıyor, geliştiriyoruz.</p>
          <a className="explore" href="#projeler">Projeleri keşfet <span className="arrow" aria-hidden="true">↘</span></a>
        </div>
      </div>
      <div className="hero-meta"><span>SAKARYA / TÜRKİYE</span><span>WEB • MOBİL • DİJİTAL ÜRÜNLER</span></div>
    </section>
    <SelectedWork />
  </main>
}
