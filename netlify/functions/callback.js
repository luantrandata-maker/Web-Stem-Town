// netlify/functions/callback.js
// Step 2 of the GitHub OAuth flow used by Decap CMS ("Decap Bridge").
// Exchanges the temporary `code` for an access token, then sends that
// token back to the CMS admin window via postMessage, exactly in the
// format Decap CMS expects: "authorization:github:success:{...}"

function renderResponsePage(status, payloadObj) {
  const message = `authorization:github:${status}:${JSON.stringify(payloadObj)}`;
  return `<!doctype html>
<html><body>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage(
      '${message}',
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body></html>`;
}

exports.handler = async (event) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = event.queryStringParameters && event.queryStringParameters.code;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: "Thiếu OAUTH_GITHUB_CLIENT_ID / OAUTH_GITHUB_CLIENT_SECRET trên Netlify.",
    };
  }
  if (!code) {
    return { statusCode: 400, body: "Thiếu mã 'code' từ GitHub." };
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "text/html" },
        body: renderResponsePage("error", { message: tokenData.error_description || "Xác thực GitHub thất bại." }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: renderResponsePage("success", {
        token: tokenData.access_token,
        provider: "github",
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/html" },
      body: renderResponsePage("error", { message: err.message }),
    };
  }
};
