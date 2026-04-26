const PRODUCTS = [
  { id:1, name:'Dyson Airwrap i.d. Multi-Styler', category:'Beauty', image:'https://m.media-amazon.com/images/I/61k259EyWRL._SL1500_.jpg', desc:'Bluetooth connected, no heat damage, 6-in-1 versatility. Allure winner.', price:649, badge:'hot', affiliateUrl:'https://www.amazon.com/dp/B0DQVKSHGN/?tag=vaulxstore-20' },
  { id:2, name:'La Mer Moisturizing Cream 3.4oz', category:'Beauty', image:'https://m.media-amazon.com/images/I/61d+JrpWbfL._SL1500_.jpg', desc:'Iconic Crème de la Mer. Heals dryness, infuses skin with all-day moisture.', price:350, badge:'new', affiliateUrl:'https://www.amazon.com/dp/B00BH4KLJI/?tag=vaulxstore-20' },
  { id:3, name:'SK-II Facial Treatment Essence', category:'Beauty', image:'https://m.media-amazon.com/images/I/41--mR6SdYL._SL1500_.jpg', desc:'Anti-aging essence. Reduces fine lines, refines texture, improves firmness.', price:185, badge:'hot', affiliateUrl:'https://www.amazon.com/dp/B00ACRWTSI/?tag=vaulxstore-20' },
  { id:4, name:'Dyson Airwrap Origin Multi-Styler', category:'Beauty', image:'https://m.media-amazon.com/images/I/51yPrzJk1sL._SX522_.jpg', desc:'3 styling attachments, Coanda airflow, dry curl and shape with no heat damage.', price:399, orig:550, badge:'sale', affiliateUrl:'https://www.amazon.com/dp/B0DMXJXWH3/?tag=vaulxstore-20' },
  { id:5, name:'La Mer Moisturizing Soft Cream', category:'Beauty', image:'https://m.media-amazon.com/images/I/519zRuBUOiL._AC_SL1500_.jpg', desc:'Lightweight version of the iconic La Mer cream. Perfect for normal to oily skin.', price:215, badge:'new', affiliateUrl:'https://www.amazon.com/dp/B00OPXDJCE/?tag=vaulxstore-20' },
  { id:6, name:'Laneige Lip Sleeping Mask', category:'Beauty', image:'https://m.media-amazon.com/images/I/31Lm2sHFazL._SX342_SY445_QL70_FMwebp_.jpg', desc:'Overnight hydration, berry scent, vitamin C brightening. Best seller!', price:24, badge:'hot', affiliateUrl:'https://www.amazon.com/dp/B01MFABOWM/?tag=vaulxstore-20' },
  { id:7, name:'Dyson V15 Detect Vacuum', category:'Home', image:'https://m.media-amazon.com/images/I/51uSS9tb-uL._AC_SL1500_.jpg', desc:'Laser dust detection, up to 60 min runtime, HEPA filtration.', price:649, orig:749, badge:'sale', affiliateUrl:'https://www.amazon.com/dp/B09JNMWN4T/?tag=vaulxstore-20' },
  { id:8, name:'AirPods Pro 3rd Gen', category:'Tech', image:'https://m.media-amazon.com/images/I/61solmQSSlL._AC_SX342_SY445_QL70_FMwebp_.jpg', desc:'Active noise cancellation, spatial audio, adaptive transparency.', price:249, badge:'new', affiliateUrl:'https://www.amazon.com/dp/B0CHWRXH8B/?tag=vaulxstore-20' },
];

const zoomResult = document.createElement('div');
zoomResult.className = 'zoom-result';
zoomResult.innerHTML = '<div class="zoom-result-img" id="zoomResultImg"></div>';
document.body.appendChild(zoomResult);

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
lightbox.id = 'lightbox';
lightbox.innerHTML = `
  <span class="lightbox-close" id="lightboxClose">✕</span>
  <img id="lightboxImg" />
  <div class="lightbox-name" id="lightboxName"></div>
  <div class="lightbox-tip">Click image to zoom · Click outside to close</div>
`;
document.body.appendChild(lightbox);

document.getElementById('lightboxClose').onclick = () => lightbox.classList.remove('open');
lightbox.addEventListener('click', e => { if(e.target === lightbox) lightbox.classList.remove('open'); });
document.getElementById('lightboxImg').addEventListener('click', function(e) {
  e.stopPropagation();
  this.classList.toggle('zoomed');
});

function attachZoom(imgEl, p) {
  const lens = imgEl.parentElement.querySelector('.zoom-lens');
  const zoomResultImg = document.getElementById('zoomResultImg');

  imgEl.parentElement.addEventListener('mouseenter', () => {
    lens.style.display = 'block';
    zoomResult.style.display = 'block';
    zoomResultImg.style.backgroundImage = `url('${p.image}')`;
  });

  imgEl.parentElement.addEventListener('mouseleave', () => {
    lens.style.display = 'none';
    zoomResult.style.display = 'none';
  });

  imgEl.parentElement.addEventListener('mousemove', e => {
    const rect = imgEl.getBoundingClientRect();
    let lx = e.clientX - rect.left - 40;
    let ly = e.clientY - rect.top - 40;
    lx = Math.max(0, Math.min(lx, rect.width - 80));
    ly = Math.max(0, Math.min(ly, rect.height - 80));
    lens.style.left = lx + 'px';
    lens.style.top = ly + 'px';

    const xPct = (lx / rect.width) * 100;
    const yPct = (ly / rect.height) * 100;
    zoomResultImg.style.backgroundPosition = `${xPct}% ${yPct}%`;

    let rx = e.clientX + 20;
    let ry = e.clientY - 180;
    if (rx + 370 > window.innerWidth) rx = e.clientX - 380;
    if (ry < 10) ry = 10;
    if (ry + 370 > window.innerHeight) ry = window.innerHeight - 375;
    zoomResult.style.left = rx + 'px';
    zoomResult.style.top = ry + 'px';
  });

  imgEl.parentElement.addEventListener('click', () => {
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lightboxImg');
    const lbName = document.getElementById('lightboxName');
    lbImg.src = p.image;
    lbImg.classList.remove('zoomed');
    lbName.textContent = p.name;
    lb.classList.add('open');
    zoomResult.style.display = 'none';
  });
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  const list = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  grid.innerHTML = list.map(p => `
    <div class="product-card" data-id="${p.id}">
      ${p.badge ? `<div class="badge badge-${p.badge}">${p.badge==='new'?'New':p.badge==='sale'?'Sale':'Hot'}</div>` : ''}
      <div class="product-img" title="Hover to zoom · Click to enlarge">
        <div class="zoom-lens"></div>
        <img src="${p.image}" alt="${p.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name serif">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price">
            ${p.orig ? `<span class="orig">$${p.orig}</span>` : ''}$${p.price}
          </div>
          <a href="${p.affiliateUrl}" target="_blank" class="amazon-btn" onclick="event.stopPropagation()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Buy on Amazon
          </a>
        </div>
      </div>
    </div>`).join('');

  list.forEach(p => {
    const card = grid.querySelector(`[data-id="${p.id}"]`);
    const imgEl = card.querySelector('img');
    attachZoom(imgEl, p);
  });
}

function filterProducts(cat, el) {
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  renderProducts(cat);
}
