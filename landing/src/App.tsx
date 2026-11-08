import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import logo from './assets/logo.svg'
import { MODEL_CREDIT, img } from './data'

const CONFIGURATOR = '/configurator/index.html'
const DEMO_2D = '/demo/index.html'
const EASE = [0.22, 1, 0.36, 1] as const

const LINKS = [
  { label: 'Home', href: '#top', active: true },
  { label: 'Configurator', href: CONFIGURATOR },
  { label: '2D Demo', href: DEMO_2D },
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

/* Shared entrance: rise, unblur and settle. Delay comes from each element's place in the stagger. */
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
            <motion.a
              className="sheet__cta"
              href={CONFIGURATOR}
              onClick={onClose}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.06 + LINKS.length * 0.05 }}
            >
              Open in 3D
            </motion.a>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
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
      <div className="bg" aria-hidden="true">
        <video className="bg-video" autoPlay={!reduce} muted loop playsInline poster="/media/cabin-orbit-poster.jpg">
          <source src="/media/cabin-orbit.webm" type="video/webm" />
        </video>
      </div>

      <div className="page" id="top">
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
          <a className="signin" href={CONFIGURATOR}>Open in 3D</a>
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

        <main className="hero">
          <motion.div className="trust" {...reveal(0.05, reduce)}>
            {SWATCHES.map((s, i) => (
              <span key={s.name} className={`avatar a${i + 1}`} title={s.name}>
                <img src={s.src} alt={s.name} width={96} height={96} />
              </span>
            ))}
            <span className="trust__pill">16 materials, 5 zones, 1 live cabin</span>
          </motion.div>

          <h1 className="headline">
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
            Choose colour, material and finish zone by zone on a live 3D cabin, with supplier, cost and sustainability grade on every option.
          </motion.p>

          <motion.a
            className="cta"
            href={CONFIGURATOR}
            {...(reduce
              ? {}
              : {
                  initial: { opacity: 0, y: 22, scale: 0.94, filter: 'blur(6px)' },
                  animate: { opacity: 1, y: 0, scale: [0.94, 1.04, 1], filter: 'blur(0px)' },
                  transition: { duration: 0.95, ease: EASE, delay: 0.4 },
                })}
          >
            Open the Configurator
          </motion.a>
        </main>

        <footer className="footer">
          <ul className="stats">
            {STATS.map((s, i) => (
              <motion.li key={s.label} className="stat" {...reveal(0.5 + i * 0.08, reduce)}>
                <span className="stat__icon" aria-hidden="true">{s.icon}</span>
                <CountUp target={s.target} decimals={s.decimals} suffix={s.suffix} index={i} />
                <span className="stat__label">{s.label}</span>
              </motion.li>
            ))}
          </ul>
          <p className="credit">
            Honda e model: <a href={MODEL_CREDIT.src}>{MODEL_CREDIT.title}</a> by {MODEL_CREDIT.author}, <a href={MODEL_CREDIT.license}>CC BY 4.0</a>.
            {' '}Display font from <a href="http://www.onlinewebfonts.com/fonts">Web Fonts</a>, CC BY 4.0. All figures are sample data.
          </p>
        </footer>
      </div>
    </>
  )
}
