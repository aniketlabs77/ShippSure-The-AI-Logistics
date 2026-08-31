/* =========================================================
   AI LOGISTICS — shared UI helpers
   ========================================================= */

function fmtDate(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function fmtDateShort(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
}
function initials(name){
  if(!name) return '?';
  return name.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
}
function toast(message, variant='teal'){
  let host = document.getElementById('toastHost');
  if(!host){
    host = document.createElement('div');
    host.id = 'toastHost';
    host.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    host.style.zIndex = 1080;
    document.body.appendChild(host);
  }
  const colorMap = { teal:'var(--teal)', amber:'var(--amber)', red:'var(--red)' };
  const el = document.createElement('div');
  el.className = 'toast align-items-center border-0 show mb-2';
  el.style.background = 'var(--navy-800)';
  el.style.color = 'var(--paper)';
  el.style.borderLeft = `4px solid ${colorMap[variant] || colorMap.teal}`;
  el.innerHTML = `<div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  host.appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 3200 });
  t.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

function initSidebarToggle(){
  const toggleBtn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if(!toggleBtn || !sidebar) return;
  const open = () => { sidebar.classList.add('open'); backdrop?.classList.add('show'); };
  const close = () => { sidebar.classList.remove('open'); backdrop?.classList.remove('show'); };
  toggleBtn.addEventListener('click', open);
  backdrop?.addEventListener('click', close);
}

function wireLogout(selector='.logout-link'){
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      Store.logout();
      const path = window.location.pathname;
      window.location.href = (path.includes('/customer/') || path.includes('/driver/') || path.includes('/admin/')) ? '../login.html' : 'login.html';
    });
  });
}

function paintUserChip(nameSelector, chipSelector){
  const s = Store.session();
  if(!s) return;
  document.querySelectorAll(nameSelector).forEach(el => el.textContent = s.name);
  document.querySelectorAll(chipSelector).forEach(el => el.textContent = initials(s.name));
}
