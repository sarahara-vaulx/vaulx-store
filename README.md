# VAULX × Fiuu — Deployment Guide

## Mga kailangan mo bago mag-deploy

1. **Fiuu Merchant Account** — https://merchant.fiuu.com
   - Kunin ang iyong **Merchant ID** at **Verify Key** sa Merchant Portal
   - (Settings → Profile → API Keys)

2. **GitHub account** — https://github.com (libre)

3. **Vercel account** — https://vercel.com (libre, mag-sign up via GitHub)

4. **Amazon Associates tag** — para sa affiliate links

---

## STEP 1 — I-upload ang code sa GitHub

```bash
# Sa terminal / command prompt, pumunta sa vaulx-fiuu folder
cd vaulx-fiuu

# I-initialize ang git at i-push sa GitHub
git init
git add .
git commit -m "VAULX initial deploy"

# Gumawa ng bagong repo sa GitHub.com, tapos:
git remote add origin https://github.com/YOUR-USERNAME/vaulx-store.git
git push -u origin main
```

O kaya, i-drag and drop ang folder sa https://github.com/new (mag-upload files option).

---

## STEP 2 — I-deploy sa Vercel

1. Pumunta sa https://vercel.com → **Add New Project**
2. **Import** ang iyong GitHub repo (vaulx-store)
3. Settings:
   - Framework Preset: **Other**
   - Root Directory: **./** (default)
   - Output Directory: **public**
4. I-click ang **Deploy** — hintayin matapos

---

## STEP 3 — I-add ang Environment Variables sa Vercel

Sa Vercel dashboard → iyong project → **Settings → Environment Variables**

Idagdag ang tatlong ito:

| Name                | Value                                    |
|---------------------|------------------------------------------|
| `FIUU_MERCHANT_ID`  | Merchant ID mo mula sa Fiuu portal       |
| `FIUU_VERIFY_KEY`   | Verify Key mo mula sa Fiuu portal        |
| `SITE_URL`          | URL ng iyong deployed site (e.g. `https://vaulx-store.vercel.app`) |
| `FIUU_SANDBOX`      | `true` (para sa testing) / `false` (live)|

Pagkatapos mag-save ng env vars → **Redeploy** ang site.

---

## STEP 4 — I-register ang domain mo sa Fiuu

Fiuu requires na i-whitelist ang iyong site URL para sa Hosted integration.

1. Login sa Fiuu Merchant Portal
2. Pumunta sa **Merchant Profile → Profile Settings**
3. I-add ang iyong Vercel URL (e.g. `vaulx-store.vercel.app`)
4. I-save at hintayin ang approval (usually mabilis)

---

## STEP 5 — I-set ang Return / Callback URLs sa Fiuu

Sa Fiuu Merchant Portal → **Payment Settings**:

| Setting         | Value                                              |
|-----------------|----------------------------------------------------|
| Return URL      | `https://your-site.vercel.app/return.html`         |
| Callback URL    | `https://your-site.vercel.app/api/fiuu-callback`   |
| Cancel URL      | `https://your-site.vercel.app/cancel.html`         |

---

## STEP 6 — I-update ang iyong Amazon Affiliate Links

Buksan ang `public/products.js` at palitan ang bawat `affiliateUrl`:

```js
affiliateUrl: 'https://www.amazon.com/dp/ASIN/?tag=YOUR-TAG-20'
```

Palitan `YOUR-TAG-20` ng iyong totoong Associates tag at `ASIN` ng tamang product code.

---

## STEP 7 — Testing

Gamitin ang Fiuu Sandbox (FIUU_SANDBOX=true) para mag-test:

- Pumunta sa Fiuu sandbox merchant portal para sa test credentials
- Sandbox URL: `https://pg-sandbox.e2pay.co.id`
- Huwag gumamit ng totoong card sa sandbox

---

## STEP 8 — Go Live checklist

- [ ] I-set `FIUU_SANDBOX=false` sa Vercel env vars
- [ ] I-verify na naka-approve na ang domain sa Fiuu portal
- [ ] I-test ng isang buhay na transaksyon (maliit na halaga)
- [ ] Palitan ang Amazon affiliate links ng totoong links
- [ ] Idagdag ang custom domain sa Vercel (optional pero nice)

---

## Project structure

```
vaulx-fiuu/
├── public/
│   ├── index.html      ← Main storefront
│   ├── style.css       ← Lahat ng CSS
│   ├── products.js     ← I-edit ito para sa iyong products
│   ├── cart.js         ← Cart logic
│   ├── checkout.js     ← Fiuu checkout flow
│   ├── return.html     ← Payment success page
│   └── cancel.html     ← Payment cancelled page
├── api/
│   ├── fiuu-checkout.js  ← Generates vcode, returns Fiuu URL
│   └── fiuu-callback.js  ← Receives Fiuu payment webhook
├── vercel.json
├── package.json
└── .gitignore
```

---

## May tanong?

- Fiuu docs: https://e2payprod.gitbook.io/payment-gateway
- Fiuu support: support@fiuu.com
- Vercel docs: https://vercel.com/docs
- Amazon Associates: https://affiliate-program.amazon.com
