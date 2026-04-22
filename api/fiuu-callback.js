/**
 * VAULX — /api/fiuu-callback
 *
 * Receives Fiuu's IPN (Instant Payment Notification) webhook
 * after a transaction. Verifies the skey signature and logs
 * the order status.
 *
 * Fiuu skey formula:
 *   MD5( tranID + orderId + status + domain + amount + currency + verifyKey )
 *
 * Status codes:
 *   00 = Success
 *   11 = Failed
 *   22 = Pending
 *
 * Required env var: FIUU_VERIFY_KEY
 *
 * To fulfill orders automatically, add your own logic in the
 * "ORDER FULFILLED" section below (e.g. send email, update DB).
 */

const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const {
      tranID,
      orderid,
      status,
      domain,
      amount,
      currency,
      skey,
      paydate,
      channel,
      error_code,
      error_desc,
    } = req.body;

    const verifyKey = process.env.FIUU_VERIFY_KEY;
    if (!verifyKey) {
      console.error('Missing FIUU_VERIFY_KEY');
      return res.status(500).send('FAILED');
    }

    /* ── Verify skey signature ── */
    const skeyInput = tranID + orderid + status + domain + amount + currency + verifyKey;
    const expectedSkey = crypto.createHash('md5').update(skeyInput).digest('hex');

    if (skey !== expectedSkey) {
      console.warn('skey mismatch — possible tampered request', { orderid, skey, expectedSkey });
      return res.status(400).send('FAILED');
    }

    /* ── Handle payment status ── */
    if (status === '00') {
      console.log(`✅ Payment SUCCESS | Order: ${orderid} | TxnID: ${tranID} | Amount: ${amount} ${currency} | Channel: ${channel} | Date: ${paydate}`);

      /* ────────────────────────────────────────────────
       * ORDER FULFILLED — add your logic here:
       *
       * Examples:
       *   - Send confirmation email (use Resend, SendGrid, etc.)
       *   - Save to database (Supabase, PlanetScale, etc.)
       *   - Trigger Amazon affiliate redirect
       *   - Notify yourself via Telegram / Slack bot
       *
       * Example with Resend (install: npm i resend):
       *
       * const { Resend } = require('resend');
       * const resend = new Resend(process.env.RESEND_API_KEY);
       * await resend.emails.send({
       *   from: 'orders@yourdomain.com',
       *   to: customerEmail,   // you'd need to look this up by orderid
       *   subject: `Order ${orderid} confirmed!`,
       *   text: `Your order has been confirmed. Transaction ID: ${tranID}`,
       * });
       * ──────────────────────────────────────────────── */

    } else if (status === '11') {
      console.warn(`❌ Payment FAILED | Order: ${orderid} | Error: ${error_code} ${error_desc}`);
    } else if (status === '22') {
      console.log(`⏳ Payment PENDING | Order: ${orderid}`);
    } else {
      console.log(`ℹ Payment status ${status} | Order: ${orderid}`);
    }

    /* Fiuu expects "RECEIVEOK" as acknowledgment */
    return res.status(200).send('RECEIVEOK');

  } catch (err) {
    console.error('Callback error:', err);
    return res.status(500).send('FAILED');
  }
};
