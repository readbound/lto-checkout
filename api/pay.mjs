import { handle } from '../lib/payment.mjs';
export default { fetch(request) { return handle(request); } };
