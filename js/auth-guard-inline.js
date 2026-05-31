/** Laadt vóór body — snelle login-check op beschermde pagina's */
(function () {
    var m = location.pathname.match(/\/(politie|kmar|ambulance|pechhulp)(?:\/|$)/);
    if (!m) return;
    document.documentElement.className += ' auth-guard-pending';
    try {
        if (!sessionStorage.getItem('overheidDienst') || !sessionStorage.getItem('overheidUser')) {
            location.replace(location.origin + '/index.html');
        }
    } catch (e) {
        location.replace(location.origin + '/index.html');
    }
})();
