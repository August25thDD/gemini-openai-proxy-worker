// proxygemini-worker.js
const TARGET = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

/**
 * Extracts an API key from the Authorization header.
 * Supports multiple comma-separated keys by randomly selecting one.
 * @param {Headers} headers The request headers.
 * @returns {string|null} The selected API key or null if not found.
 */
function extractApiKey(headers) {
  const auth = headers.get("Authorization");
  if (!auth) return null;
  const token = auth.split(" ")[1];
  if (!token) return null;

  if (token.includes(",")) {
    const apiKeys = token.split(",").map(k => k.trim()).filter(Boolean);
    if (apiKeys.length === 0) return null;
    const chosen = apiKeys[Math.floor(Math.random() * apiKeys.length)];
    return chosen;
  }
  return token.trim();
}

/**
 * Builds the headers for the outbound request to the target API.
 * This function copies safe headers from the incoming request and injects
 * the chosen API key into a new Authorization header.
 * @param {Headers} incomingHeaders The original request headers.
 * @param {string} apiKey The API key for the outbound request.
 * @returns {Headers} The sanitized and prepared headers.
 */
function buildOutboundHeaders(incomingHeaders, apiKey) {
  const out = new Headers();
  for (const [k, v] of incomingHeaders) {
    const low = k.toLowerCase();
    if (["host", "content-length", "authorization"].includes(low)) continue;
    out.set(k, v);
  }
  if (apiKey) {
    out.set("Authorization", `Bearer ${apiKey}`);
  }
  return out;
}

/**
 * Returns CORS headers to enable cross-origin requests.
 */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS,PUT,DELETE",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Expose-Headers": "Content-Length,Content-Type"
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only proxy requests to the designated path.
    if (!url.pathname.startsWith("/proxygemini")) {
      return new Response("Not Found", { status: 404 });
    }

    // Handle CORS preflight requests.
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Extract API key from the Authorization header.
    const apiKey = extractApiKey(request.headers);
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing or invalid Authorization header" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    // Build the outbound request.
    const outboundHeaders = buildOutboundHeaders(request.headers, apiKey);
    const init = {
      method: request.method,
      headers: outboundHeaders,
      body: (request.method === "GET" || request.method === "HEAD") ? undefined : request.body,
      redirect: "follow"
    };

    let upstreamResp;
    try {
      upstreamResp = await fetch(TARGET, init);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Upstream fetch error", detail: String(err) }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders() }
      });
    }

    // Forward the response and add CORS headers.
    const respHeaders = new Headers(upstreamResp.headers);
    Object.entries(corsHeaders()).forEach(([k, v]) => respHeaders.set(k, v));

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: respHeaders
    });
  }
};
