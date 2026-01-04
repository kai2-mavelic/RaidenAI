export function extractUrl(text) {
    const urlRegex = /https?:\/\/(?:\[[^\]]+\]|[A-Za-z0-9\-._~%]+(?:\.[A-Za-z0-9\-._~%]+)*)(?::\d{1,5})?(?:[/?#][^\s"'<]*)?/gi;
    const raw = text.match(urlRegex) || [];

    // bersihkan trailing punctuation yang sering muncul di teks: . , ; : ! ? ) ] " '
    const cleaned = raw.map(u => {
        // hapus penutup kurung/quote/tanda baca berulang di akhir
        return u.match(/http([^\s\\]+)/g)?.[0];
    });

    // optional: validasi benar-benar URL (mengeliminasi false positives)
    return cleaned.filter(s => {
        try {
            new URL(s); // akan throw kalau bukan url valid
            return true;
        } catch (e) {
            return false;
        }
    });
}
export function getSecondNow() {
    return Math.floor(Date.now() / 1000)
}
export async function setBotLabel(sock, jid, label) {
    const payload = {
        "protocolMessage": {
            "type": 30,
            "memberLabel": {
                "label": label,
                "labelTimestamp": getSecondNow()
            }
        }
    }
    return await sock.relayMessage(jid, payload, {})
}

