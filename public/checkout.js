/**
 * VAULX Checkout — Fiuu Hosted Page Integration
 *
 * Flow:
 *  1. Customer fills in name/email on our site
 *  2. We POST to /api/fiuu-checkout (serverless function)
 *  3. Server computes vcode hash + returns Fiuu payment URL
 *  4. We redirect the browser to Fiuu's hosted payment page
 *  5. Fiuu handles card / GCash / Maya / GrabPay / etc.
 *  6. Fiuu redirects back to /return.html (success) or /cancel.html
 *  7. Fiuu also POSTs callback to /api/fiuu-callback (webhook)
 */

const SHIPPING = 8.99;
const TAX_RATE = 0.08;

function openCheckout() {
  closeCart();
  document.getElementById('checkoutModal').classList.add('show');
  renderCheckoutStep1();
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('show');
}

/* ── Step 1: Customer Details ── */
function renderCheckoutStep1() {
  const items = getCartItems();
  const subtotal = getCartTotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + SHIPPING + tax;

  document.getElementById('checkoutBody').innerHTML = `
    <div class="form-section">
      <label class="form-label">Your Details</label>
      <input class="form-input" id="f-name"  placeholder="Full name" autocomplete="name">
      <input class="form-input" id="f-email" placeholder="Email address" type="email" autocomplete="email">
      <input class="form-input" id="f-phone" placeholder="Phone number" type="tel" autocomplete="tel" style="margin-bottom:0">
    </div>

    <div class="order-summary">
      ${items.map(i => `
        <div class="summary-row">
          <span>${i.name} ×${i.qty}</span>
          <span>$${(i.price * i.qty).toFixed(2)}</span>
        </div>`).join('')}
      <div class="summary-row">
        <span style="color:var(--muted)">Shipping</span>
        <span style="color:var(--muted)">$${SHIPPING.toFixed(2)}</span>
      </div>
      <div class="summary-row">
        <span style="color:var(--muted)">Tax (8%)</span>
        <span style="color:var(--muted)">$${tax.toFixed(2)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span>$${total.toFixed(2)}</span>
      </div>
    </div>

    <div style="margin-bottom:0.5rem">
      <p style="font-size:12px;color:var(--muted);margin-bottom:8px">Accepted payment methods:</p>
      <div class="pay-methods">
        <span class="pay-badge">Visa</span>
        <span class="pay-badge">Mastercard</span>
        <span class="pay-badge">Amex</span>
        <span class="pay-badge">GCash</span>
        <span class="pay-badge">Maya</span>
        <span class="pay-badge">GrabPay</span>
        <span class="pay-badge">ShopeePay</span>
        <span class="pay-badge">Bank Transfer</span>
      </div>
    </div>`;

  document.getElementById('checkoutFooter').innerHTML = `
    <button class="btn-back" onclick="closeCheckout()">Cancel</button>
    <button class="btn-next" id="payBtn" onclick="submitToFiuu()">
      Pay $${total.toFixed(2)} via Fiuu →
    </button>`;
}

/* ── Submit to Fiuu ── */
async function submitToFiuu() {
  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const phone = document.getElementById('f-phone').value.trim();

  if (!name || !email) {
    alert('Please enter your name and email to continue.');
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  const btn = document.getElementById('payBtn');
  btn.disabled = true;
  btn.textContent = 'Preparing payment…';

  const items    = getCartItems();
  const subtotal = getCartTotal();
  const tax      = subtotal * TAX_RATE;
  const total    = +(subtotal + SHIPPING + tax).toFixed(2);
  const orderId  = 'VLX-' + Date.now();

  /* Show redirect spinner */
  document.getElementById('checkoutBody').innerHTML = `
    <div class="redirect-screen">
      <div class="redirect-spinner"></div>
      <div class="redirect-title serif">Redirecting to Fiuu…</div>
      <p style="color:var(--muted);font-size:13px;margin-top:0.5rem">
        Please do not close this window.
      </p>
    </div>`;
  document.getElementById('checkoutFooter').innerHTML = '';

  try {
    /* Call our serverless function to generate vcode and return Fiuu URL */
    const res = await fetch('/api/fiuu-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        amount: total,
        billName:  name,
        billEmail: email,
        billPhone: phone || '',
        billDesc:  items.map(i => `${i.name} x${i.qty}`).join(', ').slice(0, 200),
        currency:  'USD',
      }),
    });

    if (!res.ok) throw new Error('Server error. Please try again.');
    const { paymentUrl, formData } = await res.json();

    if (paymentUrl && formData) {
      /* Build and auto-submit the Fiuu form */
      const form = document.getElementById('fiuuForm');
      form.action = paymentUrl;
      form.method = 'POST';
      form.innerHTML = Object.entries(formData)
        .map(([k, v]) => `<input type="hidden" name="${k}" value="${v}">`)
        .join('');
      form.submit();
    } else {
      throw new Error('Invalid response from server.');
    }
  } catch (err) {
    document.getElementById('checkoutBody').innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--danger);margin-bottom:1rem">⚠ ${err.message}</p>
        <button class="btn-outline" onclick="renderCheckoutStep1()">Try Again</button>
      </div>`;
    document.getElementById('checkoutFooter').innerHTML = '';
  }
}
