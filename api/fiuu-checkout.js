/**
 * VAULX — /api/fiuu-checkout
 *
 * Generates the Fiuu Hosted Page vcode (MD5 hash) and returns
 * the payment URL + form fields to the frontend.
 *
 * Required Environment Variables (set in Vercel dashboard):
 *   FIUU_MERCHANT_ID   — your Fiuu Merchant ID
 *   FIUU_VERIFY_KEY    — your Fiuu Verify Key (from merchant portal)
 *   SITE_URL           — your deployed site URL e.g. https://vaulx.vercel.app
 *
 * Fiuu vcode formula:
 *   MD5( amount + merchantId + orderId + verifyKey )
 *
 * Docs: https://e2payprod.gitbook.io/payment-gateway
 */

const crypto = require('crypto');

const FIUU_SANDBOX_URL = 'https://pg-sandbox.e2pay.co.id/RMS/pay';
const FIUU_PROD_URL    = 'https://pg.e2pay.co.id/RMS/pay';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      orderId,
      amount,
      billName,
      billEmail,
      billPhone,
      billDesc,
      currency = 'USD',
    } = req.body;

    /* ── Read env vars ── */
    const merchantId = process.env.FIUU_MERCHANT_ID;
    const verifyKey  = process.env.FIUU_VERIFY_KEY;
    const siteUrl    = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const isSandbox  = process.env.FIUU_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';

    if (!merchantId || !verifyKey) {
      return res.status(500).json({ error: 'Missing FIUU_MERCHANT_ID or FIUU_VERIFY_KEY env vars.' });
    }

    /* ── Format amount to 2 decimal places ── */
    const amountFormatted = parseFloat(amount).toFixed(2);

    /* ── Compute vcode ── */
    // Formula: MD5( amount + merchantId + orderId + verifyKey )
    const vcodeInput = amountFormatted + merchantId + orderId + verifyKey;
    const vcode = crypto.createHash('md5').update(vcodeInput).digest('hex');

    /* ── Build payment page URL ── */
    const baseUrl = isSandbox ? FIUU_SANDBOX_URL : FIUU_PROD_URL;
    const paymentUrl = `${baseUrl}/${merchantId}`;

    /* ── Form fields to POST to Fiuu ── */
    const formData = {
      merchant_id: merchantId,
      amount:      amountFormatted,
      orderid:     orderId,
      bill_name:   billName,
      bill_email:  billEmail,
      bill_mobile: billPhone || '',
      bill_desc:   billDesc  || 'VAULX Order',
      country:     'PH',          // change to your primary country ISO code
      currency:    currency,
      vcode:       vcode,
      returnurl:   `${siteUrl}/return.html`,
      callbackurl: `${siteUrl}/api/fiuu-callback`,
      cancelurl:   `${siteUrl}/cancel.html`,
      langcode:    'en',
    };

    return res.status(200).json({ paymentUrl, formData });

  } catch (err) {
    console.error('Fiuu checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
};
