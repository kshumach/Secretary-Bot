'use strict';
// TODO: Make return values more consistent
const Model = require('./database');
const { pgp } = require('../../db/pgp');

class EmojiModels {

    static checkEmoji(emoji, serverId) {
        return new Promise((resolve, reject) => {
            const makeQuery = Model.performQuery(`
                select * from emojis 
                    where emoji IN ($1)
                    and server_id = $2
            `
            ,[emoji, serverId]);
            makeQuery.then((result) => {
               resolve({ exists: result.length === 1 })
            }).catch(err => reject(err));
        });
    }

    static addEmoji(emoji) {
        console.log('emoji list', emoji);
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
                if(result) {
                    resolve(result);
                }
            }).catch(err => reject({ error: 'Failed at updating emoji' }));
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