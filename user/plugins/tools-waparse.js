import { tag, sendText, textOnlyMessage } from '#helper'
import * as cheerio from 'cheerio'

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */
async function handler({ sock, m, q, text, jid, command, prefix }) {
    if (!textOnlyMessage(m)) return
    if (!text) {
        return await sendText(sock, jid, `*mana url ch nya*`)
    }

    try {
        // react ⏳ sementara proses
        await sock.sendMessage(jid, { react: { text: '⏳', key: m.key } })

        let url = text.trim()
        let regex = /^https:\/\/(www\.)?whatsapp\.com\/channel\/[A-Za-z0-9]+/i

        if (!regex.test(url)) {
            return await sendText(sock, jid, '🍂 *URL tidak valid.* Pastikan link WhatsApp Channel publik.', m)
        }

        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })

        if (!res.ok) {
            return await sendText(sock, jid, '🍂 *Gagal mengambil halaman channel.*', m)
        }

        const html = await res.text()
        const $ = cheerio.load(html)

        const name = $("meta[property='og:title']").attr("content") || "Tidak diketahui"
        const description = $("meta[property='og:description']").attr("content") || ""
        const image = $("meta[property='og:image']").attr("content") || null

        let followers = null
        const match = description.match(/([\d,.]+)\s*followers/i)
        if (match) followers = parseInt(match[1].replace(/[.,]/g, ""), 10)

        const caption = `📢 *Wa Channel Parse*

🧩 *Nama Channel:* ${name}
👥 *Followers:* ${followers ? followers.toLocaleString("id-ID") : "Tidak diketahui"}
📝 *Deskripsi:* ${description || "Tidak tersedia"}

🔗 *Source:* ${url}`

        if (image) {
            await sock.sendMessage(jid, { image: { url: image }, caption })
        } else {
            await sendText(sock, jid, caption, m)
        }

    } catch (e) {
        await sendText(sock, jid, "🍂 *Terjadi error saat parsing channel.*", m)
    } finally {
        // clear react
        await sock.sendMessage(jid, { react: { text: '', key: m.key } })
    }
}

handler.pluginName = 'waparse'
handler.description = 'Parse info WhatsApp Channel publik'
handler.command = ['waparse', 'wachannel']
handler.category = ['tools']
handler.meta = {
    fileName: 'tools-waparse.js',
    version: '1',
    author: 'Hakuji',
    note: 'Plugin ESM parse WA Channel',
}

export default handler