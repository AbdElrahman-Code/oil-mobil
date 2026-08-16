import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Everything except Payload admin/API, Next internals and static files.
  matcher: ['/((?!admin|api|_next|media|favicon.ico|.*\..*).*)'],
}
