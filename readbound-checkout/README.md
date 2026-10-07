# ReadBound checkout — Netlify project

Responsive two-column checkout for the Learning Loop Bundle, $27 USD one time.

## Configuration

The client and server are configured for `plan_9OdViY3cuqEzT` and `biz_le2xpTfOF4nBmA`. The app ID is not required by this standalone Elements flow. No private key is included.

Deploy this project through a Netlify Git repository import or the Netlify CLI. A static drag-and-drop upload alone will not deploy the payment function. Netlify installs the locked SDK dependency and publishes `public/` plus the server function specified in `netlify.toml`.

Set these environment variables in Netlify (server/function scope):

- `WHOP_API_KEY`: a newly rotated account API key authorized to create payments.
- `CHECKOUT_ORIGIN`: the exact HTTPS origin, without trailing slash. Use the assigned Netlify origin initially, then `https://checkout.thereadbound.com` once configured.
- `PAYMENTS_ENABLED`: leave unset until the launch checks below are complete; set `true` to enable live charging.

The previously exposed key must be revoked. Do not put it in source code, public environment variables, this README, or a Git repository.

## Framer Step 1

Capture first name and email in Framer and save the submission to your email platform through its form integration/webhook before redirecting. This checkout does not store leads or send abandoned checkout emails.

Redirect to your checkout with URL-encoded `name` and `email` parameters to prefill. The checkout immediately removes those parameters from browser history and uses a no-referrer policy. URLs may still appear in upstream logs; an opaque, short-lived lead handoff token is preferable before using paid traffic.

Do not mark a lead purchased based on the thank-you URL. Use a verified Whop `payment.succeeded` webhook, matched by order metadata/email, to stop abandoned-checkout emails.

## What is implemented

- ReadBound navy/gold/paper design with mobile layout and a CSS bundle illustration.
- Name/email prefill; email passed into Whop's confirmation token.
- Whop PaymentElement and required BrandingElement.
- Server-fixed product/price selection, origin checks, request validation and token-scoped idempotency header.
- Loading, unavailable, declined/incomplete, pending and completed payment displays.
- Existing Whop checkout fallback and published terms/return policy links.
- Hidden order-bump insertion point. No bump is displayed or charged.

## Required launch checks / limitations

This is a buildable first version, not a verified live checkout. No charge was made during development.

1. Confirm key permissions and that the plan is $27 USD one time under this business.
2. Confirm Whop's final amount, taxes and any buyer service fees. The current page displays the product price only. Add server-side payment quotes and an exact visible total before enabling live payments if any extra amounts can apply. Do not rely on the small-print disclosure to authorize an undisclosed charge.
3. Validate card, decline, 3DS and redirect flows in Whop's supported test environment. Verify the idempotency header behavior with the API.
4. Confirm that buying this saved plan grants the expected Whop access, and that all product files are available. Custom fulfillment and email automation are not implemented. Connect a signature-verified webhook before adding external delivery or abandoned checkout sequences.
5. Replace the CSS bundle illustration with your approved product mockup. Review offer inclusions and the guarantee against the final sales page and published return policy.
6. Add only genuine, approved testimonials. None are fabricated or included here.
7. Choose an order bump, then add its Whop variant and fulfillment. Whop's current Payments API supports multiple variants using `line_items`; pricing and access must be verified before activation. A hidden slot is not a completed bump integration.

Return page URL parameters are display hints only and never grant access. Pending transactions should be checked in Whop before trying a new charge.

## Local checks

Run `npm ci` and `npm test` for server validation tests. To inspect the layout, serve `public/` with a local static server. That server does not run Netlify functions; use Netlify Dev for the integrated server flow.

Docs followed: https://docs.whop.com/developer/guides/payment-elements and https://docs.whop.com/elements/latest/payments/overview .
