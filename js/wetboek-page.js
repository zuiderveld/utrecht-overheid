function initWetboekEmbedPage() {
    const tabsEl = document.getElementById('wetboekTabs');
    const frame = document.getElementById('wetboekEmbed');
    const openLink = document.getElementById('wetboekOpenLink');
    if (!frame || !openLink) return;

    const useSheet = URP_WETBOEK.usesSheet();
    const tabs = URP_WETBOEK.tabs || [];
    let active = tabs[0] ? tabs[0].id : 'strafrecht';

    function getTab(id) {
        return tabs.find(function (t) { return t.id === id; }) || tabs[0];
    }

    function setEmbed() {
        if (useSheet) {
            const tab = getTab(active);
            const gid = tab ? tab.gid : 0;
            frame.src = URP_WETBOEK.sheetPreviewUrl(gid);
            openLink.href = URP_WETBOEK.sheetEditUrl(gid);
            openLink.textContent = '';
            openLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Open ' + (tab ? tab.label : 'wetboek') + ' in nieuw venster';
        } else {
            frame.src = URP_WETBOEK.docPreviewUrl();
            openLink.href = URP_WETBOEK.docEditUrl();
            openLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Open Wetboek in Google Docs';
        }
    }

    function renderTabs() {
        if (!tabsEl || !useSheet || tabs.length < 2) {
            if (tabsEl) tabsEl.style.display = 'none';
            return;
        }
        tabsEl.style.display = 'flex';
        tabsEl.innerHTML = tabs.map(function (tab, i) {
            const prefix = i > 0 ? '<span class="sep">·</span>' : '';
            const label = (tab.icon ? tab.icon + ' ' : '') + tab.label;
            const cls = tab.id === active ? ' class="active"' : '';
            return prefix + '<button type="button" data-tab="' + tab.id + '"' + cls + '>' + label + '</button>';
        }).join('');

        tabsEl.querySelectorAll('button[data-tab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                active = btn.getAttribute('data-tab');
                renderTabs();
                setEmbed();
            });
        });
    }

    renderTabs();
    setEmbed();
}
