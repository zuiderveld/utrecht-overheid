function initWetboekPage() {
    const accent = document.documentElement.getAttribute('data-accent') || '#0066ff';
    document.documentElement.style.setProperty('--wetboek-accent', accent);

    const tabsEl = document.getElementById('wetboekTabs');
    const contentEl = document.getElementById('wetboekContent');
    if (!tabsEl || !contentEl) return;

    let active = 'strafrecht';

    function renderTabs() {
        tabsEl.innerHTML = URP_WETBOEK_TAB_ORDER.map(function (id, i) {
            const s = URP_WETBOEK_SECTIONS[id];
            const prefix = i > 0 ? '<span class="sep">·</span>' : '';
            const label = (s.icon ? s.icon + ' ' : '') + s.label;
            const cls = id === active ? ' class="active"' : '';
            return prefix + '<button type="button" data-tab="' + id + '"' + cls + '>' + label + '</button>';
        }).join('');

        tabsEl.querySelectorAll('button[data-tab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                active = btn.getAttribute('data-tab');
                renderTabs();
                renderContent();
            });
        });
    }

    function renderContent() {
        const section = URP_WETBOEK_SECTIONS[active];
        if (!section) {
            contentEl.innerHTML = '<p class="wetboek-empty">Sectie niet gevonden.</p>';
            return;
        }

        if (!section.rows || section.rows.length === 0) {
            contentEl.innerHTML =
                '<div class="wetboek-card-header"><span class="icon">⚖️</span><span>' + section.title + '</span></div>' +
                '<p class="wetboek-empty">Deze sectie wordt binnenkort aangevuld.</p>';
            return;
        }

        const rows = section.rows.map(function (r) {
            return '<tr>' +
                '<td data-label="Artikel">' + escapeHtml(r.artikel) + '</td>' +
                '<td data-label="Omschrijving">' + escapeHtml(r.omschrijving) + '</td>' +
                '<td data-label="Straf">' + escapeHtml(r.straf) + '</td>' +
                '</tr>';
        }).join('');

        contentEl.innerHTML =
            '<div class="wetboek-card-header"><span class="icon">⚖️</span><span>' + section.title + '</span></div>' +
            '<table class="wetboek-table">' +
            '<thead><tr><th>Artikel</th><th>Omschrijving</th><th>Straf</th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table>';
    }

    function escapeHtml(text) {
        const d = document.createElement('div');
        d.textContent = text;
        return d.innerHTML;
    }

    renderTabs();
    renderContent();
}
