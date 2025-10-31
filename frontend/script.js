// script.js
// Basic dialog helpers + small demo helpers for your portal

// Open a <dialog> by id (works with native dialog or a simple fallback)
import { BASE_URL } from './config.js';

function openModal(id) {
  const dlg = document.getElementById(id);
  if (!dlg) return console.warn('Dialog not found:', id);

  // If native dialog support:
  if (typeof dlg.showModal === 'function') {
    dlg.showModal();
  } else {
    // fallback: make it visible and trap focus minimally
    dlg.style.display = 'block';
    dlg.setAttribute('aria-hidden', 'false');
  }

  // save last focused element to restore on close
  dlg.dataset._lastFocus = document.activeElement ? document.activeElement.id || document.activeElement.tagName : '';
  // focus the first focusable element inside dialog
  const focusable = dlg.querySelector('input, select, textarea, button, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
}

function closeModal(id) {
  const dlg = document.getElementById(id);
  if (!dlg) return;
  if (typeof dlg.close === 'function') {
    dlg.close();
  } else {
    dlg.style.display = 'none';
    dlg.setAttribute('aria-hidden', 'true');
  }

  // try to restore focus
  const last = dlg.dataset._lastFocus;
  if (last) {
    const el = document.getElementById(last);
    if (el) el.focus();
  }
}

// Close when user clicks outside the dialog content (backdrop click)
document.addEventListener('click', (e) => {
  // only handle native <dialog> elements that are open
  const dlg = e.target.closest('dialog');
  if (!dlg) return;
  // If the clicked element is the dialog itself (the backdrop)
  if (e.target === dlg) {
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.style.display = 'none';
  }
});

// ESC key to close dialogs
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('dialog').forEach(d => {
      if ((typeof d.open !== 'undefined' && d.open) || d.style.display === 'block') {
        if (typeof d.close === 'function') d.close();
        else d.style.display = 'none';
      }
    });
  }
});

// Small demo handlers and page UI polish:
document.addEventListener('DOMContentLoaded', () => {
  // footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // wire up simple form submit handlers (prevent actual submit for demo)
  const forms = [
    { id: 'signupForm', onSuccess: () => { closeModal('signupModal'); mockNotify('Account created — demo only'); } },
    { id: 'loginForm', onSuccess: () => { closeModal('loginModal'); mockNotify('Logged in — demo only'); } },
    { id: 'mentorRequestForm', onSuccess: () => { closeModal('mentorRequestModal'); mockNotify('Mentor request submitted'); } },
    { id: 'partnerForm', onSuccess: () => { closeModal('partnerModal'); mockNotify('Listing submitted'); } }
  ];

  forms.forEach(({ id, onSuccess }) => {
  const f = document.getElementById(id);
  if (!f) return;
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    // Handle LOGIN form separately
    if (id === 'loginForm') {
      const email = f.querySelector('input[name="email"]').value;
      const password = f.querySelector('input[name="password"]').value;

      try {
        const res = await fetch(`${BASE_URL}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
          closeModal('loginModal');
          mockNotify('✅ Logged in successfully!');
          console.log('User:', data);
          // optional: save token or redirect user
        } else {
          mockNotify('❌ ' + (data.message || 'Invalid credentials'));
        }
      } catch (err) {
        console.error(err);
        mockNotify('⚠️ Error connecting to backend');
      }
      return;
    }

    // For other forms, just show mock success
    onSuccess();
  });
});


  // example stats increment (demo only)
  setTimeout(() => {
    document.getElementById('statStudents').textContent = '1,204';
    document.getElementById('statMentors').textContent = '142';
    document.getElementById('statNGO').textContent = '18';
    document.getElementById('pendingCount').textContent = '5';
  }, 400);
});

// Demo mock functions used in HTML (so onclick handlers won't throw errors)
function mockApprove() {
  const p = document.getElementById('pendingCount');
  if (!p) return;
  let n = parseInt(p.textContent || '0', 10) || 0;
  n = Math.max(0, n - 1);
  p.textContent = String(n);
  mockNotify('Approved one profile (demo)');
}

function mockNotify(msg = 'Action done (demo)') {
  // light-weight visual feedback
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.right = '1rem';
  el.style.bottom = '1rem';
  el.style.padding = '.6rem .9rem';
  el.style.borderRadius = '8px';
  el.style.boxShadow = '0 4px 12px rgba(0,0,0,.12)';
  el.style.background = 'white';
  el.style.zIndex = 9999;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// expose functions globally so inline onclicks work (if your page relies on them)
window.openModal = openModal;
window.closeModal = closeModal;
window.mockApprove = mockApprove;
window.mockNotify = mockNotify;
