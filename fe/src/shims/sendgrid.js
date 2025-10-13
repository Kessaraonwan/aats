// Browser shim for @sendgrid/mail to prevent bundling server-only Node code
// This provides no-op functions so imports won't break the build.

export function setApiKey() {
  // no-op in browser
}

export async function send() {
  if (import.meta.env.DEV) {
    // In dev, log to console to make it visible that email send is stubbed
    // eslint-disable-next-line no-console
    console.warn('[sendgrid shim] Attempted to send email from frontend. This is a no-op in the browser.');
  }
  return { statusCode: 200, body: 'sendgrid shim noop' };
}

export default { setApiKey, send };
