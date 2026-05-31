/** URP Wetboek — centraal bijwerken (Strafrecht, Opiumwet, WVW) */
const URP_WETBOEK_SECTIONS = {
    strafrecht: {
        id: 'strafrecht',
        label: 'Strafrecht',
        icon: '🔨',
        title: 'STRAFRECHT',
        rows: [
            { artikel: '184 Sr', omschrijving: 'Negeren wettelijk bevel', straf: '1e: waarschuwing, 2e: waarschuwing, 3e: 10 mnd' },
            { artikel: '300 Sr', omschrijving: 'Mishandeling burger', straf: '16 mnd' },
            { artikel: '300 Sr', omschrijving: 'Mishandeling ambtenaar', straf: '18 mnd' },
            { artikel: '45 Sr', omschrijving: 'Poging tot doodslag burger', straf: '22 mnd' },
            { artikel: '45 Sr', omschrijving: 'Poging tot doodslag ambtenaar', straf: '26 mnd' },
            { artikel: '287 Sr', omschrijving: 'Doodslag burger', straf: '24 mnd' },
            { artikel: '287 Sr', omschrijving: 'Doodslag ambtenaar', straf: '28 mnd' },
            { artikel: '285b Sr', omschrijving: 'Stalking', straf: '1e: waarschuwing, 2e: geldstraf, 3e: 12 mnd' },
            { artikel: '350 Sr', omschrijving: 'Vandalisme', straf: '8 mnd' },
            { artikel: '350 Sr', omschrijving: 'Brandstichting', straf: '8 mnd (levensgevaar: 12 mnd)' },
            { artikel: '326 Sr', omschrijving: 'Oplichting', straf: '1 mnd per €1000,- schade' },
            { artikel: '461 Sr', omschrijving: 'Inbraak privéterrein', straf: '6 mnd' }
        ]
    },
    opiumwet: {
        id: 'opiumwet',
        label: 'Opiumwet',
        icon: '',
        title: 'OPIUMWET',
        rows: [
            { artikel: '2 OW', omschrijving: 'Aanwezig hebben harddrugs', straf: '12 mnd' },
            { artikel: '2 OW', omschrijving: 'Aanwezig hebben softdrugs (>5g)', straf: '4 mnd' },
            { artikel: '3 OW', omschrijving: 'Handel in verdovende middelen', straf: '18 mnd' },
            { artikel: '10 OW', omschrijving: 'Teelt / productie', straf: '14 mnd' }
        ]
    },
    wegenverkeerswet: {
        id: 'wegenverkeerswet',
        label: 'Wegenverkeerswet',
        icon: '',
        title: 'WEGENVERKEERSWET',
        rows: [
            { artikel: '5 WVW', omschrijving: 'Rijden onder invloed', straf: '8 mnd + rijontzegging' },
            { artikel: '6 WVW', omschrijving: 'Gevaarlijk rijgedrag', straf: '6 mnd' },
            { artikel: '7 WVW', omschrijving: 'Doorrijden na ongeval', straf: '10 mnd' },
            { artikel: '9 WVW', omschrijving: 'Rijden zonder rijbewijs', straf: '4 mnd' },
            { artikel: '163 WVW', omschrijving: 'Snelheidsovertreding (>50 km/u)', straf: 'geldstraf / 2 mnd' }
        ]
    }
};

const URP_WETBOEK_TAB_ORDER = ['strafrecht', 'opiumwet', 'wegenverkeerswet'];
