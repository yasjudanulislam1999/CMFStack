import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './index.css'
import App from './App.tsx'
import { AuthPage, CLERK_KEY, clerkAppearance } from './auth.tsx'

/* Two routes besides the landing page: /sign-in and /sign-up (Clerk handles their sub-paths). */
const path = window.location.pathname
const page = path.startsWith('/sign-in') ? <AuthPage mode="sign-in" /> : path.startsWith('/sign-up') ? <AuthPage mode="sign-up" /> : <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {CLERK_KEY ? (
      <ClerkProvider publishableKey={CLERK_KEY} signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/" appearance={clerkAppearance}>
        {page}
      </ClerkProvider>
    ) : page}
  </StrictMode>,
)
