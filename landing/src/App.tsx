import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import logo from './assets/logo.svg'
import { MODEL_CREDIT, PRESETS, ZONES, img, zoneRender } from './data'
import { AccountSlot, ProtectedLink } from './auth'

const CONFIGURATOR = '/configurator/index.html'
const DEMO_2D = '/demo/index.html'
const EASE = [0.22, 1, 0.36, 1] as const

const LINKS = [
  { label: 'Home', href: '#top', active: true },
  { label: 'How It Works', href: '#how' },
  { label: 'Zones', href: '#zones' },
  { label: 'Library', href: '#library' },
]

/* Real figures from the sample data in cmfstack-3d.html */
const STATS = [
  { icon: '#', target: 16, suffix: '', decimals: 0, label: 'Sample Materials' },
  { icon: '*', target: 5, suffix: '', decimals: 0, label: 'Cabin Zones' },
  { icon: '<', target: 4, suffix: '', decimals: 0, label: 'Camera Views' },
  { icon: '%', target: 94, suffix: '%', decimals: 0, label: 'Top Preset Match' },
]

const SWATCHES = [
  { src: img('swatch-m2.png'), name: 'Nappa leather, cognac' },
  { src: img('swatch-m6.png'), name: 'Open pore walnut' },
  { src: img('swatch-m4.png'), name: 'Woven textile, taupe' },
]

const CAPABILITIES = [
  {
    title: 'Try materials on the real cabin',
    text: 'Pick a zone and swap its material on a live 3D cabin. Check it from outside, in a cutaway, from the driver’s seat and from the rear bench, against any of five exterior paints.',
    image: img('view-overview.jpg'),
    alt: 'Cutaway of the cabin with every zone visible',
    facts: ['5 interior zones', '4 camera views', '5 exterior paints'],
  },
  {
    title: 'Decide with the facts beside the look',
    text: 'Every option carries its supplier, cost, durability and sustainability grade, so the material that looks right is also one you can source, afford and defend.',
    image: zoneRender('z4', 'm11'),
    alt: 'Burl wood accent applied to the dash and centre console',
    facts: ['Burl Wood Accent', 'Tabu S.p.A', '£72 per unit', 'Grade B'],
  },
  {
    title: 'Sign off zone by zone',
    text: 'Approve, shortlist or reject each material. The rail counts the zones signed off, averages the sustainability grade and warns you when a rejected material is still in use.',
    image: img('view-rear.jpg'),
    alt: 'Rear-seat view of the trimmed cabin',
    facts: ['Approve', 'Shortlist', 'Reject'],
  },
]

const STEPS = [
  { title: 'Choose a zone', text: 'Seats, door panels, headliner, centre console or steering wheel.' },
  { title: 'Try the options', text: 'Swap materials on the 3D cabin, or start from a preset such as Premium Dark.' },
  { title: 'Compare the facts', text: 'Read supplier, cost, durability and sustainability grade side by side.' },
  { title: 'Sign it off', text: 'Approve or reject, and watch the cabin’s sign-off count reach five of five.' },
]

const AUDIENCE = [
  { title: 'CMF designers', text: 'Build and compare interior schemes on the car itself instead of on a swatch board.' },
  { title: 'Design reviews', text: 'Walk a room through the cabin from four viewpoints and record each decision as it is made.' },
  { title: 'Engineering and sourcing', text: 'See supplier, cost and durability for every option before a material is approved.' },
]

/* Section parts rise in once as they enter; nothing stays hidden for reduced motion. */
function Rise({ children, className, delay = 0, as = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: 'div' | 'li' | 'p' | 'h2' }) {
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      {children}
    </M>
  )
}

/* Shared hero entrance: rise, unblur and settle. */
const reveal = (d: number, reduce: boolean | null) =>
  reduce
    ? {}
    : {
        initial: { opacity: 0, y: 22, scale: 0.98, filter: 'blur(6px)' },
        animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
        transition: { duration: 0.85, ease: EASE, delay: d },
      }

function CountUp({ target, decimals, suffix, index }: { target: number; decimals: number; suffix: string; index: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? target : 0)

  useEffect(() => {
    if (reduce || !ref.current) return
    let raf = 0
    let timer = 0
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        io.disconnect()
        const duration = 1500 + index * 80
        timer = window.setTimeout(() => {
          const t0 = performance.now()
          const tick = (now: number) => {
            const p = Math.min(1, (now - t0) / duration)
            setValue(target * (1 - Math.pow(1 - p, 3)))
            if (p < 1) raf = requestAnimationFrame(tick)
          }
          raf = requestAnimationFrame(tick)
        }, 480 + index * 90)
      },
      { threshold: 0.25 },
    )
    io.observe(ref.current)
    return () => { io.disconnect(); cancelAnimationFrame(raf); clearTimeout(timer) }
  }, [target, index, reduce])

  return <span ref={ref} className="stat__value">{value.toFixed(decimals)}{suffix}</span>
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="overlay" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} />
          <motion.nav
            id="mobile-menu"
            className="sheet"
            aria-label="Main"
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.38, ease: EASE }}
          >
            {LINKS.map((l, i) => (
              <motion.a
                key={l.label}
                href={l.href}
                className={l.active ? 'is-active' : undefined}
                aria-current={l.active ? 'page' : undefined}
                onClick={onClose}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: 0.06 + i * 0.05 }}
              >
                {l.label}
              </motion.a>
            ))}
            <motion.div
              className="sheet__actions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.06 + LINKS.length * 0.05 }}
            >
              <ProtectedLink className="sheet__cta" href={CONFIGURATOR} onClick={onClose}>Open in 3D</ProtectedLink>
              <AccountSlot />
            </motion.div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  )
}

/* The live part of the page: pick a zone and a material, the cabin render and its facts follow. */
function ZoneExplorer() {
  const reduce = useReducedMotion()
  const [zoneId, setZoneId] = useState(ZONES[0].id)
  const [sel, setSel] = useState<Record<string, string>>(() => Object.fromEntries(ZONES.map(z => [z.id, z.def])))
  const zone = ZONES.find(z => z.id === zoneId)!
  const mat = zone.mats.find(m => m.id === sel[zone.id])!

  return (
    <section className="section zones" id="zones" aria-labelledby="zones-title">
      <div className="section__head">
        <Rise as="h2" className="section__title"><span id="zones-title">Five Zones, One Cabin</span></Rise>
        <Rise as="p" className="section__lead" delay={0.07}>
          Each zone carries its own shortlist. Pick one, try its materials, and the cabin and the facts change together.
        </Rise>
      </div>
      <div className="explorer">
        <div className="explorer__render">
          <AnimatePresence initial={false}>
            <motion.img
              key={zone.id + mat.id}
              src={zoneRender(zone.id, mat.id)}
              alt={`${zone.name} in ${mat.name}`}
              width={1100}
              height={1100}
              loading="lazy"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.45 }, scale: { duration: 1.1, ease: EASE } }}
            />
          </AnimatePresence>
        </div>
        <div className="explorer__panel">
          <div className="zone-tabs" role="tablist" aria-label="Cabin zones">
            {ZONES.map(z => (
              <button key={z.id} type="button" role="tab" aria-selected={z.id === zoneId} aria-controls="zone-panel" onClick={() => setZoneId(z.id)}>
                {z.name}
              </button>
            ))}
          </div>
          <div id="zone-panel" role="tabpanel" aria-label={zone.name} className="zone-panel">
            <p className="zone-panel__line">{zone.line}</p>
            <div className="materials" role="group" aria-label={`${zone.name} materials`}>
              {zone.mats.map(m => (
                <button key={m.id} type="button" className="material" aria-pressed={m.id === mat.id} onClick={() => setSel(s => ({ ...s, [zone.id]: m.id }))}>
                  <span className="material__name">{m.name}</span>
                  <span className="material__type">{m.type}</span>
                </button>
              ))}
            </div>
            <dl className="specs" aria-live="polite">
              <div><dt>Supplier</dt><dd>{mat.supplier}</dd></div>
              <div><dt>Cost</dt><dd>{mat.cost}</dd></div>
              <div><dt>Durability</dt><dd>{mat.dur}</dd></div>
              <div><dt>Sustainability</dt><dd>Grade {mat.sus}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const reduce = useReducedMotion()
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    document.body.classList.toggle('menu-open', menu)
    if (!menu) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    const onResize = () => { if (window.innerWidth > 720) setMenu(false) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize) }
  }, [menu])

  return (
    <>
      <div className="header-fade" aria-hidden="true" />
      <motion.header
        className="header"
        initial={reduce ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <a className="logo" href="#top" aria-label="CMFStack home">
          <img src={logo} alt="" width={52} height={52} />
        </a>
        <nav className="nav" aria-label="Main">
          {LINKS.map(l => (
            <a key={l.label} href={l.href} className={l.active ? 'is-active' : undefined} aria-current={l.active ? 'page' : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
        <ProtectedLink className="signin" href={CONFIGURATOR}>Open in 3D</ProtectedLink>
        <span className="header__account"><AccountSlot /></span>
        <button
          type="button"
          className={`burger${menu ? ' is-open' : ''}`}
          aria-label={menu ? 'Close menu' : 'Open menu'}
          aria-expanded={menu}
          aria-controls="mobile-menu"
          onClick={() => setMenu(m => !m)}
        >
          <span /><span /><span />
        </button>
      </motion.header>

      <MobileMenu open={menu} onClose={() => setMenu(false)} />

      <main>
        <section className="hero-screen" id="top" aria-labelledby="hero-title">
          <div className="bg" aria-hidden="true">
            <video className="bg-video" autoPlay={!reduce} muted loop playsInline poster="/media/cabin-orbit-poster.jpg">
              <source src="/media/cabin-orbit.webm" type="video/webm" />
            </video>
          </div>

          <div className="hero">
            <motion.div className="trust" {...reveal(0.05, reduce)}>
              {SWATCHES.map((s, i) => (
                <span key={s.name} className={`avatar a${i + 1}`} title={s.name}>
                  <img src={s.src} alt={s.name} width={96} height={96} />
                </span>
              ))}
              <span className="trust__pill">For car interior CMF teams</span>
            </motion.div>

            <h1 className="headline" id="hero-title">
              {['CMF Decisions,', 'Made In The Car'].map((line, i) => (
                <motion.span
                  key={line}
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, ease: EASE, delay: i ? 0.3 : 0.12 }}
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <motion.p className="subhead" {...reveal(0.28, reduce)}>
              CMFStack is a colour, material and finish tool for car interior teams. Compare materials zone by zone on a live 3D cabin, then sign them off.
            </motion.p>

            <motion.div className="hero__actions" {...reveal(0.4, reduce)}>
              <ProtectedLink className="cta" href={CONFIGURATOR}>Open the Configurator</ProtectedLink>
              <a className="ghost" href="#how">See how it works</a>
            </motion.div>
          </div>

          <div className="hero__stats">
            <ul className="stats">
              {STATS.map((s, i) => (
                <motion.li key={s.label} className="stat" {...reveal(0.5 + i * 0.08, reduce)}>
                  <span className="stat__icon" aria-hidden="true">{s.icon}</span>
                  <CountUp target={s.target} decimals={s.decimals} suffix={s.suffix} index={i} />
                  <span className="stat__label">{s.label}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section what" id="what" aria-labelledby="what-title">
          <div className="section__head">
            <Rise as="h2" className="section__title"><span id="what-title">One Cabin, Every Decision</span></Rise>
            <Rise as="p" className="section__lead" delay={0.07}>
              Interior materials are usually judged as swatches on a table. CMFStack puts them on the car, next to the numbers that decide whether they make it into production.
            </Rise>
          </div>
          <div className="capabilities">
            {CAPABILITIES.map((c, i) => (
              <article key={c.title} className={`capability${i % 2 ? ' capability--flip' : ''}`}>
                <Rise className="capability__media">
                  <img src={c.image} alt={c.alt} width={1100} height={1100} loading="lazy" />
                </Rise>
                <div className="capability__text">
                  <Rise as="h2" className="capability__title">{c.title}</Rise>
                  <Rise as="p" delay={0.07}>{c.text}</Rise>
                  <Rise delay={0.14}>
                    <ul className="facts" aria-label="Example">
                      {c.facts.map(f => <li key={f}>{f}</li>)}
                    </ul>
                  </Rise>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section how" id="how" aria-labelledby="how-title">
          <div className="section__head">
            <Rise as="h2" className="section__title"><span id="how-title">How It Works</span></Rise>
            <Rise as="p" className="section__lead" delay={0.07}>
              From an open shortlist to a signed-off interior in four moves, with every choice visible on the cabin.
            </Rise>
          </div>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <Rise as="li" key={s.title} className="step" delay={i * 0.08}>
                <span className="step__mark" aria-hidden="true">{['>', '+', '=', '*'][i]}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Rise>
            ))}
          </ol>
          <Rise className="presets">
            <p className="presets__label">Or start from a preset</p>
            <div className="presets__row">
              {PRESETS.map((p, i) => (
                <figure key={p.name} className="preset">
                  <img src={img(`preset-${i}.jpg`)} alt={`${p.name} preset in the cutaway view`} width={1100} height={1100} loading="lazy" />
                  <figcaption><span>{p.name}</span><span>{p.score}% match</span></figcaption>
                </figure>
              ))}
            </div>
          </Rise>
        </section>

        <ZoneExplorer />

        <section className="section library" id="library" aria-labelledby="library-title">
          <div className="section__head">
            <Rise as="h2" className="section__title"><span id="library-title">The Material Library</span></Rise>
            <Rise as="p" className="section__lead" delay={0.07}>
              Sixteen sample materials across five zones, each with the facts a sign-off needs. Trims are costed per m², console and wheel parts per unit.
            </Rise>
          </div>
          <Rise className="table-wrap">
            <table className="lib-table">
              <thead>
                <tr><th scope="col">Material</th><th scope="col">Zone</th><th scope="col">Supplier</th><th scope="col" className="num">Cost</th><th scope="col">Durability</th><th scope="col" className="num">Grade</th></tr>
              </thead>
              <tbody>
                {ZONES.flatMap(z => z.mats.map(m => (
                  <tr key={m.id}>
                    <th scope="row">{m.name}<small>{m.type}</small></th>
                    <td>{z.name}</td>
                    <td>{m.supplier}</td>
                    <td className="num">{m.cost}</td>
                    <td>{m.dur}</td>
                    <td className="num">{m.sus}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </Rise>
        </section>

        <section className="section who" id="who" aria-labelledby="who-title">
          <div className="section__head">
            <Rise as="h2" className="section__title"><span id="who-title">Built For Interior Teams</span></Rise>
          </div>
          <div className="audience">
            {AUDIENCE.map((a, i) => (
              <Rise key={a.title} className="audience__item" delay={i * 0.08}>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </Rise>
            ))}
          </div>
        </section>

        <section className="section close" aria-labelledby="close-title">
          <Rise as="h2" className="close__title"><span id="close-title">Open The Cabin</span></Rise>
          <Rise as="p" className="section__lead" delay={0.07}>Sign in, then try a material on every zone of the Honda e cabin and sign the interior off yourself.</Rise>
          <Rise className="hero__actions" delay={0.14}>
            <ProtectedLink className="cta" href={CONFIGURATOR}>Open the Configurator</ProtectedLink>
            <ProtectedLink className="ghost" href={DEMO_2D}>See the 2D demo</ProtectedLink>
          </Rise>
        </section>
      </main>

      <footer className="footer">
        <p>CMFStack · Colour, material and finish decisions in 3D</p>
        <p className="credit">
          Honda e model: <a href={MODEL_CREDIT.src}>{MODEL_CREDIT.title}</a> by {MODEL_CREDIT.author}, <a href={MODEL_CREDIT.license}>CC BY 4.0</a>.
          {' '}Display font from <a href="http://www.onlinewebfonts.com/fonts">Web Fonts</a>, CC BY 4.0. All materials, suppliers and figures are sample data.
        </p>
      </footer>
    </>
  )
}
