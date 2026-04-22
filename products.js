/**
 * VAULX Products Catalog
 * ─────────────────────────────────────────────────
 * Replace `affiliateUrl` with your Amazon affiliate links.
 * Format: https://www.amazon.com/dp/ASIN/?tag=YOUR-TAG-20
 * ─────────────────────────────────────────────────
 */
const PRODUCTS = [
  { id:1, name:'AirPods Pro 3rd Gen',      category:'Tech',    icon:'🎧', desc:'Active noise cancellation, spatial audio, adaptive transparency.', price:249,           badge:'new',  affiliateUrl:'https://www.amazon.com/dp/B0CHWRXH8B/?tag=YOUR-TAG-20' },
  { id:2, name:'Dyson V15 Detect',         category:'Home',    icon:'🌀', desc:'Laser dust detection, up to 60 min runtime, HEPA filtration.',     price:649, orig:699, badge:'sale', affiliateUrl:'https://www.amazon.com/dp/B09JNMWN4T/?tag=YOUR-TAG-20' },
  { id:3, name:'Kindle Scribe',            category:'Tech',    icon:'📖', desc:'10.2" 300 ppi display, handwriting to text, 3-month battery.',     price:339,           badge:'hot',  affiliateUrl:'https://www.amazon.com/dp/B09BS26B8B/?tag=YOUR-TAG-20' },
  { id:4, name:'Le Creuset Dutch Oven',    category:'Kitchen', icon:'🍲', desc:'5.5 qt cast iron, lifetime warranty, 30+ color options.',          price:399, orig:480, badge:'sale', affiliateUrl:'https://www.amazon.com/dp/B00006ISKF/?tag=YOUR-TAG-20' },
  { id:5, name:'Nike Air Max 270',         category:'Fashion', icon:'👟', desc:'Max Air heel unit, breathable mesh, all-day comfort.',             price:150,           badge:'',     affiliateUrl:'https://www.amazon.com/dp/B07DPBKPCD/?tag=YOUR-TAG-20' },
  { id:6, name:'Laneige Lip Sleeping Mask',category:'Beauty',  icon:'💄', desc:'Overnight hydration, berry scent, vitamin C brightening.',         price:24,            badge:'hot',  affiliateUrl:'https://www.amazon.com/dp/B01MFABOWM/?tag=YOUR-TAG-20' },
  { id:7, name:'Theragun Elite',           category:'Health',  icon:'⚡', desc:'Percussive therapy, 5 speeds, QuietForce technology.',             price:299, orig:375, badge:'sale', affiliateUrl:'https://www.amazon.com/dp/B08BF4PTHV/?tag=YOUR-TAG-20' },
  { id:8, name:'Philips Hue Starter Kit',  category:'Home',    icon:'💡', desc:'4 color bulbs + bridge, 16M colors, voice assistant ready.',       price:199,           badge:'new',  affiliateUrl:'https://www.amazon.com/dp/B014H2P8ME/?tag=YOUR-TAG-20' },
];

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = list.map(p => `
    <div class="product-card">
      ${p.badge ? `<div class="badge badge-${p.badge}">${p.badge==='new'?'New':p.badge==='sale'?'Sale':'Hot'}</div>` : ''}
      <div class="product-img"><div class="product-img-inner">${p.icon}</div></div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name serif">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.orig ? `<span class="orig">$${p.orig}</span>` : ''}$${p.price}
          </div>
          <button class="add-btn" onclick="addToCart(${p.id},event)">+</button>
        </div>
      </div>
    </div>`).join('');
}

function filterProducts(cat, el) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderProducts(cat);
}
