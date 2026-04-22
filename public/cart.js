let cart = {};

function addToCart(id, e) {
  e.stopPropagation();
  const p = PRODUCTS.find(x => x.id === id);
  if (!cart[id]) cart[id] = { ...p, qty: 0 };
  cart[id].qty++;
  updateCartCount();
  const btn = e.target;
  btn.style.background = 'var(--success)';
  btn.textContent = '✓';
  setTimeout(() => { btn.style.background = 'var(--gold)'; btn.textContent = '+'; }, 900);
}

function updateCartCount() {
  document.getElementById('cartCount').textContent =
    Object.values(cart).reduce((s, i) => s + i.qty, 0);
}

function openCart() {
  document.getElementById('overlay').classList.add('show');
  document.getElementById('cartSidebar').classList.add('show');
  renderCart();
}

function closeCart() {
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('cartSidebar').classList.remove('show');
}

function renderCart() {
  const items = Object.values(cart).filter(i => i.qty > 0);
  const el = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');

  if (!items.length) {
    el.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Your cart is empty</p></div>`;
    footer.style.display = 'none';
    return;
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  el.innerHTML = items.map(i => `
    <div class="cart-item">
      <div class="cart-item-img">${i.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${i.name}</div>
        <div class="cart-item-price">$${(i.price * i.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i.id},-1)">−</button>
          <span class="qty-num">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i.id},1)">+</button>
          <button class="cart-remove" onclick="removeItem(${i.id})">✕</button>
        </div>
      </div>
    </div>`).join('');

  document.getElementById('cartSubtotal').textContent = '$' + subtotal.toFixed(2);
  footer.style.display = 'block';
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty = Math.max(0, cart[id].qty + delta);
  if (cart[id].qty === 0) delete cart[id];
  updateCartCount();
  renderCart();
}

function removeItem(id) { delete cart[id]; updateCartCount(); renderCart(); }
function getCartItems() { return Object.values(cart).filter(i => i.qty > 0); }
function getCartTotal() { return getCartItems().reduce((s, i) => s + i.price * i.qty, 0); }
