import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

// Server-rendered so it can read secrets and redirect at request time.
export const prerender = false;

// Kicks off the GitHub OAuth flow for Decap CMS. Decap opens this endpoint
// (base_url + auth_endpoint in config.yml); we bounce the user to GitHub's
// authorize screen, which will call /api/callback when they approve.
export const GET: APIRoute = ({ request }) => {
  const clientId = env.GITHUB_CLIENT_ID;
  const { origin } = new URL(request.url);

  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('redirect_uri', `${origin}/api/callback`);
  authorize.searchParams.set('scope', 'repo,user');
  authorize.searchParams.set(
    'state',
    crypto.getRandomValues(new Uint8Array(12)).join(''),
  );

  return new Response(null, {
    status: 302,
    headers: { Location: authorize.href },
  });
};
