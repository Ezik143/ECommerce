/** @type {import('react-doctor').Config} */
export default {
  rules: {
    // Auth0 Client ID (VITE_AUTH0_CLIENT_ID) is intentionally public by design.
    // Only Auth0 Client Secrets are sensitive. The pattern detector flags
    // the 32-char alphanumeric Client ID as a "secret" but this is a false positive.
    // Set to "warn" to acknowledge without blocking CI.
    'react-doctor/artifact-secret-leak': 'warn',
  },
};