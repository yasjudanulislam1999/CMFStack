import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { MODEL_CREDIT, PAINTS, PRESETS, VIEWS, ZONES, img, zoneRender } from './data'

const CONFIGURATOR = '/configurator/index.html'
const DEMO_2D = '/demo/index.html'
const EXPO = [0.16, 1, 0.3, 1] as const
const SOFT = [0.33, 1, 0.68, 1] as const

/* Section parts rise in once, heading first, 70ms apart. Content is never left hidden for reduced motion. */
function Rise({ children, className, as = 'div', delay = 0 }: { children: ReactNode; className?: string; as?: 'div' | 'li' | 'p'; delay?: number }) {
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, ease: EXPO, delay }}
    >
      {children}
    </M>
  )
}

function Nav() {
  return (
    <nav className="nav" aria-label="Main">
      <a className="wordmark" href="#top">CMFStack</a>
      <ul className="nav__links">
        <li><a href="#zones">Zones</a></li>
        <li><a href="#views">Views</a></li>
        <li><a href="#library">Library</a></li>
        <li><a href="#sign-off">Sign-off</a></li>
      </ul>
    </nav>
  )
}

/* The split stage: the cabin holds still on the right while the reading column re-trims it zone by zone. */
function SplitStage() {
  const [sel, setSel] = useState<Record<string, string>>(() => Object.fromEntries(ZONES.map(z => [z.id, z.def])))
  const [active, setActive] = useState<string>('hero')
  const refs = useRef<Record<string, HTMLElement | null>>({})
  const reduce = useReducedMotion()

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.stage || 'hero') }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    Object.values(refs.current).forEach(el => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  const zone = ZONES.find(z => z.id === active)
  const mat = zone?.mats.find(m => m.id === sel[zone.id])
  const src = zone && mat ? zoneRender(zone.id, mat.id) : 'orbit'

  return (
    <div className="split" id="top">
      <div className="split__read">
        <header className="hero" ref={el => { refs.current.hero = el }} data-stage="hero">
          <Nav />
          <div className="hero__text">
            <motion.h1 initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO }}>
              CMF decisions, made in the car
            </motion.h1>
            <motion.p className="lead" initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO, delay: 0.09 }}>
              CMFStack lets car interior teams choose colour, material and finish zone by zone, on a live 3D cabin.
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EXPO, delay: 0.18 }}>
              <a className="button" href={CONFIGURATOR}>Open the configurator</a>
            </motion.div>
          </div>
        </header>

        <section className="zones" id="zones" aria-labelledby="zones-title">
          <Rise><h2 id="zones-title">Five zones, one cabin</h2></Rise>
          <Rise as="p" delay={0.07}>
            Every interior is split into the zones a CMF team signs off. Pick an option in each and the cabin beside this text is re-trimmed with it.
          </Rise>
          {ZONES.map(z => (
            <article key={z.id} className="zone" ref={el => { refs.current[z.id] = el }} data-stage={z.id} aria-labelledby={`zone-${z.id}`}>
              <Rise><h3 id={`zone-${z.id}`}>{z.name}</h3></Rise>
              <Rise as="p" delay={0.07}>{z.line}</Rise>
              <div className="zone__render">
                <img src={zoneRender(z.id, sel[z.id])} alt={`${z.name} in ${z.mats.find(m => m.id === sel[z.id])?.name}`} width={1100} height={1100} loading="lazy" />
              </div>
              <Rise delay={0.14}>
                <div className="options" role="group" aria-label={`${z.name} material`}>
                  {z.mats.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className="option"
                      aria-pressed={sel[z.id] === m.id}
                      onClick={() => { setSel(s => ({ ...s, [z.id]: m.id })); setActive(z.id) }}
                    >
                      <span className="option__name">{m.name}</span>
                      <span className="option__spec">{m.supplier} · {m.cost} · grade {m.sus}</span>
                    </button>
                  ))}
                </div>
              </Rise>
            </article>
          ))}
        </section>
      </div>

      <aside className="split__stage" aria-label="Cabin preview">
        <a className="stage__link" href={CONFIGURATOR}>Open in 3D</a>
        <div className="tile">
          <AnimatePresence initial={false}>
            {zone && mat ? (
              <motion.img
                key={src}
                src={src}
                alt={`${zone.name} trimmed in ${mat.name}`}
                width={1100}
                height={1100}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ opacity: { duration: 0.5 }, scale: { duration: 1.4, ease: SOFT } }}
              />
            ) : (
              <motion.video
                key="orbit"
                src={img('orbit.webm')}
                poster={img('orbit-poster.jpg')}
                aria-label="The Honda e reference model turning a full circle in Racing Green"
                autoPlay={!reduce}
                muted
                loop
                playsInline
                width={720}
                height={720}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>
        </div>
        <p className="stage__caption" aria-live="polite">
          {zone && mat ? (
            <><strong>{zone.name}: {mat.name}</strong><span>{mat.supplier} · {mat.cost} · durability {mat.dur.toLowerCase()} · grade {mat.sus}</span></>
          ) : (
            <><strong>Honda e reference model</strong><span>3.89 m long, five zones to trim</span></>
          )}
        </p>
      </aside>
    </div>
  )
}

/* Square plate, spare text: the four camera views as tabs. */
function Views() {
  const [view, setView] = useState(VIEWS[1].id)
  const v = VIEWS.find(x => x.id === view)!
  const reduce = useReducedMotion()
  return (
    <section className="views" id="views" aria-labelledby="views-title">
      <div className="views__plate">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={view}
            src={img(`view-${view}.jpg`)}
            alt={`${v.name} view of the trimmed cabin`}
            width={1100}
            height={1100}
            loading="lazy"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.45 }, scale: { duration: 1.2, ease: SOFT } }}
          />
        </AnimatePresence>
      </div>
      <div className="views__text">
        <Rise><h2 id="views-title">See it where it lives</h2></Rise>
        <div className="tabs" role="tablist" aria-label="Camera views">
          {VIEWS.map(x => (
            <button key={x.id} type="button" role="tab" aria-selected={x.id === view} aria-controls="views-panel" onClick={() => setView(x.id)}>
              {x.name}
            </button>
          ))}
        </div>
        <div id="views-panel" role="tabpanel" className="views__body">
          <Rise as="p" delay={0.07}>A swatch on a desk hides how a material behaves in a car. {v.text}</Rise>
        </div>
        <div className="cells">
          <a className="cell cell--ink" href={CONFIGURATOR}>Open the configurator</a>
          <a className="cell" href="#library">Read the library</a>
        </div>
      </div>
    </section>
  )
}

/* The printed sheet: the material library as a spec card. */
function Library() {
  return (
    <section className="library" id="library" aria-labelledby="library-title">
      <img className="library__ground" src={img('view-driver.jpg')} alt="Driver's view of the cabin with the default trim" width={1100} height={1100} loading="lazy" />
      <Rise className="sheet">
        <h2 id="library-title">The material library</h2>
        <p className="sheet__note">Sixteen sample materials across five zones</p>
        {ZONES.map(z => (
          <div className="sheet__group" key={z.id}>
            <h3>{z.name}</h3>
            <ul>
              {z.mats.map(m => (
                <li key={m.id}>
                  <span className="sheet__name">{m.name}</span>
                  <span className="sheet__cost">{m.cost}</span>
                  <span className="sheet__desc">{m.type} from {m.supplier} · durability {m.dur.toLowerCase()} · grade {m.sus}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="sheet__end">Trims are costed per m², console and wheel parts per unit.<br />Sustainability grades run from A to C+. All figures are sample data.</p>
      </Rise>
    </section>
  )
}

/* Itinerary on a slip: the route from shortlist to sign-off. */
function SignOff() {
  const stages = [
    { head: 'First pass', rows: [['Shortlist options for each zone', '2 to 4 each'], ['Read supplier, cost and grade', 'on every option']] },
    { head: 'In the cabin', rows: [['Try each option on the 3D model', '4 views'], ['Start from a preset combination', '3 presets'], ['Check the exterior paint against it', '5 paints']] },
    { head: 'Sign-off', rows: [['Approve, shortlist or reject', 'per material'], ['Flag rejected materials still in use', 'on the rail']] },
  ]
  return (
    <section className="signoff" id="sign-off" aria-labelledby="signoff-title">
      <div className="signoff__intro">
        <Rise><h2 id="signoff-title">From shortlist to sign-off</h2></Rise>
        <Rise as="p" delay={0.07}>
          Every material carries a status. A zone counts as signed off when the material in it is approved, and the rail keeps the count beside the cabin.
        </Rise>
      </div>
      <Rise className="slip" delay={0.14}>
        {stages.map(s => (
          <div className="slip__stage" key={s.head}>
            <h3>{s.head}</h3>
            {s.rows.map(([what, value]) => (
              <p className="slip__row" key={what}><span>{what}</span><i aria-hidden="true" /><span>{value}</span></p>
            ))}
          </div>
        ))}
        <p className="slip__total"><span>Interior spec signed off</span><span>5 of 5 zones</span></p>
      </Rise>
    </section>
  )
}

/* Drag row of mixed modules: presets and paints. */
function Gallery() {
  const P = (i: number) => ({ src: img(`preset-${i}.jpg`), alt: `${PRESETS[i].name} preset, ${PRESETS[i].score}% match, in the cutaway view` })
  const C = (i: number) => ({ src: img(`paint-${i}.png`), alt: `Honda e in ${PAINTS[i]}` })
  const modules: Array<{ kind: 'tall' | 'pair' | 'wide'; items: Array<{ src: string; alt: string }> }> = [
    { kind: 'tall', items: [P(0)] },
    { kind: 'pair', items: [C(0), C(1)] },
    { kind: 'wide', items: [P(1)] },
    { kind: 'pair', items: [C(2), C(3)] },
    { kind: 'tall', items: [P(2)] },
    { kind: 'wide', items: [C(4)] },
  ]
  return (
    <section className="gallery" id="presets" aria-labelledby="gallery-title">
      <div className="gallery__head">
        <Rise><h2 id="gallery-title">Presets and paints</h2></Rise>
        <Rise as="p" delay={0.07}>Premium Dark, Warm Contrast and Nordic Light, then the body in five sample paints.</Rise>
        <p className="gallery__count">8 renders</p>
      </div>
      <div className="row" tabIndex={0} aria-label="Preset and paint renders, scroll sideways">
        {modules.map((mod, i) => (
          <Rise className={`module module--${mod.kind}`} key={i} delay={i * 0.07}>
            {mod.items.map(it => (
              <figure key={it.src} className={it.src.endsWith('.png') ? 'cutout' : ''}>
                <img src={it.src} alt={it.alt} loading="lazy" draggable={false} />
              </figure>
            ))}
          </Rise>
        ))}
      </div>
    </section>
  )
}

function Close() {
  return (
    <>
      <div className="cta">
        <Rise as="p">Open the Honda e cabin and try a material on every zone yourself.</Rise>
        <Rise className="cta__actions" delay={0.07}>
          <a className="button button--accent" href={CONFIGURATOR}>Open the configurator</a>
          <a href={DEMO_2D}>See the 2D demo</a>
        </Rise>
      </div>
      <footer className="footer">
        <p>CMFStack, CMF decisions in 3D</p>
        <p className="footer__links">
          <a href={CONFIGURATOR}>Configurator</a>
          <a href={DEMO_2D}>2D demo</a>
          <span>Honda e model: <a href={MODEL_CREDIT.src}>{MODEL_CREDIT.title}</a> by {MODEL_CREDIT.author}, <a href={MODEL_CREDIT.license}>CC BY 4.0</a></span>
        </p>
        <p>2026 · Sample data</p>
      </footer>
    </>
  )
}

export default function App() {
  return (
    <main>
      <SplitStage />
      <Views />
      <Library />
      <SignOff />
      <Gallery />
      <Close />
    </main>
  )
}
