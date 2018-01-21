'use strict';

const { db, pgp } = require('../pgp');
const sql = require('./sql').emojis;

class EmojiModels {

    static checkEmoji(emoji, serverId) {
        return new Promise((resolve, reject) => {
            db.any(sql.get, [emoji, serverId])
                .then(result => {
                    resolve({ exists: result.length !== 0 })
                })
                .catch(err => reject(err))
        });
    }

    static addEmoji(emoji) {
        return new Promise((resolve, reject) => {
            const cs = pgp.helpers.ColumnSet(['emoji', 'server_id', 'usage_count'], { table: 'emojis' });
            const query = pgp.helpers.insert(emoji, cs) + 'returning *';

            db.one(query).then(result => {
               if(result) {
                   resolve(result);
               }
            }).catch(err => reject({ error: 'Failed at adding emoji' }));
        });
    }

    static updateEmojiCount(emoji, serverId, emojis) {
        return new Promise((resolve, reject) => {
            db.task(t => {
                return t.many(sql.get, [emojis, serverId])
                    .then(result => {
                        const values = result.map(item => {
                            const index = emoji.findIndex(obj => { return (item.server_id === serverId && item.emoji === obj.emoji) });
                            item.usage_count = item.usage_count + emoji[index].usage_count;
                            return item;
                        });
                        const cs = pgp.helpers.ColumnSet(['?emoji', '?server_id', 'usage_count'], { table: 'emojis' });
                        const query = pgp.helpers.update(values, cs) + 'WHERE v.emoji = t.emoji AND v.server_id = t.server_id';
                        return t.none(query);
                    });
            })
            .then(events => {
                resolve([]);
            })
            .catch(err => {
                reject(err);
            })
        });
    }

    static updateUserEmojiUsage(emoji) {
        return new Promise((resolve, reject) => {
            const cs = pgp.helpers.ColumnSet(['emoji', 'server_id', 'user_id'], { table: 'emoji_usage' });
            const query = pgp.helpers.insert(emoji, cs);

            db.none(query)
                .catch(err => reject({ error: 'Failed at updating user emoji usage.' }));
        })
    }
  
    static getEmojiUsageReport(serverId) {
        return new Promise((resolve, reject) => {
            const query = `
                select emoji, usage_count 
                    from emojis
                    where server_id = '212802808917786625'
                    ORDER BY usage_count DESC
            `;

            db.any(query).then(result => {
                if(result) {
                    resolve(result);
                }
            }).catch(err => reject({ error: 'Failed at getting emoji usage report.' }));
        })
    }
}

module.exports = EmojiModels;