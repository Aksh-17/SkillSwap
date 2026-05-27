// app.js - Shared code for every page
// Logic unchanged — UI enhancements added below original functions

const API = 'http://localhost:3000/api';

// ---- User session (localStorage) ----
function saveUser(user)  { localStorage.setItem('user', JSON.stringify(user)); }
function getUser()       { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
function isLoggedIn()    { return getUser() !== null; }
function logout()        { localStorage.removeItem('user'); window.location.href = '/index.html'; }
function requireLogin()  { if (!isLoggedIn()) window.location.href = '/pages/login.html'; }

// ---- API call (unchanged) ----
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res  = await fetch(API + endpoint, options);
  const data = await res.json();
  return data;
}

// ---- Navbar ----
function buildNavbar(activePage) {
  const nav  = document.getElementById('navbar');
  if (!nav) return;
  const user = getUser();
  nav.innerHTML = `
    <a class="navbar-brand" href="/index.html">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.1em;height:1.1em;vertical-align:-0.15em;display:inline-block"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><polyline points="21 3 21 8 16 8"/><polyline points="3 21 3 16 8 16"/></svg> <span>SkillSwap</span>
    </a>
    <button class="nav-toggle" id="navToggle" onclick="toggleNav()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <div class="navbar-links" id="navLinks">
      <a href="/pages/browse.html" class="${activePage==='browse'?'active':''}">Browse</a>
      ${isLoggedIn() ? `
        <a href="/pages/profile.html" class="${activePage==='profile'?'active':''}">My Profile</a>
        <a href="/pages/dashboard.html" class="${activePage==='dashboard'?'active':''}">Dashboard</a>
        <a href="#" onclick="logout()" class="nav-logout">Logout</a>
      ` : `
        <a href="/pages/login.html" class="${activePage==='login'?'active':''}">Login</a>
        <a href="/pages/register.html" class="nav-cta">Get Started</a>
      `}
    </div>
  `;
  // Sticky shadow on scroll
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

// ---- Messages (unchanged signatures) ----
function showError(id, msg) {
  document.getElementById(id).innerHTML =
    `<div class="alert alert-error"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:-0.1em;display:inline-block"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> ${msg}</div>`;
}
function showSuccess(id, msg) {
  document.getElementById(id).innerHTML =
    `<div class="alert alert-success"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;vertical-align:-0.1em;display:inline-block"><polyline points="20 6 9 17 4 12"/></svg> ${msg}</div>`;
}
function clearMsg(id) { document.getElementById(id).innerHTML = ''; }

// ---- Toast notifications (replaces plain alert where used) ----
function showToast(msg, type = '') {
  let wrap = document.getElementById('toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  const t = document.createElement('div');
  t.className = `toast ${type ? 'toast-' + type : ''}`;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(30px)';
    t.style.transition = '0.3s ease';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ---- Loading spinner (unchanged signature) ----
function showSpinner(id) {
  document.getElementById(id).innerHTML = `
    <div class="loading-box">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>`;
}

// ---- Skeleton loader ----
function showSkeleton(id, count = 3) {
  document.getElementById(id).innerHTML = Array(count).fill(`
    <div style="background:white;border:1px solid var(--border);border-radius:var(--r-lg);
                padding:20px;margin-bottom:12px;">
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px;">
        <div class="skeleton" style="width:42px;height:42px;border-radius:50%;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div class="skeleton" style="height:14px;width:60%;margin-bottom:6px;"></div>
          <div class="skeleton" style="height:11px;width:40%;"></div>
        </div>
      </div>
      <div class="skeleton" style="height:11px;width:80%;margin-bottom:6px;"></div>
      <div class="skeleton" style="height:11px;width:60%;"></div>
    </div>`).join('');
}

// ---- Avatar initials (unchanged) ----
function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ---- Scroll reveal ----
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => io.observe(el));
}

document.addEventListener('DOMContentLoaded', initReveal);
