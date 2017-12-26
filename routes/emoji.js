'use strict';

const EmojiModels = require('../db/models/emoji');

class EmojiActions {
    static async updateEmoji(emoji, serverId) {
        const emojis = `(${emoji.join(',')})`;
        try {
            return await EmojiModels.updateEmojiCount(emojis, serverId);
        } catch(e) {
            console.error(e);
        }
    }

    static async checkEmoji(emoji, serverId) {
        const emojis = `(${emoji.join(',')})`;
        try {
           return await EmojiModels.checkEmoji(emojis, serverId);
        } catch(e) {
            console.error(e);
        }
    }

    static async addEmoji(emoji, serverId) {
        const emojis = `(${emoji.join(',')})`;
        try {
            return await EmojiModels.addEmoji(emojis, serverId);
        } catch(e) {
            console.error(e);
        }
    }

    static async updateUserEmojiUsage(emoji, serverId, user) {
        const emojis = `(${emoji.join(',')})`;
        try {
            return await EmojiModels.updateUserEmojiUsage(emojis, serverId, user);
        } catch(e) {
            console.error(e);
        }
    }
}

module.exports = EmojiActions;