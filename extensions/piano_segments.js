function getSegmentsWithTimeout(persistedQueryId, candidateSegmentIds, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject('Timeout: getSegments did not respond in time');
        }, timeoutMs);
  
        if (
            typeof window.cX !== 'undefined' &&
        typeof window.cX.getSegments === 'function'
        ) {
            window.cX.getSegments(
                {
                    persistedQueryId,
                    callback: function (res) {
                        clearTimeout(timeout);
                        if (res) {
                            resolve(res);
                        } else {
                            reject('No response received');
                        }
                    },
                },
                {
                    candidateSegmentIds,
                }
            );
        } else {
            clearTimeout(timeout);
            reject('cX or cX.getSegments not available');
        }
    });
}
  
// brand config per domain (persistedQueryId and candidates for google ads)
const pianoConfig = [
    {
        domainMatch: 'welt.de',
        persistedQueryId: 'bdc54edb63ef1ad17b0734d7068057e061aea007',
        candidateSegmentIds: [
            '8n4danypt3nz','8ocakc953yju','8nez16hcfigy','8nq24r5kshos','8ocaeovts6es','aa99mr2co4sj','a9yrhauwjh19','8o1lpkojqk7n','8msydl744ziq',
        ],
    },
    {
        domainMatch: 'bild.de',
        persistedQueryId: 'a385ca0ddebeea09fe5b4dcb1fddddcbe636270d',
        candidateSegmentIds: [
            '8nqb8cekr0ew','8nqhah8cox2r','8n4gqc3oyv36','8nez02m7ypj5','8nez02m7ypj7','8nez02m7ypj6','8o1925xknakl','8n47tgwzyg4x','8nq5vdua026j','8nf19qkb3e8t','8nf1jr6605xr','aa9uc8kqflmr','aavbnrmg28ca','8nq5vdua026j',
        ],
    },
];

async function handlePianoSegments() {
    const hostname = window.location.hostname;
  
    // Finde die passende Konfiguration basierend auf Teilstring (Subdomain-freundlich)
    const config = pianoConfig.find(entry => hostname.includes(entry.domainMatch));
  
    if (!config) {
        return;
    }

    try {
        const res = await getSegmentsWithTimeout(
            config.persistedQueryId,
            config.candidateSegmentIds,
            2000 // wait for results
        );
  
        // Google Ads only Candidates due to String Limitation of 100 characters in Google
        const filtered = res.filter((seg) => config.candidateSegmentIds.includes(seg.id));
        window.utag.data.piano_candidates_res = filtered;
        window.utag.data.piano_candidates_short = filtered.map((item) => item.shortId).join('.');
  
        if (typeof window.gtag === 'function') {
            if (window.utag.data.piano_candidates_short) {
                window.gtag('event', 'piano_short', {
                    piano_short: '.' + window.utag.data.piano_candidates_short + '.',
                });
            }
        } 
  
        if (typeof window.fbq === 'function') {
            if (window.utag.data.piano_candidates_res) {
                //facebook
                window.fbq('trackCustom', 'piano_short', {
                    piano_short: window.utag.data.piano_candidates_res,
                });
            }
        } 
  
  
    } catch (error) {
        window.utag.data.piano_error = error;
    }
}
  
// Start
handlePianoSegments();
  
  