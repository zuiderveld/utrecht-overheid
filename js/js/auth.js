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
    style.textContent = 'html.auth-guard-pending body{visibility:hidden}';
    document.head.appendChild(style);
})();

function getLoginUrl() {
    return '/index.html';
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
        window.location.replace(getLoginUrl());
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
        badge.innerHTML = `<i class="fas fa-user"></i> ${user}`;
        if (isBeheer()) {
            badge.innerHTML += ` <span style="opacity:0.8">(Beheer)</span>`;
        }
        badge.style.background = `${cfg.kleur}33`;
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

// Automatisch alle /politie/, /kmar/, etc. pagina's beschermen
(function autoGuardFromPath() {
    const dienst = detectDienstFromPath();
    if (dienst) {
        guardPage(dienst);
    }
})();

document.addEventListener('DOMContentLoaded', injectFavicon);
