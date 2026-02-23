/**
 * OpenClaw Next - Telegram Channel Adapter
 * Implements communication via Telegram Bot API
 */
export class TelegramAdapter {
    id = 'telegram';
    name = 'Telegram Bot';
    botToken;
    messageHandler;
    pollingInterval = null;
    lastUpdateId = 0;
    constructor(token) {
        this.botToken = token;
    }
    async connect() {
        console.log('[Telegram] Connecting to Telegram API...');
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
            const data = await response.json();
            if (data.ok) {
                console.log(`[Telegram] Logged in as @${data.result.username}`);
                this.startPolling();
            }
            else {
                throw new Error(data.description);
            }
        }
        catch (error) {
            console.error('[Telegram] Connection failed:', error);
            throw error;
        }
    }
    async disconnect() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        console.log('[Telegram] Disconnected.');
    }
    async sendMessage(to, message) {
        await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: to,
                text: message,
                parse_mode: 'Markdown'
            })
        });
    }
    onMessage(handler) {
        this.messageHandler = handler;
    }
    startPolling() {
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getUpdates?offset=${this.lastUpdateId + 1}&timeout=10`);
                const data = await response.json();
                if (data.ok && data.result.length > 0) {
                    for (const update of data.result) {
                        this.lastUpdateId = update.update_id;
                        if (update.message && update.message.text) {
                            this.handleIncoming(update.message);
                        }
                    }
                }
            }
            catch (error) {
                console.error('[Telegram] Polling error:', error);
            }
        }, 2000);
    }
    handleIncoming(tgMsg) {
        if (!this.messageHandler)
            return;
        const normalized = {
            id: tgMsg.message_id.toString(),
            source: 'telegram',
            senderId: tgMsg.chat.id.toString(),
            senderName: tgMsg.from.first_name,
            content: tgMsg.text,
            timestamp: new Date(tgMsg.date * 1000).toISOString(),
            metadata: { raw: tgMsg }
        };
        this.messageHandler(normalized);
    }
}
