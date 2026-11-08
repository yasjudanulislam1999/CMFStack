/* Vercel Routing Middleware: the login gateway for the configurator and the 2D demo.
   Runs on Vercel before those static files are served (see vercel.json). Signed-out visitors go to /sign-in,
   which returns them to the page they asked for. It fails closed: without keys, nobody gets through. */
import { createClerkClient } from '@clerk/backend'
import { next } from '@vercel/functions'

const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || ''
const secretKey = process.env.CLERK_SECRET_KEY || ''
const clerk = publishableKey && secretKey ? createClerkClient({ publishableKey, secretKey }) : null

function toSignIn(request: Request) {
  const url = new URL(request.url)
  // Never carry Clerk's one-time handshake parameters into the return address; replaying them signs the visitor out.
  for (const key of [...url.searchParams.keys()]) if (key.startsWith('__clerk')) url.searchParams.delete(key)
  const signIn = new URL('/sign-in', url.origin)
  signIn.searchParams.set('redirect_url', url.pathname + url.search)
  return new Response(null, { status: 307, headers: { Location: signIn.toString(), 'Cache-Control': 'no-store' } })
}

export default async function proxy(request: Request) {
  if (!clerk) {
    console.error('Login gateway: CLERK_SECRET_KEY or the publishable key is missing; blocking protected pages.')
    return toSignIn(request)
  }
  try {
    const state = await clerk.authenticateRequest(request, { authorizedParties: [new URL(request.url).origin] })
    // Clerk needs a round trip to refresh or establish the session; its headers carry the redirect.
    if (state.status === 'handshake') return new Response(null, { status: 307, headers: state.headers })
    // After a handshake Clerk sets cookies and redirects to the clean URL (development keys). Follow it, as Clerk's own SDKs do.
    if (state.headers.get('location')) return new Response(null, { status: 307, headers: state.headers })
    if (state.isAuthenticated) {
      const headers = new Headers(state.headers)
      headers.set('Cache-Control', 'private, no-store')
      return next({ headers })
    }
  } catch (err) {
    console.error('Login gateway: session check failed', err)
  }
  return toSignIn(request)
}
