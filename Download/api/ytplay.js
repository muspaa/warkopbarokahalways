const axios = require('axios');
const crypto = require('crypto');

async function getDownload(url) {
  try {
    const idMatch = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ].find(p => p.test(url))?.exec(url)?.[1];

    if (!idMatch) throw new Error("Invalid URL");

    const api = axios.create({
      headers: {
        "content-type": "application/json",
        origin: "https://yt.savetube.me",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      },
      timeout: 12000
    });

    const cdn = "cdn405.savetube.vip";
    
    const infoResponse = await api.post(`https://${cdn}/v2/info`, { url });
    const encryptedData = infoResponse?.data?.data;
    if (!encryptedData) throw new Error("No data");

    const encrypted = Buffer.from(encryptedData, "base64");
    const decipher = crypto.createDecipheriv("aes-128-cbc",
      Buffer.from("C5D58EF67A7584E4A29F6C35BBC4EB12", "hex"),
      encrypted.slice(0, 16)
    );

    const decryptedBuffer = Buffer.concat([
      decipher.update(encrypted.slice(16)),
      decipher.final()
    ]);
    
    const decrypted = JSON.parse(decryptedBuffer.toString());
    const downloadRes = await api.post(`https://${cdn}/download`, {
        id: idMatch,
        downloadType: "audio",
        quality: "128",
        key: decrypted.key
      });

    const audioUrl = downloadRes.data?.data?.downloadUrl || downloadRes.data?.downloadUrl;
    if (!audioUrl) throw new Error("No URL from primary");

    return {
      duration: `${Math.floor(decrypted.duration / 60)}:${(decrypted.duration % 60).toString().padStart(2, "0")}`,
      audio: audioUrl
    };
  } catch (err) {
    console.error("Primary extraction failed:", err);
    return null;
  }
}

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') { res.status(405).json({ status: false, message: 'Method not allowed' }); return; }

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    const url = (body.query || body.url || '').trim();
    if (!url) { res.status(400).json({ status: false, message: 'Parameter query wajib diisi' }); return; }

    console.log(`[EXTRACT] Starting extraction for: ${url}`);

    try {
        let audioData = await getDownload(url);

        if (audioData && audioData.audio) {
            console.log("[EXTRACT] Success");
            return res.status(200).json({
                status: true,
                result: {
                    duration: audioData.duration || null,
                    download: { audio: audioData.audio }
                }
            });
        }

        console.error("[EXTRACT] All methods failed");
        res.status(503).json({ status: false, error: "Media extraction services are currently overloaded. Please try another track." });
    } catch (err) {
        console.error("[EXTRACT] Fatal error:", err.message);
        res.status(500).json({ status: false, error: "Internal server error during extraction" });
    }
};
