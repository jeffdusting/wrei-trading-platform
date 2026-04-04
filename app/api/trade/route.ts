/**
 * /api/trade route — thin re-export of /api/negotiate
 *
 * Both endpoints serve the same negotiation logic.
 * The canonical implementation lives in /api/negotiate/route.ts.
 */
export { POST } from '@/app/api/negotiate/route';
