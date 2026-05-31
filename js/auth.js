/**
 * URP Overheid Portaal - Authenticatie & Discord rol-toegang
 */
const OVERHEID_DIENSTEN = {
    politie: { naam: 'Politie', kleur: '#0066ff', icoon: 'fa-shield-alt', footer: 'Politie Divisie' },
    kmar: { naam: 'KMar', kleur: '#ff9900', icoon: 'fa-passport', footer: 'Koninklijke Marechaussee' },
    ambulance: { naam: 'Ambulance', kleur: '#ff3333', icoon: 'fa-ambulance', footer: 'Ambulancezorg' },
    pechhulp: { naam: 'Pechhulp', kleur: '#33cc33', icoon: 'fa-wrench', footer: 'ANWB Pechhulp' }
};

const FAVICON_HTML = '<link rel="icon" type="image/png" href="/assets/favicon.png"><link rel="apple-touch-icon" href="/assets/favicon.png">';

(function injectAuthStyles() {
    if (document.getElementById('auth-guard-style')) return;
    const style = document.createElement('style');
    style.id = 'auth-guard-style';
    style.textContent = `
        html.auth-guard-pending body{visibility:hidden}
        .beheer-profile-wrap{position:relative}
        .beheer-badge-btn{
            display:inline-flex;align-items:center;gap:8px;cursor:pointer;
            border:none;font:inherit;color:inherit;padding:0.3rem 0.8rem;
            border-radius:20px;font-size:0.8rem;transition:0.2s
        }
        .beheer-badge-btn .chevron{font-size:0.65rem;opacity:0.8}
        .beheer-badge-btn:hover{filter:brightness(1.15)}
        .beheer-dropdown{
            display:none;position:absolute;right:0;top:calc(100% + 8px);
            min-width:200px;background:#141824;border:1px solid #2a2c35;
            border-radius:14px;padding:0.4rem;z-index:200;
            box-shadow:0 12px 40px rgba(0,0,0,0.5)
        }
        .beheer-dropdown.open{display:block}
        .beheer-dropdown-title{
            font-size:0.65rem;color:#6b7280;text-transform:uppercase;
            padding:0.4rem 0.75rem 0.25rem;letter-spacing:0.05em
        }
        .beheer-dropdown a{
            display:flex;align-items:center;gap:10px;padding:0.55rem 0.75rem;
            color:#eef2ff;text-decoration:none;border-radius:10px;font-size:0.85rem
        }
        .beheer-dropdown a:hover{background:rgba(0,206,209,0.12)}
        .beheer-dropdown a.active{background:rgba(0,206,209,0.2);color:#00ced1}
        .beheer-dropdown a i{width:18px;text-align:center}
    `;
    document.head.appendChild(style);
})();

function switchBeheerDienst(dienst) {
    if (!OVERHEID_DIENSTEN[dienst]) return;
    sessionStorage.setItem('overheidDienst', dienst);
    window.location.href = `${window.location.origin}/${dienst}/index.html`;
}

function setupBeheerProfileMenu(huidigeDienst) {
    const badge = document.getElementById('userBadge');
    if (!badge || !isBeheer()) return;

    const user = getUsername();
    const cfg = OVERHEID_DIENSTEN[huidigeDienst];

    const wrap = document.createElement('div');
    wrap.className = 'beheer-profile-wrap';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'beheer-badge-btn user-badge';
    btn.id = 'userBadgeBtn';
    btn.style.background = `${cfg.kleur}33`;
    btn.innerHTML = `<i class="fas fa-user"></i> ${user} <span style="opacity:0.85">(Beheer)</span> <i class="fas fa-chevron-down chevron"></i>`;

    const menu = document.createElement('div');
    menu.className = 'beheer-dropdown';
    menu.id = 'beheerDropdown';
    menu.innerHTML = `<div class="beheer-dropdown-title">Wissel van dienst</div>`;

    const adminLink = document.createElement('a');
    adminLink.href = '/admin/index.html';
    adminLink.innerHTML = `<i class="fas fa-cog" style="color:#00ced1"></i> Beheer Panel`;
    adminLink.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    adminLink.style.marginBottom = '0.25rem';
    menu.appendChild(adminLink);

    Object.keys(OVERHEID_DIENSTEN).forEach((key) => {
        const d = OVERHEID_DIENSTEN[key];
        const link = document.createElement('a');
        link.href = `/${key}/index.html`;
        if (key === huidigeDienst) link.classList.add('active');
        link.innerHTML = `<i class="fas ${d.icoon}" style="color:${d.kleur}"></i> ${d.naam}`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchBeheerDienst(key);
        });
        menu.appendChild(link);
    });

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('open');
    });

    document.addEventListener('click', () => menu.classList.remove('open'));

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    badge.replaceWith(wrap);
}

function getLoginUrl() {
    const base = window.location.origin;
    return base + '/index.html';
}

/** Directe redirect vóór pagina zichtbaar is */
function redirectNaarLogin() {
    document.documentElement.classList.add('auth-guard-pending');
    window.location.replace(getLoginUrl());
}

function getDienst() {
    return sessionStorage.getItem('overheidDienst');
}

function getUsername() {
    return sessionStorage.getItem('overheidUser') || 'Medewerker';
}

function isIbtDocent() {
    return sessionStorage.getItem('overheidIsIbtDocent') === 'true';
}

function isBeheer() {
    return sessionStorage.getItem('overheidIsBeheer') === 'true';
}

function isLoggedIn() {
    return !!(getDienst() && getUsername());
}

function logout() {
    sessionStorage.removeItem('overheidDienst');
    sessionStorage.removeItem('overheidUser');
    sessionStorage.removeItem('overheidIsIbtDocent');
    sessionStorage.removeItem('overheidIsBeheer');
    sessionStorage.removeItem('overheidGewensteDienst');
    sessionStorage.removeItem('overheidAccessToken');
    window.location.replace(getLoginUrl());
}

function detectDienstFromPath() {
    const match = window.location.pathname.match(/\/(politie|kmar|ambulance|pechhulp)(?:\/|$)/);
    return match ? match[1] : null;
}

/**
 * Blokkeert directe URL-bezoek zonder login
 */
function requireAuth(vereisteDienst) {
    if (!isLoggedIn()) {
        redirectNaarLogin();
        return false;
    }

    const huidigeDienst = getDienst();
    if (vereisteDienst && huidigeDienst !== vereisteDienst && !isBeheer()) {
        const cfg = OVERHEID_DIENSTEN[huidigeDienst];
        const naam = cfg ? cfg.naam : huidigeDienst;
        alert(`Geen toegang. Je bent ingelogd als ${naam}, niet voor dit onderdeel.`);
        window.location.replace(`/${huidigeDienst}/index.html`);
        return false;
    }

    document.documentElement.classList.remove('auth-guard-pending');
    return true;
}

function guardPage(vereisteDienst) {
    document.documentElement.classList.add('auth-guard-pending');
    return requireAuth(vereisteDienst);
}

function initDashboard(vereisteDienst, opts = {}) {
    if (!requireAuth(vereisteDienst)) return;

    const cfg = OVERHEID_DIENSTEN[vereisteDienst];
    const user = getUsername();

    const badge = document.getElementById('userBadge');
    if (badge) {
        if (isBeheer()) {
            setupBeheerProfileMenu(vereisteDienst);
        } else {
            badge.innerHTML = `<i class="fas fa-user"></i> ${user}`;
            badge.style.background = `${cfg.kleur}33`;
        }
    }

    const welcome = document.getElementById('welcomeMessage');
    if (welcome) {
        welcome.innerHTML = `<i class="fas fa-hand-peace"></i> Welkom terug, <strong>${user}</strong>!`;
        welcome.style.borderColor = cfg.kleur;
        if (isBeheer()) {
            welcome.innerHTML += `<br><span style="font-size:0.8rem;color:#00ced1;"><i class="fas fa-crown"></i> Beheer — toegang tot alle diensten</span>`;
        }
    }

    if (opts.onIbtDocent && isIbtDocent()) {
        opts.onIbtDocent();
        if (welcome) {
            welcome.innerHTML += `<br><span style="font-size:0.8rem;color:#ffaa33;"><i class="fas fa-chalkboard-user"></i> Docent - PowerPoint toegang</span>`;
        }
    }
}

function injectFavicon() {
    if (document.querySelector('link[rel="icon"]')) return;
    document.head.insertAdjacentHTML('afterbegin', FAVICON_HTML);
}

// Automatisch alle /politie/, /kmar/, etc. pagina's beschermen (direct, geen flits)
(function autoGuardFromPath() {
    const dienst = detectDienstFromPath();
    if (!dienst) return;
    document.documentElement.classList.add('auth-guard-pending');
    if (!isLoggedIn()) {
        redirectNaarLogin();
        return;
    }
    const huidigeDienst = getDienst();
    if (huidigeDienst !== dienst && !isBeheer()) {
        window.location.replace(`${window.location.origin}/${huidigeDienst}/index.html`);
        return;
    }
    document.documentElement.classList.remove('auth-guard-pending');
})();

document.addEventListener('DOMContentLoaded', injectFavicon);
