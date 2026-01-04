import { sendText } from '#helper'
import { isJidGroup } from 'baileys'

async function handler({ m, jid, sock, command }) {
    if (!isJidGroup(jid)) {
        return sendText(sock, jid, 'khusus grup', m)
    }

    const metadata = await sock.groupMetadata(jid)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const bot = metadata.participants.find(v => v.id === botId)

    switch (command) {
        case 'open': {
            await sock.groupSettingUpdate(jid, 'not_announcement')
            return sendText(sock, jid, 'grup dibuka, silakan ngoceh', m)
        }

        case 'close': {
            await sock.groupSettingUpdate(jid, 'announcement')
            return sendText(sock, jid, 'grup ditutup, admin only', m)
        }

        default:
            return sendText(sock, jid, 'command tidak dikenal', m)
    }
}

handler.pluginName = 'group-open-close'
handler.command = ['open', 'close']
handler.category = ['group']
handler.deskripsi = 'buka / tutup grup'
handler.meta = {
    fileName: 'group-open-close.js',
    version: '1.0',
    author: 'ky'
}

export default handler