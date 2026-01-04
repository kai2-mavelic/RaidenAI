import axios from 'axios'
import { sendText, textOnlyMessage, userManager } from '#helper'

/**
 * @param {import('../../system/types/plugin').HandlerParams} params
 */
async function handler({ sock, m, q, text, jid, command, prefix }) {
    if (!textOnlyMessage(m)) return
    if (!userManager.trustedJids.has(m.senderId))
return
    if (!text) return await sendText(sock, jid, 'mau tanyaa apaa sayangg??')

    try {
        const instruction = 'kamu adalah Raiden sosok sahabat lelaki baik yang sangat baik kepada teman laki-laki kamu yaitu Hakuji, kamu ramah dan baik rendah hati sopan ketika hakuji bilang "ingin bertanya" kamu respon "iyaa bro, tanya aja semuanya sahabatmu yang serba tau akan membantu mu" hanya kata ini jangan di tambahin yang lain, kamu juga menggunakan emoji emoji ramah dan riang tapi tidak terlalu banyak dan tidak menggunakan huruf kapital, kamu sangat setia kepada sahabatmu hakuji'
        let sessionId = m.sessionId || null 
        const gemini = async ({ message, instruction = '', sessionId = null }) => {
            try {
                if (!message) throw new Error('Message is required.')
                
                let resumeArray = null
                let cookie = null
                let savedInstruction = instruction
                
                if (sessionId) {
                    try {
                        const sessionData = JSON.parse(Buffer.from(sessionId, 'base64').toString())
                        resumeArray = sessionData.resumeArray
                        cookie = sessionData.cookie
                        savedInstruction = instruction || sessionData.instruction || ''
                    } catch (e) {
                        console.error('Error parsing session:', e.message)
                    }
                }
                
                if (!cookie) {
                    const { headers } = await axios.post(
                        'https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c',
                        'f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&',
                        { headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' } }
                    )
                    cookie = headers['set-cookie']?.[0]?.split('; ')[0] || ''
                }
                
                const requestBody = [
                    [message, 0, null, null, null, null, 0], ["en-US"], resumeArray || ["", "", "", null, null, null, null, null, null, ""],
                    null, null, null, [1], 1, null, null, 1, 0, null, null, null, null, null, [[0]], 1, null, null, null, null, null,
                    ["", "", savedInstruction, null, null, null, null, null, 0, null, 1, null, null, null, []],
                    null, null, 1, null, null, null, null, null, null, null, 
                    [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20], 1, null, null, null, null, [1]
                ]
                
                const payload = [null, JSON.stringify(requestBody)]
                
                const { data } = await axios.post(
                    'https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c',
                    new URLSearchParams({ 'f.req': JSON.stringify(payload) }).toString(),
                    {
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                            'x-goog-ext-525001261-jspb': '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
                            'cookie': cookie
                        }
                    }
                )
                
                const match = Array.from(data.matchAll(/^\d+\n(.+?)\n/gm))
                const array = match.reverse()
                const selectedArray = array[3][1]
                const realArray = JSON.parse(selectedArray)
                const parse1 = JSON.parse(realArray[0][2])
                
                const newResumeArray = [...parse1[1], parse1[4][0][0]]
                const text = parse1[4][0][1][0].replace(/\*\*(.+?)\*\*/g, '*$1*')
                
                const newSessionId = Buffer.from(JSON.stringify({
                    resumeArray: newResumeArray,
                    cookie: cookie,
                    instruction: savedInstruction
                })).toString('base64')
                
                return { text, sessionId: newSessionId }
            } catch (error) {
                throw new Error(error.message)
            }
        }

        
        const res = await gemini({ message: text, instruction, sessionId })
        m.sessionId = res.sessionId
        const reply = `${res.text}`
        return await sendText(sock, jid, reply)
        
    } catch (err) {
        console.error(err)
        return await sendText(sock, jid, 'Terjadi error saat memanggil Raiden', m)
    }
}

handler.pluginName = 'Raiden'
handler.description = 'my bini raiden wle'
handler.command = ['raiden']
handler.category = ['ai']

handler.meta = {
    fileName: 'ai-raiden.js',
    version: '1.0',
    author: 'Kadz',
    note: 'ai ygy'
}

export default handler