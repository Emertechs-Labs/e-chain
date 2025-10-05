# Manifest (CLI)

Generate account association credentials with the CLI

Generate your Farcaster account association credentials.

```bash
npx create-onchain --manifest
```

Follow the prompts to connect your Farcaster custody wallet, add your deployed URL, and sign. The CLI writes `FARCASTER_HEADER`, `FARCASTER_PAYLOAD`, and `FARCASTER_SIGNATURE` to your `.env`.

While testing, set `noindex: true` in your manifest to avoid indexing.

**Reference:** [Manifest (CLI)](https://docs.base.org/cookbook/minikit/manifest-cli)