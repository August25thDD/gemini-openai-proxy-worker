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

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Configure `wrangler.toml`:
```toml
account_id = "your-cloudflare-account-id"
name = "gemini-openai-proxy"
main = "proxygemini-worker.js"
compatibility_date = "2025-09-28"
```

3. Deploy:
```bash
wrangler publish
```

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