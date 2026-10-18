/** Adapted from the supplied 21st.dev Ferris Wheel Gallery by dhxwhy.
 * The original single-slot clock, spring curve, counter-rotation and WAAPI sway are retained. */
import * as React from 'react'
import './FerrisWheelGallery.css'

export interface FerrisWheelItem {
  id: string
  src: string
  alt: string
  title: string
  year?: string | number
  category: string
  discipline: string
  description: string
  accent: string
  href?: string
  imageFit?: 'contain' | 'cover'
  thumbnailFit?: 'contain' | 'cover'
  imagePosition?: string
  thumbnailPosition?: string
}
type DivProps = React.ComponentProps<'div'>
export interface FerrisWheelGalleryProps extends DivProps {
  items: FerrisWheelItem[]
  active?: number
  defaultActive?: number
  onActiveChange?: (index: number) => void
  direction?: 'cw' | 'ccw'
  autoplay?: boolean
  interval?: number
  ref?: DivProps['ref']
}
const TURN_MS = 650
const SWAY_MS = 340
function wrap(index: number, total: number) {
  return total > 0 ? ((Math.trunc(Number.isFinite(index) ? index : 0) % total) + total) % total : 0
}

function Photo({ item, thumbnail = false }: { item: FerrisWheelItem; thumbnail?: boolean }) {
  const [failed, setFailed] = React.useState('')
  const [loading, setLoading] = React.useState('')
  const [shown, setShown] = React.useState('')
  const image = React.useRef<HTMLImageElement>(null)
  React.useLayoutEffect(() => {
    const node = image.current
    if (node && !(node.complete && node.naturalWidth > 0)) setLoading(item.src)
  }, [item.src])
  const pending = loading === item.src && shown !== item.src && failed !== item.src
  return <>
    {pending && <span aria-hidden="true" data-photo-skeleton className="fw-photo-skeleton" />}
    {failed !== item.src && <img ref={image} src={item.src} alt={thumbnail ? '' : item.alt}
      loading={thumbnail ? 'lazy' : 'eager'} decoding="async" draggable={false}
      onLoad={() => setShown(item.src)} onError={() => setFailed(item.src)}
      data-photo-state={pending ? 'loading' : 'ready'} className="fw-photo"
      style={{
        objectFit: (thumbnail ? item.thumbnailFit : item.imageFit) ?? 'contain',
        objectPosition: (thumbnail ? item.thumbnailPosition : item.imagePosition) ?? 'center',
      }} />}
    {failed === item.src && <span className="fw-photo-error" role={thumbnail ? undefined : 'img'}
      aria-label={thumbnail ? undefined : `${item.alt} — görsel yüklenemedi`}>
      <span aria-hidden="true">↗</span>{!thumbnail && <span>Görsel yüklenemedi</span>}
    </span>}
  </>
}

export function FerrisWheelGallery({
  items,
  active,
  defaultActive = 0,
  onActiveChange,
  direction = "cw",
  autoplay = false,
  interval = 2600,
  className,
  ref,
  onKeyDown,
  onFocusCapture,
  ...rest
}: FerrisWheelGalleryProps) {
  const total = items.length;
  const [localActive, setLocalActive] = React.useState(() => wrap(defaultActive, total));
  const selected = wrap(active ?? localActive, total);
  const sign = direction === "cw" ? 1 : -1;
  const slot = total > 0 ? 360 / total : 0;
  // A motion-free first render is also safe for SSR and reduced-motion hydration.
  const [reducedMotion, setReducedMotion] = React.useState(true);
  const [paused, setPaused] = React.useState(false);
  const [phase, setPhase] = React.useState("idle");
  const [view, setView] = React.useState(() => ({ index: selected, previous: selected }));
  const [announcement, setAnnouncement] = React.useState("");
  const [initialAngle] = React.useState(selected * slot * sign);
  const angle = React.useRef(initialAngle);
  const wheelRef = React.useRef(null as HTMLDivElement | null);
  const stageRef = React.useRef(null as HTMLDivElement | null);
  const counters = React.useRef([] as (HTMLDivElement | null)[]);
  const gondolas = React.useRef([] as (HTMLDivElement | null)[]);
  const photoRef = React.useRef(null as HTMLDivElement | null);
  const previousRef = React.useRef(null as HTMLDivElement | null);
  const captionRef = React.useRef(null as HTMLDivElement | null);
  const command = React.useRef(null as ((index: number) => void) | null);
  const requestRef = React.useRef(null as ((index: number, user?: boolean) => void) | null);
  const drag = React.useRef(null as { id: number; x: number; y: number; captured: boolean } | null);
  const suppressClickUntil = React.useRef(0);
  const latest = React.useRef({ selected, active, onActiveChange, items });
  React.useLayoutEffect(() => { latest.current = { selected, active, onActiveChange, items }; });
  const labelId = React.useId();
  const helpId = React.useId();

  React.useLayoutEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // One frame clock writes both transforms: counter-rotation cannot drift from
  // the wheel. A new destination is reached through complete, single-slot turns.
  React.useLayoutEffect(() => {
    let shown = latest.current.selected;
    let target = shown;
    let frame = 0;
    let sways: Animation[] = [];
    let settleTimer = 0;
    let disposed = false;
    const paint = (value: number) => {
      angle.current = value;
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${value}deg)`;
      counters.current.forEach((node) => {
        if (node) node.style.transform = `rotate(${-value}deg)`;
      });
    };
    const stopSway = () => {
      window.clearTimeout(settleTimer);
      sways.forEach((animation) => animation.cancel());
      sways = [];
    };
    const sway = (turn: number) => {
      // Two complete oscillations with a decaying amplitude, then exact zero.
      const swing = [0, -2.6, 0, 1.7, 0, -0.9, 0, 0.35, 0];
      sways = gondolas.current.flatMap((node) => node ? [node.animate(
        swing.map((value) => ({ transform: `rotate(${value * turn}deg)` })),
        { duration: SWAY_MS, easing: "ease-in-out" },
      )] : []);
      setPhase("settling");
      settleTimer = window.setTimeout(() => { if (!disposed) setPhase("idle"); }, SWAY_MS);
    };
    const announce = () => {
      const item = latest.current.items[shown];
      if (item) setAnnouncement(`${total} projeden ${shown + 1}. proje: ${item.title}, ${item.category}, ${item.discipline}`);
    };
    const begin = () => {
      if (shown === target || total < 2) return;
      stopSway();
      let distance = wrap(target - shown, total);
      if (distance > total / 2) distance -= total;
      const step = Math.sign(distance);
      const next = wrap(shown + step, total);
      const from = angle.current;
      const to = from + step * slot * sign;
      const started = performance.now();
      setPhase("turning");
      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / TURN_MS);
        const tail = progress - 1;
        const spring = 1 + 2.2 * tail ** 3 + 1.2 * tail ** 2;
        paint(from + (to - from) * spring);
        if (progress < 1) {
          frame = requestAnimationFrame(tick);
          return;
        }
        frame = 0;
        paint(to);
        const previous = shown;
        shown = next;
        setView({ index: shown, previous });
        if (shown !== target) begin();
        else { announce(); sway(step * sign); }
      };
      frame = requestAnimationFrame(tick);
    };
    paint(shown * slot * sign);
    // Synchronize React's detail view when the imperative source engine resets.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setView({ index: shown, previous: shown });
    setPhase("idle");
    command.current = (index) => {
      target = wrap(index, total);
      if (reducedMotion) {
        cancelAnimationFrame(frame);
        frame = 0;
        stopSway();
        shown = target;
        paint(shown * slot * sign);
        setView({ index: shown, previous: shown });
        setPhase("idle");
        announce();
      } else if (!frame) begin();
    };
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      stopSway();

      command.current = null;
    };
  }, [total, slot, sign, reducedMotion]);

  React.useLayoutEffect(() => { command.current?.(selected); }, [selected, total, direction, reducedMotion]);

  React.useLayoutEffect(() => {
    if (reducedMotion || view.index === view.previous) return;
    const options = { duration: 360, easing: "ease-out" };
    const fades = [
      photoRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], options),
      previousRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], options),
      captionRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], options),
    ];
    return () => fades.forEach((animation) => animation?.cancel());
  }, [view, reducedMotion]);

  const request = (index: number, user = true) => {
    if (user) setPaused(true);
    const next = wrap(index, total);
    if (next === latest.current.selected || total < 2) return;
    if (latest.current.active === undefined) setLocalActive(next);
    latest.current.onActiveChange?.(next);
  };
  React.useLayoutEffect(() => { requestRef.current = request; });

  const selectItem = (index: number, timestamp: number) => {
    if (timestamp >= suppressClickUntil.current) request(index);
  };

  React.useEffect(() => {
    if (!autoplay || paused || reducedMotion || total < 2) return;
    const delay = Number.isFinite(interval) ? Math.max(TURN_MS + SWAY_MS, interval) : 2600;
    const timer = window.setInterval(() => requestRef.current?.(latest.current.selected + 1, false), delay);
    return () => window.clearInterval(timer);
  }, [autoplay, paused, reducedMotion, total, interval]);

  const current = items[wrap(view.index, total)];
  const previous = items[wrap(view.previous, total)];

  return (
    <div {...rest} ref={ref} data-ferris-gallery data-active={selected} data-visible={view.index}
      data-phase={phase} data-reduced-motion={reducedMotion}
      className={`fw-gallery ${className ?? ''}`} role="region" aria-roledescription="proje galerisi"
      aria-label={rest['aria-label'] ?? 'Seçili projeler'}
      style={{ '--fw-project-accent': current?.accent, ...rest.style } as React.CSSProperties}
      onFocusCapture={event => { onFocusCapture?.(event); if (!event.defaultPrevented) setPaused(true) }}
      onKeyDown={event => {
        onKeyDown?.(event)
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          request(selected + (event.key === 'ArrowRight' ? 1 : -1))
        }
      }}>
      {!current ? <p role="status">Henüz proje eklenmedi.</p> : <div className="fw-layout">
        <div className="fw-wheel-column">
        <div className="fw-stage" ref={stageRef} data-wheel-stage tabIndex={0}
          aria-label="Projeleri keşfet" aria-describedby={helpId}
          onPointerDown={event => {
            if (!event.isPrimary || event.button !== 0) return
            setPaused(true)
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, captured: false }
          }}
          onPointerMove={event => {
            const start = drag.current
            if (!start || start.id !== event.pointerId) return
            const x = event.clientX - start.x, y = event.clientY - start.y
            // Vertical touch gestures belong to the page. Horizontal drags
            // keep the supplied capture / single-slot interaction.
            if (event.pointerType === 'touch' && !start.captured && Math.abs(y) > Math.abs(x) && Math.abs(y) > 8) {
              drag.current = null
              return
            }
            if (!start.captured && Math.hypot(x, y) > 8) {
              event.currentTarget.setPointerCapture(event.pointerId)
              start.captured = true
            }
          }}
          onPointerUp={event => {
            const start = drag.current
            drag.current = null
            if (!start || start.id !== event.pointerId) return
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            const x = event.clientX - start.x, y = event.clientY - start.y
            const delta = Math.abs(x) >= Math.abs(y) ? x : y
            if (start.captured) suppressClickUntil.current = performance.now() + 300
            if (Math.abs(delta) >= 30) request(selected - Math.sign(delta))
          }}
          onPointerCancel={() => { drag.current = null }}
          onLostPointerCapture={event => {
            // Touch starts with implicit capture on the child artwork. Its
            // release bubbles when capture transfers to the stage; that is
            // not the end of our drag.
            if (event.target === event.currentTarget) drag.current = null
          }}>
          <div className="fw-stage-square">
            <div className="fw-on-view" aria-hidden="true">SEÇİLİ PROJE<span>⌄</span></div>
            <svg className="fw-support" aria-hidden="true" viewBox="0 0 400 400" fill="none">
              <path d="M200 184 146 362M200 184 254 362M124 362H276" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            <div ref={wheelRef} data-wheel className="fw-wheel" style={{ transform: `rotate(${initialAngle}deg)` }}>
              <div className="fw-inner-rim" aria-hidden="true" />
              {Array.from({ length: 24 }, (_, marker) => <span key={marker} className="fw-rim-marker" aria-hidden="true"
                style={{ left: `${50 + Math.sin(marker * Math.PI / 12) * 50}%`, top: `${50 - Math.cos(marker * Math.PI / 12) * 50}%` }} />)}
              {items.map((item, index) => {
                const radians = -sign * index * slot * Math.PI / 180
                const isActive = index === view.index
                return <React.Fragment key={item.id}>
                  <span className="fw-spoke" aria-hidden="true" style={{ transform: `rotate(${-90 - sign * index * slot}deg)` }} />
                  <div data-gondola-anchor={index} className="fw-gondola-anchor" style={{ left: `${50 + Math.sin(radians) * 50}%`, top: `${50 - Math.cos(radians) * 50}%`, zIndex: isActive ? 20 : 10 }}>
                    <div ref={node => { counters.current[index] = node }} data-counter={index} className="fw-counter" style={{ transform: `rotate(${-initialAngle}deg)` }}>
                      <div className="fw-gondola-offset">
                        <div ref={node => { gondolas.current[index] = node }} data-pendulum={index} className="fw-pendulum">
                          <span className="fw-hanger" aria-hidden="true" />
                          <button type="button" data-gondola={index} aria-label={`${item.title}, ${item.category}, ${item.discipline}, ${total} projeden ${index + 1}. proje`}
                            aria-current={isActive ? 'true' : undefined} aria-controls={labelId}
                            className="fw-gondola" tabIndex={isActive ? 0 : -1} onClick={event => selectItem(index, event.timeStamp)}
                            style={{ transform: `scale(${isActive ? 1.08 : 1})`, transition: reducedMotion ? 'none' : 'transform 320ms ease' }}>
                            <span className="fw-thumbnail">
                              <Photo item={item} thumbnail />
                            </span>
                            <span className="fw-thumbnail-label" aria-hidden="true">{String(index + 1).padStart(2, '0')} / {item.title}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              })}
            </div>
            <div className="fw-hub" aria-hidden="true"><span>{String(total).padStart(2, '0')}</span><span>PROJE</span></div>
          </div>
        </div>
        <p className="fw-help" id={helpId}>Projeyi seç <span> / </span> Sürükle veya ← →</p>
        </div>

        <div className="fw-detail-panel" id={labelId} data-detail-panel>
          <figure className="fw-detail-preview" id="aktif-proje-gorseli" tabIndex={-1} aria-label={`${current.title} proje görseli`}>
            {previous && view.previous !== view.index && <div ref={previousRef} data-previous-photo aria-hidden="true" className="fw-detail-photo" style={{ opacity: 0 }}><Photo item={previous} /></div>}
            <div ref={photoRef} data-current-photo className="fw-detail-photo"><Photo item={current} /></div>
          </figure>
          <div className="fw-project-info" ref={captionRef} data-caption>
            <p className="fw-project-index">{String(view.index + 1).padStart(2, '0')} <span>/ {String(total).padStart(2, '0')}</span></p>
            <h3>{current.title}</h3>
            <p className="fw-project-category">{current.category} · {current.discipline}</p>
            {current.year && <p className="fw-project-year">{current.year}</p>}
            <p className="fw-project-description">{current.description}</p>
            {current.href ? <a className="fw-project-link" href={current.href}>Projeyi incele <span aria-hidden="true">↗</span></a>
              : <p className="fw-project-pending">Proje ayrıntıları eklenecek.</p>}
          </div>
          <div className="fw-controls">
          <button type="button" data-previous aria-label="Önceki proje" disabled={total < 2} onClick={() => request(selected - 1)}>←</button>
          <button type="button" data-next aria-label="Sonraki proje" disabled={total < 2} onClick={() => request(selected + 1)}>→</button>
          <span className="fw-control-count" aria-hidden="true">{String(view.index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
          </div>
        </div>
      </div>}
      <span role="status" aria-live="polite" aria-atomic="true" className="fw-sr-only">{announcement}</span>
    </div>
  )
}

export default FerrisWheelGallery



