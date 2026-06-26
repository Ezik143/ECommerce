interface AuthConfig {
  domain: string;
  clientId: string;
  audience: string;
}

let cached: AuthConfig | null = null;

export async function getAuthConfig(): Promise<AuthConfig> {
  if (cached) return cached;

  let config: AuthConfig;

  if (import.meta.env.PROD) {
    const res = await fetch('/api/auth-config');
    if (!res.ok) throw new Error('Failed to load auth config');
    config = await res.json();
  } else {
    config = {
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    };
  }

  cached = config;
  return config;
}
