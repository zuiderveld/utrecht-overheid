function downloadOverheidCertificaat(opts) {
    const userName = sessionStorage.getItem('overheidUser') || opts.defaultUser || 'Medewerker';
    const datum = new Date().toLocaleDateString('nl-NL');
    const percentage = Math.round((opts.score / opts.maxScore) * 100);
    const training = opts.training;
    const kleur = opts.kleur || '#0066ff';
    const dienst = opts.dienst || 'URP';
    const handtekening = opts.handtekening || 'Korpsleiding URP';

    const html = [
        '<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8">',
        '<title>Certificaat ', training, '</title><style>',
        'body{font-family:Georgia,serif;background:#f5f5f0;margin:40px;}',
        '.certificaat{max-width:800px;margin:0 auto;background:#fff;border:15px solid ', kleur,
        ';padding:40px;text-align:center;}',
        'h1{color:', kleur, ';margin-bottom:1rem;}',
        'h2{font-size:24px;margin:0.5rem 0;}',
        '.naam{font-size:32px;font-weight:bold;border-bottom:2px solid ', kleur,
        ';display:inline-block;padding:0 20px;margin:1rem 0;}',
        '.handtekening{margin-top:2rem;color:#666;font-style:italic;}',
        '</style></head><body><div class="certificaat">',
        '<h1>URP | ', dienst, '</h1>',
        '<h2>Certificaat van Voldoening</h2>',
        '<p>Hierbij wordt verklaard dat</p>',
        '<div class="naam">', userName, '</div>',
        '<p>met succes de kennistoets heeft afgerond voor</p>',
        '<h2>', training, '</h2>',
        '<p>Score: ', opts.score, '/', opts.maxScore, ' (', percentage, '%)</p>',
        '<p>Datum: ', datum, '</p>',
        '<div class="handtekening">', handtekening, '</div>',
        '</div></body></html>'
    ].join('');

    const blob = new Blob([html], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'certificaat_' + training.toLowerCase().replace(/ /g, '_') + '.html';
    link.click();
    URL.revokeObjectURL(link.href);
}
