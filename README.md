# WhatsApp Pricing Bot

Automatically classifies incoming WhatsApp messages and sends the matching pricing PDF.

## Flow

```
Client messages WhatsApp
        ↓
Claude classifies (Wedding / Event / Portrait / Corporate / General)
        ↓
Fetch PDF URL from Google Drive
        ↓
Send PDF + warm follow-up message back to client
```

## Setup

### 1. Install dependencies
```
npm install
```

### 2. Configure environment
```
cp .env.example .env
```
Fill in `.env` with your credentials (see sections below).

### 3. Run locally
```
npm start
```

---

## Credentials you need

### WhatsApp Cloud API
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create an app → Business → WhatsApp
3. Copy: **Phone Number ID**, **Access Token**, **WhatsApp Business Account ID**
4. Set a **Verify Token** (any random string) — you'll use this when registering the webhook

### Anthropic API Key
Get from [console.anthropic.com](https://console.anthropic.com)

### Google Drive PDFs
1. Upload your PDFs to Google Drive:
   - `wedding.pdf`, `event.pdf`, `portraits.pdf`, `corporate.pdf`, and a `general.pdf`
2. For each file: right-click → Share → **"Anyone with the link"** → Viewer
3. Copy the file ID from the share URL:
   `https://drive.google.com/file/d/FILE_ID_HERE/view`
4. Paste each ID into `.env`

---

## Deploying (so Meta can reach your webhook)

You need a public HTTPS URL. Easiest options:

**Railway (recommended — free tier)**
1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add all your `.env` variables in the Railway dashboard
4. Railway gives you a public URL like `https://your-app.up.railway.app`

**ngrok (for local testing)**
```
ngrok http 3000
```

---

## Register the webhook with Meta

1. In your Meta app → WhatsApp → Configuration → Webhook
2. Callback URL: `https://your-public-url/webhook`
3. Verify Token: same value as `WHATSAPP_VERIFY_TOKEN` in `.env`
4. Subscribe to: **messages**

---

## Test it

Send a message to your WhatsApp number:
- `"How much is a wedding shoot?"` → receives `wedding.pdf`
- `"I need a photographer for my event"` → receives `event.pdf`
- `"What are your portrait prices?"` → receives `portraits.pdf`
