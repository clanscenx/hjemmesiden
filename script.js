/* ====== NAV: scroll + mobile toggle + active link ====== */
const navOuter = document.querySelector('.nav-outer');
let scrolled = false;
window.addEventListener('scroll', () => {
  const s = window.scrollY > 30;
  if (s !== scrolled) { scrolled = s; navOuter.classList.toggle('scrolled', s); }
}, { passive: true });

const toggle = document.querySelector('.nav-toggle');
const links  = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links a');

if (toggle) toggle.addEventListener('click', () => links.classList.toggle('open'));
navLinks.forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

const path = location.pathname.split('/').pop() || 'index.html';
navLinks.forEach(a => {
  if (a.getAttribute('href') === path) a.classList.add('active');
});

/* ====== REVEAL ON SCROLL ====== */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ====== GALLERY FILTER ====== */
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const f = btn.dataset.filter;
    galleryItems.forEach(card => {
      const show = f === 'alle' || card.dataset.category === f;
      card.style.display = show ? '' : 'none';
      if (show) {
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), 30);
      }
    });
  });
});

/* ====== FAQ ACCORDION ====== */
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  if (!q) return;
  q.addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

/* ====== BOOKING — live summary form ====== */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const sumType     = document.getElementById('sumType');
  const sumGuests   = document.getElementById('sumGuests');
  const sumDate     = document.getElementById('sumDate');
  const sumLocation = document.getElementById('sumLocation');

  const dateInput = document.getElementById('bDato');
  const locInput  = document.getElementById('bBy');

  function fmtDate(val) {
    if (!val) return '–';
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // chip groups (event type, guests)
  document.querySelectorAll('.chip-row[data-field]').forEach(group => {
    const field = group.dataset.field;
    group.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const value = chip.dataset.value;
        if (field === 'type' && sumType) sumType.textContent = value;
        if (field === 'guests' && sumGuests) sumGuests.textContent = value;
      });
    });
  });

  if (dateInput && sumDate) {
    dateInput.addEventListener('input', () => { sumDate.textContent = fmtDate(dateInput.value); });
  }
  if (locInput && sumLocation) {
    locInput.addEventListener('input', () => { sumLocation.textContent = locInput.value.trim() || '–'; });
  }

  // submit
  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    const status = bookingForm.querySelector('.form-status');
    const name  = document.getElementById('bNavn');
    const email = document.getElementById('bEmail');

    if (!name.value.trim() || !email.value.trim()) {
      if (status) { status.textContent = 'Udfyld venligst navn og email.'; status.style.color = 'var(--error)'; }
      name.style.borderColor = !name.value.trim() ? '#ff6b6b' : '';
      email.style.borderColor = !email.value.trim() ? '#ff6b6b' : '';
      return;
    }

    const activeType   = document.querySelector('.chip-row[data-field="type"] .chip.active');
    const activeGuests = document.querySelector('.chip-row[data-field="guests"] .chip.active');

    const fd = new FormData();
    fd.append('name', name.value.trim());
    fd.append('email', email.value.trim());
    fd.append('phone', document.getElementById('bTelefon')?.value.trim() || '');
    fd.append('date', dateInput?.value || '');
    fd.append('location', locInput?.value.trim() || '');
    fd.append('type', activeType ? activeType.dataset.value : '');
    fd.append('guests', activeGuests ? activeGuests.dataset.value : '');
    fd.append('message', document.getElementById('bMsg')?.value.trim() || '');

    const btn = document.getElementById('bookSubmit');
    btn.disabled = true;
    btn.textContent = 'Sender...';

    try {
      const res = await fetch('https://formspree.io/f/xgoqydez', {
        method: 'POST', body: fd, headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        bookingForm.style.display = 'none';
        document.getElementById('bookSuccess')?.classList.add('show');
      } else {
        if (status) { status.textContent = 'Noget gik galt. Prøv igen eller ring direkte.'; status.style.color = '#ff6b6b'; }
        btn.disabled = false;
        btn.textContent = 'Send forespørgsel →';
      }
    } catch {
      if (status) { status.textContent = 'Noget gik galt. Prøv igen eller ring direkte.'; status.style.color = '#ff6b6b'; }
      btn.disabled = false;
      btn.textContent = 'Send forespørgsel →';
    }
  });
}

/* ====== URL PARAM: pre-select event type chip ====== */
const typeParam = new URLSearchParams(location.search).get('type');
if (typeParam) {
  const chips = document.querySelectorAll('.chip-row[data-field="type"] .chip');
  chips.forEach(chip => {
    const v = chip.dataset.value.toLowerCase();
    if (v.includes(typeParam.toLowerCase()) || typeParam.toLowerCase().includes(v)) {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const sumType = document.getElementById('sumType');
      if (sumType) sumType.textContent = chip.dataset.value;
    }
  });
}
