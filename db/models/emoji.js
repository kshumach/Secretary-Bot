'use strict';
// TODO: Make return values more consistent
const Model = require('./database');

class EmojiModels {

    static checkEmoji(emoji, serverId) {
        return new Promise((resolve, reject) => {
            const makeQuery = Model.performQuery(`
                select * from emojis 
                    where emoji IN $1
                    and server_id = $2
            `
            ,[emoji, serverId]);

            makeQuery.then((result) => {
               resolve({ exists: result.length === 1 })
            }).catch(err => reject(err));
        });
    }

    static addEmoji(emoji, serverId) {
        return new Promise((resolve, reject) => {
           const makeQuery = Model.performQuery(`
                insert into emojis
                    values ($1, $2)
           `
           , [emoji, serverId]);

           makeQuery.then(result => {
               if(result.length === 1) {
                   resolve(result);
               } else {
                   resolve({ error: 'Failed at adding emoji' })
               }
           }).catch(err => reject(err));
        });
    }

    static updateEmojiCount(emoji, serverId) {
        return new Promise((resolve, reject) => {
            const makeQuery = Model.performQuery(`
                update emojis
                    set usage_count = usage_count + 1
                    where emoji = $1
                    and server_id = $2
           `
                , [emoji, serverId]);

            makeQuery.then(result => {
                if(result.length === 1) {
                    resolve(result);
                } else {
                    resolve({ error: 'Failed at updating emoji' })
                }
            }).catch(err => reject(err));
        });
    }

    static updateUserEmojiUsage(emoji, serverId, user) {
        return new Promise((resolve, reject) => {
            const makeQuery = Model.performQuery(`
                insert into emoji_usage (emoji, server_id, user_id)
                values ($1, $2, $3)
            `
            , [emoji, serverId, user]);

            makeQuery.then(result => {
                if(result.length === 1) {
                    resolve(result);
                } else {
                    resolve({ error: 'Failed at adding emoji usage info' })
                }
            }).catch(err => reject(err));
        })
    }
}

module.exports = EmojiModels;