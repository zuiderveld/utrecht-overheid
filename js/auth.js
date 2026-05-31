/**
 * URP Overheid Portaal - Authenticatie & Discord rol-toegang
 * Vereist sessionStorage na Discord OAuth via overheid-bot API
 */
const OVERHEID_DIENSTEN = {
    politie: { naam: 'Politie', kleur: '#0066ff', icoon: 'fa-shield-alt', footer: 'Politie Divisie' },
    kmar: { naam: 'KMar', kleur: '#ff9900', icoon: 'fa-passport', footer: 'Koninklijke Marechaussee' },
    ambulance: { naam: 'Ambulance', kleur: '#ff3333', icoon: 'fa-ambulance', footer: 'Ambulancezorg' },
    pechhulp: { naam: 'Pechhulp', kleur: '#33cc33', icoon: 'fa-wrench', footer: 'ANWB Pechhulp' }
};

const FAVICON_HTML = '<link rel="icon" type="image/png" href="/assets/favicon.png"><link rel="apple-touch-icon" href="/assets/favicon.png">';

function getLoginPath() {
    const path = window.location.pathname;
    if (path.includes('/politie/') || path.includes('/kmar/') || path.includes('/ambulance/') || path.includes('/pechhulp/')) {
        return '/index.html';
    }
    return 'index.html';
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

function isLoggedIn() {
    return !!(getDienst() && getUsername());
}

function logout() {
    sessionStorage.removeItem('overheidDienst');
    sessionStorage.removeItem('overheidUser');
    sessionStorage.removeItem('overheidIsIbtDocent');
    window.location.href = getLoginPath();
}

/**
 * Blokkeert pagina als niet ingelogd of verkeerde Discord-dienst/rol
 * @param {string} vereisteDienst - politie | kmar | ambulance | pechhulp
 */
function requireAuth(vereisteDienst) {
    if (!isLoggedIn()) {
        window.location.href = getLoginPath();
        return false;
    }
    const huidigeDienst = getDienst();
    if (vereisteDienst && huidigeDienst !== vereisteDienst) {
        const cfg = OVERHEID_DIENSTEN[huidigeDienst];
        const naam = cfg ? cfg.naam : huidigeDienst;
        alert(`Geen toegang. Je Discord-rol geeft toegang tot ${naam}, niet tot dit onderdeel.`);
        window.location.href = `/${huidigeDienst}/index.html`;
        return false;
    }
    return true;
}

function initDashboard(vereisteDienst, opts = {}) {
    if (!requireAuth(vereisteDienst)) return;

    const cfg = OVERHEID_DIENSTEN[vereisteDienst];
    const user = getUsername();

    const badge = document.getElementById('userBadge');
    if (badge) {
        badge.innerHTML = `<i class="fas fa-user"></i> ${user}`;
        badge.style.background = `${cfg.kleur}33`;
    }

    const welcome = document.getElementById('welcomeMessage');
    if (welcome) {
        welcome.innerHTML = `<i class="fas fa-hand-peace"></i> Welkom terug, <strong>${user}</strong>!`;
        welcome.style.borderColor = cfg.kleur;
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

document.addEventListener('DOMContentLoaded', injectFavicon);
