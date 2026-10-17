import { useEffect, useRef } from 'react'
import { LiquidEngine, type EngineOptions } from './liquid-engine'

const options = (reducedMotion: boolean): EngineOptions => ({
  interactive: true, strength: .65, radius: 180, density: .8, dotSize: 1,
  spread: .6, turbulence: .55, returnSpeed: .65, streaks: true,
  restStyle: 'image', ambient: true, ambientIntensity: .18, speed: .7,
  intro: true, reducedMotion, bg: [238 / 255, 237 / 255, 232 / 255],
  imgBg: null, liquid: .65,
})

/** DAB composition adapter; the original simulation lives in liquid-engine.ts. */
export default function LiquidSculpture() {
  const rootRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  useEffect(() => {
    const root = rootRef.current!
    const fallback = imgRef.current!
    const canvas = document.createElement('canvas')
    canvas.setAttribute('aria-hidden', 'true')
    root.appendChild(canvas)
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = matchMedia('(max-width: 600px)')
    let engine: LiquidEngine | null = null
    let image: HTMLImageElement | null = null
    let disposed = false
    let intersecting = true
    let loadVersion = 0
    const fail = () => { root.dataset.gl = 'off' }
    try { engine = new LiquidEngine(canvas, options(motion.matches), fail) } catch { fail() }
    const layout = () => {
      const w = root.clientWidth, h = root.clientHeight
      const aspect = image?.naturalWidth ? image.naturalWidth / image.naturalHeight : mobile.matches ? .85 : 2.5
      const width = Math.min(w * (mobile.matches ? 1.05 : 1.02), h * .99 * aspect)
      const height = width / aspect
      const rect = { x: (w - width) / 2, y: (h - height) / 2, w: width, h: height }
      Object.assign(fallback.style, { left: `${rect.x}px`, top: `${rect.y}px`, width: `${width}px`, height: `${height}px` })
      engine?.resize(w, h, rect)
    }
    const load = () => {
      const version = ++loadVersion
      const next = new Image()
      next.decoding = 'async'
      const src = mobile.matches ? '/sculpture/mobile.webp' : '/sculpture/desktop.webp'
      if (root.dataset.gl !== 'off') delete root.dataset.gl
      fallback.src = src
      next.onload = () => {
        if (disposed || version !== loadVersion) return
        image = next
        layout()
        if (engine && root.dataset.gl !== 'off') {
          try {
            engine.onFirstFrame = () => { if (!disposed && version === loadVersion && root.dataset.gl !== 'off') root.dataset.gl = 'on' }
            engine.setImage(next)
            layout()
          } catch { fail() }
        }
      }
      next.onerror = fail
      next.src = src
    }
    const observer = new ResizeObserver(layout)
    observer.observe(root)
    const visibility = () => engine?.setVisible(intersecting && !document.hidden)
    const intersection = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; visibility() })
    intersection.observe(root)
    const onMotion = () => engine?.setOptions(options(motion.matches))
    const pointer = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect()
      const type = event.type === 'pointermove' ? 'move' : event.type === 'pointerdown' ? 'down' : event.type === 'pointerleave' ? 'leave' : 'up'
      if (event.pointerType === 'touch' && type === 'move' && !event.buttons && !event.pressure) return
      engine?.pointer(type, event.clientX - bounds.left, event.clientY - bounds.top, event.pointerType === 'touch')
    }
    const events = ['pointermove', 'pointerdown', 'pointerup', 'pointercancel', 'pointerleave'] as const
    events.forEach(event => root.addEventListener(event, pointer, { passive: true }))
    document.addEventListener('visibilitychange', visibility)
    motion.addEventListener('change', onMotion)
    mobile.addEventListener('change', load)
    layout()
    load()
    return () => {
      disposed = true
      observer.disconnect()
      intersection.disconnect()
      document.removeEventListener('visibilitychange', visibility)
      motion.removeEventListener('change', onMotion)
      mobile.removeEventListener('change', load)
      events.forEach(event => root.removeEventListener(event, pointer))
      engine?.destroy()
      canvas.remove()
      delete root.dataset.gl
    }
  }, [])
  return <div ref={rootRef} className="sculpture" role="img" aria-label="İmleç ve dokunuşla sıvılaşan, iç içe geçmiş metalik liflerden oluşan heykel."><img ref={imgRef} src="/sculpture/desktop.webp" alt="" draggable={false} fetchPriority="high" /></div>
}
