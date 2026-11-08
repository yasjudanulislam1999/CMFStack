/* Login gateway, client side. The real gate is proxy.ts on Vercel; this file gives the sign-in screen,
   sends signed-out visitors to it before they open the tool, and shows the account button. */
import { useEffect } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import { SignIn, SignUp, UserButton, useAuth } from '@clerk/react'
import logo from './assets/logo.svg'

export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined
export const PROTECTED_HOME = '/configurator/index.html'

export const clerkAppearance = {
  variables: {
    colorPrimary: '#ffffff',
    colorPrimaryForeground: '#000000',
    colorBackground: '#111113',
    colorForeground: '#ffffff',
    colorMutedForeground: '#8e8e8e',
    colorMuted: '#1b1b1d',
    colorInput: '#1b1b1d',
    colorInputForeground: '#ffffff',
    colorNeutral: '#ffffff',
    colorBorder: 'rgba(255, 255, 255, 0.14)',
    colorRing: 'rgba(255, 255, 255, 0.6)',
    borderRadius: '14px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
}

export const signInHref = (target = PROTECTED_HOME) => `/sign-in?redirect_url=${encodeURIComponent(target)}`

type LinkProps = { href: string; className?: string; children: ReactNode; onClick?: () => void }

/* A link to a protected page: signed-out visitors go through /sign-in first and come back afterwards. */
function GatedLink({ href, className, children, onClick }: LinkProps) {
  const { isLoaded, isSignedIn } = useAuth()
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.()
    if (isLoaded && !isSignedIn) { e.preventDefault(); window.location.assign(signInHref(href)) }
  }
  return <a href={href} className={className} onClick={go}>{children}</a>
}
const PlainLink = ({ href, className, children, onClick }: LinkProps) => <a href={href} className={className} onClick={onClick}>{children}</a>
export const ProtectedLink = CLERK_KEY ? GatedLink : PlainLink

/* Header slot: "Sign in" when signed out, the Clerk account menu when signed in. */
function ClerkAccount() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return <span className="account account--loading" aria-hidden="true" />
  if (isSignedIn) return <span className="account"><UserButton /></span>
  return <a className="account account--signin" href={signInHref()}>Sign in</a>
}
export const AccountSlot = CLERK_KEY ? ClerkAccount : () => null

/* Safety net: a visitor who reaches /sign-in already signed in (for example while the session cookie was still
   being written) is sent on to the page they asked for, at most twice a minute so a server refusal can't loop. */
function ForwardIfSignedIn() {
  const { isLoaded, isSignedIn } = useAuth()
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    const raw = new URLSearchParams(window.location.search).get('redirect_url') || PROTECTED_HOME
    const target = new URL(raw, window.location.origin)
    if (target.origin !== window.location.origin) return
    for (const key of [...target.searchParams.keys()]) if (key.startsWith('__clerk')) target.searchParams.delete(key)
    let recent: number[] = []
    try { recent = (JSON.parse(sessionStorage.getItem('cmf-forward') || '[]') as number[]).filter(t => Date.now() - t < 60000) } catch { /* storage unavailable */ }
    if (recent.length >= 2) return
    try { sessionStorage.setItem('cmf-forward', JSON.stringify([...recent, Date.now()])) } catch { /* storage unavailable */ }
    window.location.replace(target.pathname + target.search + target.hash)
  }, [isLoaded, isSignedIn])
  return null
}

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  return (
    <div className="auth">
      {CLERK_KEY && <ForwardIfSignedIn />}
      <a className="auth__home" href="/" aria-label="Back to CMFStack">
        <span className="logo"><img src={logo} alt="" width={52} height={52} /></span>
        <span>CMFStack</span>
      </a>
      <main className="auth__main">
        <h1 className="auth__title">{mode === 'sign-in' ? 'Sign In To The Cabin' : 'Create Your Account'}</h1>
        <p className="auth__lead">The configurator and the 2D demo are for signed-in members of the team.</p>
        {CLERK_KEY ? (
          mode === 'sign-in'
            ? <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl={PROTECTED_HOME} appearance={clerkAppearance} />
            : <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl={PROTECTED_HOME} appearance={clerkAppearance} />
        ) : (
          <p className="auth__missing" role="alert">
            Login isn’t configured yet. Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>.env.local</code> (local) or to the Vercel project settings, then reload.
          </p>
        )}
      </main>
      <a className="auth__back" href="/">Back to the overview</a>
    </div>
  )
}
