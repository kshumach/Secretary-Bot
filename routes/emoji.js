'use strict';

const EmojiModels = require('../db/models/emoji');

class EmojiActions {
    static async updateEmoji(emoji, serverId) {
        const uniqueEmojis = Array.from(new Set(emoji));
        // Create the insert list for the db model
        // Check if the emoji already exists in the filtered list, if it does update the usage count
        const emojiInsertSet = uniqueEmojis.map(emoj => {
            const usage = emoji.filter(emo => emo === emoj).length;
            return { emoji: emoj, server_id: serverId, usage_count: usage }
        });
        try {
            return await EmojiModels.updateEmojiCount(emojiInsertSet, serverId, uniqueEmojis);
        } catch(e) {
            console.error(e);
        }
    }

    static async checkEmoji(emoji, serverId) {
        const uniqueEmojis = Array.from(new Set(emoji));
        try {
           return await EmojiModels.checkEmoji(uniqueEmojis, serverId);
        } catch(e) {
            console.error(e);
        }
    }

    static async addEmoji(emoji, serverId) {
        // Create the insert list for the db model
        // Check if the emoji already exists in the filtered list, if it does update the usage count
        const uniqueEmojis = Array.from(new Set(emoji));
        const emojiInsertSet = uniqueEmojis.map(emoj => {
            const usage = emoji.filter(emo => emo === emoj).length;
            return { emoji: emoj, server_id: serverId, usage_count: usage }
        });
        try {
            return await EmojiModels.addEmoji(emojiInsertSet);
        } catch(e) {
            console.error(e);
        }
    }

    static async updateUserEmojiUsage(emoji, serverId, user) {
        const emojiInsertSet = emoji.map(emoj => {
            return { emoji: emoj, server_id: serverId, user_id: user }
        });
        try {
            return await EmojiModels.updateUserEmojiUsage(emojiInsertSet);
        } catch(e) {
            console.error(e);
        }
    }

    static async getEmojiUsageReport(serverId) {
        try {
            return await EmojiModels.getEmojiUsageReport(serverId);
        } catch(e) {
            console.error(e);
        }
    }

}

module.exports = EmojiActions;