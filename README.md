# Gemini OpenAI Proxy Worker

A Cloudflare Worker that enables access to Google's Gemini API via OpenAI-compatible endpoints through regional bypass using Cloudflare's global network.

## Purpose

This proxy solves regional access issues (like those in China) by routing requests through Cloudflare Workers, allowing clients to access Gemini API where direct connectivity is restricted.

## Features

- Proxies requests from `/proxygemini` to Google's Gemini API
- Extracts API keys from `Authorization` header (supports comma-separated multiple keys with random selection)
- Full CORS support for browser-based applications
- Preserves original request method and body
- No API keys stored in Worker configuration
- MIT licensed, ready for open-source contribution

## Deployment

You can deploy this Worker using either the Wrangler CLI or the Cloudflare Dashboard.

### Option 1: Using Wrangler CLI (Recommended)

1.  **Install Wrangler CLI:**
    ```bash
    npm install -g wrangler
    ```

2.  **Configure `wrangler.toml`:**
    Update `wrangler.toml` with your Cloudflare `account_id`.
    ```toml
    account_id = "your-cloudflare-account-id"
    name = "gemini-openai-proxy"
    main = "proxygemini-worker.js"
    compatibility_date = "2025-09-28"
    ```

3.  **Deploy:**
    This command publishes the script to your Cloudflare account.
    ```bash
    wrangler publish
    ```

4.  **Add a Route:**
    After deploying, go to your Cloudflare Dashboard, navigate to **Workers & Pages**, select your worker (`gemini-openai-proxy`), and go to the **Triggers** tab. Add a route that points to your Worker, for example: `https://your-domain.com/proxygemini*`.

### Option 2: Using Cloudflare Dashboard

1.  **Create a Worker:**
    - Log in to your Cloudflare Dashboard.
    - Go to **Workers & Pages**.
    - Click **Create Application** > **Create Worker**.
    - Name your Worker (e.g., `gemini-openai-proxy`) and click **Deploy**.

2.  **Edit the Worker Code:**
    - After deployment, click **Edit code**.
    - Copy the contents of `proxygemini-worker.js` and paste it into the editor, replacing the default code.
    - Click **Save and deploy**.

3.  **Add a Route:**
    - Go back to the Worker's overview page and select the **Triggers** tab.
    - Under the **Routes** section, click **Add route**.
    - Enter the route, e.g., `your-domain.com/proxygemini*`.
    - Select the correct zone (your domain) for this route.
    - Click **Add route**.

## Usage

```bash
curl -X POST https://your-worker.example.com/proxygemini \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gemini-pro", "messages": [{"role": "user", "content": "Hello"}]}'
```

### Multiple API Keys

Provide multiple keys for redundancy:
```
Authorization: Bearer key1,key2,key3
```

## Security

- API keys are never stored - passed through request headers only
- Keys are randomly selected from comma-separated values
- Maintains same security posture as direct Gemini API calls

## Contributing

Contributions welcome. Please open issues or PRs with improvements.

## License

MIT © August25thDD