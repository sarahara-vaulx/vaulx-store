module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const {
      orderId, amount, quantity = 1,
      resellerCode, productName,
      billName, billEmail, billPhone,
      shipTo, country = 'US'
    } = req.body;

    const secret  = process.env.STRIPE_SECRET_KEY;
    const siteUrl = (process.env.SITE_URL || 'https://www.shopvaulxusa.com').replace(/\/$/, '');

    if (!secret) return res.status(500).json({ error: 'Stripe not configured.' });

    const codeList = String(process.env.RESELLER_CODES || '')
      .split(',').map(s => s.trim()).filter(Boolean);
    const entered = String(resellerCode || '').trim().toUpperCase();
    const match = codeList.find(e => e.split(':')[0].trim().toUpperCase() === entered);

    if (!entered || !match) {
      console.warn('Rejected - invalid reseller code: ' + entered);
      return res.status(403).json({ error: 'Invalid reseller code.' });
    }
    const resellerName = (match.split(':')[1] || entered).trim();

    const unitAmount = Math.round(parseFloat(amount) * 100);

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', siteUrl + '/return.html?order=' + encodeURIComponent(orderId));
    params.append('cancel_url',  siteUrl + '/cancel.html');
    params.append('customer_email', billEmail || '');
    params.append('line_items[0][quantity]', String(quantity));
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][unit_amount]', String(unitAmount));
    params.append('line_items[0][price_data][product_data][name]', productName || 'VAULX Order');
    params.append('metadata[order_id]', orderId || '');
    params.append('metadata[reseller_code]', entered);
    params.append('metadata[reseller_name]', resellerName);
    params.append('metadata[customer_name]', billName || '');
    params.append('metadata[phone]', billPhone || '');
    params.append('metadata[ship_to]', (shipTo || '').slice(0, 490));
    params.append('payment_intent_data[description]', '[' + entered + '] ' + (productName || 'VAULX Order'));

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + secret,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error('Stripe error:', data);
      return res.status(500).json({ error: (data.error && data.error.message) || 'Stripe request failed.' });
    }

    console.log('Session created | ' + resellerName + ' (' + entered + ') | ' + orderId);
    return res.status(200).json({ url: data.url });

  } catch (err) {
    console.error('Checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
};
