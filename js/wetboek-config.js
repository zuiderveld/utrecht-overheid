/**
 * URP Wetboek — Google Spreadsheet (aanbevolen) of Google Doc als fallback.
 * Spreadsheet: deel als "iedereen met link kan bekijken", vul sheetId + gid per tab in.
 */
const URP_WETBOEK = {
    /** Vul hier je Google Sheet ID in (uit de URL). Leeg = Google Doc hieronder. */
    sheetId: '',
    docId: '1qfrcfnsyI-__ufqnPlb56kWgw-W60IqPYoCM7Wxf-Zw',
    tabs: [
        { id: 'strafrecht', label: 'Strafrecht', icon: '🔨', gid: 0 },
        { id: 'opiumwet', label: 'Opiumwet', gid: 0 },
        { id: 'wegenverkeerswet', label: 'Wegenverkeerswet', gid: 0 }
    ],
    usesSheet: function () {
        return !!this.sheetId;
    },
    sheetPreviewUrl: function (gid) {
        return 'https://docs.google.com/spreadsheets/d/' + this.sheetId + '/preview?gid=' + (gid || 0);
    },
    sheetEditUrl: function (gid) {
        return 'https://docs.google.com/spreadsheets/d/' + this.sheetId + '/edit?gid=' + (gid || 0);
    },
    docPreviewUrl: function () {
        return 'https://docs.google.com/document/d/' + this.docId + '/preview';
    },
    docEditUrl: function () {
        return 'https://docs.google.com/document/d/' + this.docId + '/edit?usp=sharing';
    }
};
