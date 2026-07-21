import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

// Small HTML page that hands the result back to the Decap CMS window that
// opened the OAuth popup, using the postMessage handshake Decap expects.
function renderBody(status: 'success' | 'error', content: unknown): string {
  return `<!doctype html>
<html>
  <body>
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${JSON.stringify(content)}',
          message.origin
        );
        window.removeEventListener('message', receiveMessage, false);
      };
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    </script>
  </body>
</html>`;
}

const htmlHeaders = { 'content-type': 'text/html;charset=UTF-8' };

// GitHub redirects here with a `code` after the user authorizes. We exchange
// it for an access token (using the client secret, server-side only) and pass
// the token back to the CMS.
export const GET: APIRoute = async ({ request }) => {
  const code = new URL(request.url).searchParams.get('code');

  try {
    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'decap-cms-github-oauth',
          accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      },
    );

    const result = (await response.json()) as {
      access_token?: string;
      error?: string;
    };

    if (result.error) {
      return new Response(renderBody('error', result), {
        status: 401,
        headers: htmlHeaders,
      });
    }

    return new Response(
      renderBody('success', {
        token: result.access_token,
        provider: 'github',
      }),
      { status: 200, headers: htmlHeaders },
    );
  } catch (error) {
    return new Response(
      renderBody('error', { message: (error as Error).message }),
      { status: 500, headers: htmlHeaders },
    );
  }
};
