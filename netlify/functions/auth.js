// netlify/functions/auth.js
// Step 1 of the GitHub OAuth flow used by Decap CMS ("Decap Bridge").
// Redirects the CMS login popup to GitHub's authorize screen.

exports.handler = async (event) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const siteUrl = process.env.URL || `https://${event.headers.host}`;

  if (!clientId) {
    return {
      statusCode: 500,
      body: "Thiếu biến môi trường OAUTH_GITHUB_CLIENT_ID trên Netlify.",
    };
  }

  const redirectUri = `${siteUrl}/api/callback`;
  const state = Math.random().toString(36).slice(2);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "repo,user",
    state,
  });

  return {
    statusCode: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`,
    },
    body: "",
  };
};
