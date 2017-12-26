'use strict';
// TODO: Make return values more consistent
const Model = require('./database');
const { pgp } = require('../../db/pgp');

class EmojiModels {

    static checkEmoji(emoji, serverId) {
        return new Promise((resolve, reject) => {
            const makeQuery = Model.performQuery(`
                select * from emojis 
                    where emoji IN ($1:csv)
                    and server_id = $2
            `
            ,[emoji, serverId]);
            makeQuery.then((result) => {
               resolve({ exists: result.length !== 0 })
            }).catch(err => reject(err));
        });
    }

    static getEmojis(emojis, serverId) {
        // Only called when we know the emojis exist so we don't need to have an explicit check for a result set
        return new Promise((resolve, reject) => {
            const makeQuery = Model.performQuery(`
                select * from emojis 
                    where emoji IN ($1:csv)
                    and server_id = $2
            `
                ,[emojis, serverId]);
            makeQuery.then((result) => {
                resolve(result)
            }).catch(err => reject(err));
        });
    }

    static addEmoji(emoji) {
        return new Promise((resolve, reject) => {
            const cs = pgp.helpers.ColumnSet(['emoji', 'server_id', 'usage_count'], { table: 'emojis' });
            const makeQuery = Model.performQuery(pgp.helpers.insert(emoji, cs), []);

            makeQuery.then(result => {
               if(result) {
                   resolve(result);
               }
            }).catch(err => reject({ error: 'Failed at adding emoji' }));
        });
    }

    static updateEmojiCount(emoji, serverId, emojis) {
        return new Promise((resolve, reject) => {
            EmojiModels.getEmojis(emojis, serverId).then(result => {
                const values = result.map(item => {
                    const index = emoji.findIndex(obj => { return (item.server_id === serverId && item.emoji === obj.emoji) });
                    item.usage_count = item.usage_count + emoji[index].usage_count;
                    return item;
                });
                const cs = pgp.helpers.ColumnSet(['?emoji', '?server_id', 'usage_count'], { table: 'emojis' });
                const makeQuery = Model.performQuery(pgp.helpers.update(values, cs) + 'WHERE v.emoji = t.emoji AND v.server_id = t.server_id', []);

                makeQuery.then(result => {
                    if(result) {
                        resolve(result);
                    }
                }).catch(err => reject({ error: 'Failed at updating emoji' }));
            }).catch(err => console.error(err));
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
                if(result) {
                    resolve(result);
                }
            }).catch(err => reject({ error: 'Failed at adding emoji usage info' }));
        })
    }
}

module.exports = EmojiModels;