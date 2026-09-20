const axios = require('axios');

function findAllKeys(arr, key, results) {
    if (arr === null || typeof arr !== 'object') return;
    if (arr[key] !== undefined) results.push(arr[key]);
    Object.values(arr).forEach(v => findAllKeys(v, key, results));
}

async function fetchYoutube(query, type) {
    const payload = {
        context: {
            client: { clientName: 'WEB_REMIX', clientVersion: '1.20240101.00.00', hl: 'id', gl: 'ID' }
        },
        query: query
    };

    if (type === 'songs') {
        payload.params = 'EgWKAQIIAWoSEAQQAxAFEAkQChAVEBAQERAO';
    } else if (type === 'artists') {
        payload.params = 'EgWKAQIgAWoKEAoQCRADEAA=';
    }

    const { data } = await axios.post('https://music.youtube.com/youtubei/v1/search?prettyPrint=false', payload, {
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Origin': 'https://music.youtube.com'
        },
        timeout: 15000
    });

    return data;
}

module.exports = async (req, res) => {
    const query = String(req.query.query || '').trim();
    const type = String(req.query.type || 'all').trim(); // all, songs, playlists

    if (!query) return res.status(400).json({ status: false, creator: 'Nanzz', message: 'Parameter query diperlukan' });

    try {
        let songs = [];
        let albums = [];
        let playlists = [];
        let artists = [];

        const tasks = [];
        if (type === 'all' || type === 'songs') tasks.push(fetchYoutube(query, 'songs').then(data => ({ type: 'songs', data })));
        if (type === 'all' || type === 'playlists') tasks.push(fetchYoutube(query, 'playlists').then(data => ({ type: 'playlists', data })));
        if (type === 'all' || type === 'artists') tasks.push(fetchYoutube(query, 'artists').then(data => ({ type: 'artists', data })));

        const results = await Promise.all(tasks);

        for (const resObj of results) {
            const data = resObj.data;

            if (resObj.type === 'playlists') {
                const items = [];
                findAllKeys(data, 'musicResponsiveListItemRenderer', items);
                findAllKeys(data, 'musicTwoRowItemRenderer', items);
                findAllKeys(data, 'musicCardShelfRenderer', items);

                const seen = {};
                for (const item of items) {
                    const browseId = item?.navigationEndpoint?.browseEndpoint?.browseId || item?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || item?.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId || '';
                    if (!browseId || seen[browseId]) continue;
                    seen[browseId] = true;

                    let title = '', subtitle = '', thumbs = [];

                    if (item.flexColumns) {
                        title = (item.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []).map(r => r.text).join('');
                        subtitle = (item.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []).map(r => r.text).join('');
                        thumbs = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
                    } else if (item.title?.runs) {
                        title = item.title.runs.map(r => r.text).join('');
                        subtitle = (item.subtitle?.runs || []).map(r => r.text).join('');
                        thumbs = item.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
                    } else continue;

                    const thumb = thumbs.length ? thumbs[thumbs.length - 1].url : '';

                    const m = subtitle.match(/^(Album|Single|EP)\s*[•]\s*(.+?)\s*[•]\s*(\d{4})/i);
                    if (m) {
                        albums.push({ id: browseId, title, artist: m[2].trim(), albumType: m[1], year: m[3], cover: thumb });
                    } else if (subtitle.toLowerCase().includes('playlist')) {
                        playlists.push({ id: browseId, title, artist: subtitle, cover: thumb });
                    }
                }
            } else if (resObj.type === 'artists') {
                const items = [];
                findAllKeys(data, 'musicResponsiveListItemRenderer', items);
                findAllKeys(data, 'musicTwoRowItemRenderer', items);
                findAllKeys(data, 'musicCardShelfRenderer', items);
                const seen = {};
                for (const item of items) {
                    const browseId = item?.navigationEndpoint?.browseEndpoint?.browseId || item?.title?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || item?.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId || '';
                    if (!browseId || seen[browseId]) continue;
                    seen[browseId] = true;
                    let title = '', subtitle = '', thumbs = [];
                    if (item.flexColumns) {
                        title = (item.flexColumns[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []).map(r => r.text).join('');
                        subtitle = (item.flexColumns[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []).map(r => r.text).join('');
                        thumbs = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
                    } else if (item.title?.runs) {
                        title = item.title.runs.map(r => r.text).join('');
                        subtitle = (item.subtitle?.runs || []).map(r => r.text).join('');
                        thumbs = item.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails || item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
                    } else continue;
                    const thumb = thumbs.length ? thumbs[thumbs.length - 1].url : '';
                    if (subtitle.toLowerCase().includes('artist') || subtitle.toLowerCase().includes('monthly audience') || subtitle.toLowerCase().includes('pendengar') || subtitle.toLowerCase().includes('audiens') || subtitle.toLowerCase().includes('subscriber')) {
                        artists.push({ id: browseId, title: title, artist: subtitle, cover: thumb });
                    }
                }
            } else if (resObj.type === 'songs') {
                const tabs = data?.contents?.tabbedSearchResultsRenderer?.tabs || [];
                for (const tab of tabs) {
                    const sections = tab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
                    for (const section of sections) {
                        const shelf = section?.musicShelfRenderer;
                        const items = shelf?.contents || section?.itemSectionRenderer?.contents || [];
                        for (const item of items) {
                            const r = item?.musicResponsiveListItemRenderer;
                            if (!r) continue;
                            const cols = r.flexColumns || [];
                            const titleRuns = cols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
                            const title = titleRuns.map(x => x.text).join('');
                            
                            const subRuns = cols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
                            let artist = '', artistId = '', album = '', albumId = '', duration = '';
                            for (const run of subRuns) {
                                const text = run.text || '';
                                const browseId = run?.navigationEndpoint?.browseEndpoint?.browseId || '';
                                if (browseId.startsWith('UC')) { artist = text; artistId = browseId; }
                                else if (browseId.startsWith('MPRE')) { album = text; albumId = browseId; }
                            }

                            const accLabel = cols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.accessibility?.accessibilityData?.label || '';
                            const durMatch = accLabel.match(/(\d+)\s*(?:menit|min)\s*(?:(\d+)\s*(?:detik|det))?/);
                            if (durMatch) duration = durMatch[1] + '.' + (durMatch[2] || '00').padStart(2, '0');
                            if (!duration) {
                                const allText = subRuns.map(x => x.text).join(' ');
                                const m = allText.match(/(\d+)\s*(?:menit|min)/);
                                if (m) duration = m[1] + '.00';
                            }

                            const t = subRuns[0]?.text || '';
                            if (t === 'Video') continue;

                            const videoId = r?.playlistItemData?.videoId || '';
                            const thumbs = r?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
                            const thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : '';
                            if (!videoId) continue;
                            
                            songs.push({ title, videoId, thumbnail, url: `https://music.youtube.com/watch?v=${videoId}`, artist: artist || (subRuns[1]?.text || ''), artistId, album: album || '', albumId, duration });
                        }
                    }
                }
            }
        }

        return res.json({
            status: true,
            creator: 'Nanzz',
            result: { query, totalSongs: songs.length, songs, albums, playlists, artists }
        });

    } catch (err) {
        return res.status(500).json({ status: false, creator: 'Nanzz', message: err.message });
    }
};
