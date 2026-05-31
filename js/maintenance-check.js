/**
 * Onderhoudsmodus — laadt vroeg op elke pagina
 */
(function () {
  const path = window.location.pathname || '';
  if (path.startsWith('/admin')) return;

  function isBeheer() {
    try {
      return sessionStorage.getItem('overheidIsBeheer') === 'true';
    } catch {
      return false;
    }
  }

  function detectDienst() {
    const m = path.match(/\/(politie|kmar|ambulance|pechhulp)(?:\/|$)/);
    return m ? m[1] : null;
  }

  function showMaintenance(message) {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
      document.head.appendChild(l);
    }
    document.documentElement.classList.add('auth-guard-pending');
    const overlay = document.createElement('div');
    overlay.id = 'maintenanceOverlay';
    overlay.innerHTML = `
      <style>
        #maintenanceOverlay{
          position:fixed;inset:0;z-index:99999;background:#0a0c10;
          display:flex;align-items:center;justify-content:center;padding:2rem;
          font-family:'Segoe UI',system-ui,sans-serif;color:#eef2ff;
        }
        #maintenanceOverlay .box{
          max-width:480px;text-align:center;background:rgba(20,24,36,0.95);
          border:1px solid rgba(255,153,0,0.4);border-radius:24px;padding:2.5rem;
        }
        #maintenanceOverlay i{font-size:3rem;color:#ff9900;margin-bottom:1rem;}
        #maintenanceOverlay h1{font-size:1.5rem;margin-bottom:0.75rem;}
        #maintenanceOverlay p{color:#9ca3af;line-height:1.5;}
      </style>
      <div class="box">
        <i class="fas fa-tools"></i>
        <h1>In onderhoud</h1>
        <p>${message.replace(/</g, '&lt;')}</p>
      </div>
    `;
    const run = () => {
      document.body.innerHTML = '';
      document.body.appendChild(overlay);
      document.documentElement.classList.remove('auth-guard-pending');
    };
    if (document.body) run();
    else document.addEventListener('DOMContentLoaded', run);
  }

  fetch(window.location.origin + '/api/maintenance')
    .then((r) => r.json())
    .then((state) => {
      if (isBeheer()) return;

      const dienst = detectDienst();
      const msg = state.message || 'Deze website is momenteel in onderhoud.';

      if (state.global) {
        showMaintenance(msg);
        return;
      }
      if (dienst && state.diensten && state.diensten[dienst]) {
        const namen = { politie: 'Politie', kmar: 'KMar', ambulance: 'Ambulance', pechhulp: 'Pechhulp' };
        showMaintenance(`${namen[dienst] || dienst} is in onderhoud. ${msg}`);
      }
    })
    .catch(() => {});
})();
