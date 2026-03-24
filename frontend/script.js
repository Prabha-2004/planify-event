// ===== NAVIGATION =====
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const navEl = document.getElementById('nav-' + name);
  if (navEl) navEl.classList.add('active');
  window.scrollTo(0, 0);
}

function openBooking(type) {
  showPage('booking');
  const radios = document.querySelectorAll('.radio-card');
  radios.forEach(r => {
    if (r.getAttribute('onclick') && r.getAttribute('onclick').includes(type)) {
      selectRadio(r, type);
    }
  });
}

async function confirmBooking() {

  const data = {
    eventType: document.getElementById("sum-type").textContent,
    date: document.getElementById("sum-date").textContent,
    guests: document.getElementById("guests").value,
    venue: document.getElementById("sum-venue").textContent,
    totalAmount: document.getElementById("sum-total").textContent,

    firstName: document.getElementById("fname").value,
    lastName: document.getElementById("lname").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
  };

  const res = await fetch("/api/bookings/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  const ref = 'EVT-2025-' + String(Math.floor(Math.random() * 9000) + 1000);
  document.getElementById('ref-num').textContent = ref;
  alert("Booking Saved in Database ✅");

  document.getElementById('booking-form-area').style.display = 'none';
  document.getElementById('booking-success').style.display = 'block';
  window.scrollTo(0, 200);
}
// ===== BOOKING FORM =====
let currentStep = 1;
let selectedEventType = 'Wedding';

function selectRadio(el, type) {
  document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedEventType = type;
  document.getElementById('sum-type').textContent = type;
}

function nextStep(step) {
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step' + step).classList.add('active');
  // Update step bar
  for (let i = 1; i <= 4; i++) {
    const dot = document.getElementById('sd' + i);
    if (i < step) { dot.classList.add('done'); dot.classList.remove('active'); dot.textContent = '✓'; }
    else if (i === step) { dot.classList.add('active'); dot.classList.remove('done'); dot.textContent = i; }
    else { dot.classList.remove('active', 'done'); dot.textContent = i; }
    if (i < 4) {
      const line = document.getElementById('sl' + i);
      if (line) line.classList.toggle('done', i < step);
    }
  }
  currentStep = step;
  updateSummary();
}

function updateSummary() {
  const venuePrices = { 0: 35000, 1: 25000, 2: 55000, 3: 12000, 4: 28000, 5: 120000 };
  const venueNames = ['The Grand Pavilion', 'Crystal Ballroom', 'Garden of Eden', 'Executive Board Room', 'Skyline Terrace', 'Heritage Palace'];
  const vs = document.getElementById('venue-select');
  const vi = vs ? vs.selectedIndex : 0;
  const venuePrice = venuePrices[vi] || 35000;
  document.getElementById('sum-venue').textContent = venueNames[vi] || 'The Grand Pavilion';
  document.getElementById('sum-venue-cost').textContent = '₹' + venuePrice.toLocaleString('en-IN');

  const guests = parseInt(document.getElementById('guests')?.value) || 0;
  const date = document.getElementById('event-date')?.value;
  const dur = document.getElementById('duration')?.value || '8 hours';
  if (date) document.getElementById('sum-date').textContent = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  if (guests) document.getElementById('sum-guests').textContent = guests + ' guests';
  document.getElementById('sum-duration').textContent = dur;

  let total = venuePrice;
  const addons = [
    { id: 'catering', price: guests * 450, rowId: 'sum-addon-catering', valId: 'sum-catering-val' },
    { id: 'music', price: 15000, rowId: 'sum-addon-music' },
    { id: 'deco', price: 12000, rowId: 'sum-addon-deco' },
    { id: 'photo', price: 20000, rowId: 'sum-addon-photo' },
    { id: 'anchor', price: 8000, rowId: 'sum-addon-anchor' },
  ];
  addons.forEach(a => {
    const cb = document.getElementById('addon-' + a.id);
    const row = document.getElementById(a.rowId);
    if (cb && row) {
      row.style.display = cb.checked ? 'flex' : 'none';
      if (cb.checked) {
        total += a.price;
        if (a.valId) document.getElementById(a.valId).textContent = '₹' + a.price.toLocaleString('en-IN');
      }
    }
  });
  document.getElementById('sum-total').textContent = '₹' + total.toLocaleString('en-IN');
  document.getElementById('sum-advance').textContent = '₹' + Math.round(total * 0.3).toLocaleString('en-IN');
}

function selectPayMethod(el) {
  document.querySelectorAll('.pay-method').forEach(m => m.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('card-fields').style.display = el.textContent.includes('Card') ? 'block' : 'none';
  document.getElementById('upi-fields').style.display = el.textContent.includes('UPI') ? 'block' : 'none';
  document.getElementById('nb-fields').style.display = el.textContent.includes('Net') ? 'block' : 'none';
}

function resetBooking() {
  document.getElementById('booking-form-area').style.display = 'block';
  document.getElementById('booking-success').style.display = 'none';
  nextStep(1);
}

// ===== CALENDAR =====
function buildCalendar() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return;
  const booked = [3, 7, 14, 18, 22, 28];
  grid.innerHTML = '';
  // June 1, 2025 = Sunday
  for (let i = 1; i <= 30; i++) {
    const div = document.createElement('div');
    div.className = 'cal-day';
    div.textContent = i;
    if (booked.includes(i)) { div.classList.add('booked'); }
    else {
      div.onclick = function () {
        document.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
        this.classList.add('selected');
        const d = new Date(2025, 5, i);
        document.getElementById('sum-date').textContent = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      };
    }
    if (i === 8) div.classList.add('today');
    grid.appendChild(div);
  }
}

function buildAdminCalendar() {
  const grid = document.getElementById('admin-cal-grid');
  if (!grid) return;
  const events = { 5: 'Karthik - Entertainment', 7: 'Deepa - Catering', 8: 'Arjun - Hall', 10: 'Sunita - Birthday', 12: 'Rajesh - Corporate', 14: 'Meera - Wedding', 20: 'TBD - Booking', 25: 'Corp - Team Event' };
  grid.innerHTML = '';
  for (let i = 1; i <= 30; i++) {
    const div = document.createElement('div');
    div.style.cssText = 'min-height:72px;background:var(--surface2);border-radius:8px;padding:6px;font-size:.75rem;position:relative;cursor:pointer;transition:background .2s;';
    div.onmouseover = () => div.style.background = 'var(--surface3)';
    div.onmouseout = () => div.style.background = 'var(--surface2)';
    const num = document.createElement('div');
    num.style.cssText = 'font-weight:600;color:var(--text-muted);margin-bottom:4px;';
    num.textContent = i;
    div.appendChild(num);
    if (events[i]) {
      const ev = document.createElement('div');
      ev.style.cssText = 'background:rgba(201,168,76,0.15);color:var(--gold);padding:2px 5px;border-radius:4px;font-size:.7rem;line-height:1.3;';
      ev.textContent = events[i];
      div.appendChild(ev);
    }
    grid.appendChild(div);
  }
}

// ===== ADMIN =====
function showAdminSection(name, el) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-menu-item').forEach(m => m.classList.remove('active'));
  document.getElementById('admin-' + name).classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'calendar') buildAdminCalendar();
  if (name === 'bookings' || name === 'dashboard') loadAdminBookings();
}

async function loadAdminBookings() {
  try {
    const res = await fetch("/api/bookings");
    const bookings = await res.json();
    
    // Update Bookings Page
    const bTbody = document.getElementById("admin-bookings-tbody");
    if (bTbody) {
      bTbody.innerHTML = "";
      bookings.forEach(b => {
        const dateObj = new Date(b.date);
        const dateStr = isNaN(dateObj.getTime()) ? b.date : dateObj.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'});
        bTbody.innerHTML += `<tr>
          <td style="color:var(--gold);font-weight:500;">EVT-${b.id}</td>
          <td>${b.firstName || 'User'} ${b.lastName || ''}</td>
          <td>${b.eventType || '-'}</td>
          <td>${b.venue || '-'}</td>
          <td>${dateStr}</td>
          <td>${b.guests || '-'}</td>
          <td>${b.totalAmount || '-'}</td>
          <td><span class="status-badge status-confirmed">Confirmed</span></td>
          <td><button class="btn-book">View</button></td>
        </tr>`;
      });
    }

    // Update Dashboard (Recent 5)
    const dTbody = document.getElementById("admin-dashboard-tbody");
    if (dTbody) {
      dTbody.innerHTML = "";
      bookings.slice(0, 5).forEach(b => {
        const dateObj = new Date(b.date);
        const dateStr = isNaN(dateObj.getTime()) ? b.date : dateObj.toLocaleDateString('en-IN', {day: 'numeric', month: 'short', year: 'numeric'});
        dTbody.innerHTML += `<tr>
          <td style="color:var(--gold);font-weight:500;">EVT-${b.id}</td>
          <td>${b.firstName || 'User'} ${b.lastName || ''}</td>
          <td>${b.eventType || '-'}</td>
          <td>${dateStr}</td>
          <td>${b.totalAmount || '-'}</td>
          <td><span class="status-badge status-confirmed">Confirmed</span></td>
        </tr>`;
      });
    }
  } catch (err) {
    console.error("Error fetching bookings:", err);
  }
}

// ===== VENUES FILTER =====
function filterVenue(el, type) {
  document.querySelectorAll('.venues-filters .filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.venue-card').forEach(c => {
    c.style.display = (type === 'all' || c.dataset.type === type) ? 'block' : 'none';
  });
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = '✓ ' + msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== INIT =====
buildCalendar();
const dateInput = document.getElementById('event-date');
if (dateInput) { const today = new Date(); dateInput.min = today.toISOString().split('T')[0]; }
updateSummary();

// ===== CONTACT FORM =====
async function sendContactMessage() {
  const btn = document.getElementById('contact-submit-btn');
  const name = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;
  const email = document.getElementById('contact-email').value;
  const subject = document.getElementById('contact-subject').value;
  const message = document.getElementById('contact-message').value;

  if (!name || !email || !message) {
    alert("Please fill out name, email, and message.");
    return;
  }

  btn.textContent = "Sending...";
  btn.disabled = true;

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, subject, message })
    });

    if (res.ok) {
      showToast('Message sent! We will reply within 2 hours.');
      document.getElementById('contact-name').value = '';
      document.getElementById('contact-phone').value = '';
      document.getElementById('contact-email').value = '';
      document.getElementById('contact-message').value = '';
    } else {
      alert("Failed to send message. Please set your App Password in the backend .env file.");
    }
  } catch (err) {
    console.error("Error sending message:", err);
    alert("Connection error. Is the server running?");
  } finally {
    btn.textContent = "Send Message";
    btn.disabled = false;
  }
}
