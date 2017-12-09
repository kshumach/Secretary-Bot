'use strict';

/*
    STANDARDS:
        - Return false always whenever something fails/returns an empty set
        - Return object with error property for special cases (Permissions)
        - Return true for updates/deletes/inserts
        - Return the result set for selects
 */

const Model = require('./database');

class IqModels extends Model {

    static getIq(uid, serverId) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
                SELECT IQ FROM iq_points
                    WHERE user_id = $1 AND server_id = $2
            `
                , [uid, serverId]);

            makeQuery.then(result => {
                if (result.rowCount === 0) {
                    resolve(false)
                }
                resolve(result.rows[0]);

            }).catch(err => reject(err))
        })
    }

    static setIq(uid, serverId, amount, adminId) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
                UPDATE iq_points 
                    SET IQ = $1
                    WHERE user_id = $2
                    AND server_id = $3
            `
            , [amount, uid, serverId]);

            const isAdmin = IqModels.isAdmin(adminId);

            if (isAdmin) {
                makeQuery.then(result => {
                    if (result.rowCount === 0) {
                        resolve(false);
                    }
                    resolve(true);
                }).catch(err => reject(err));
            }

            return resolve({error: 'User does not have required permissions'});
        })
    }

    static isAdmin(uid) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
                SELECT user_id
                    FROM admins
                    WHERE user_id = $1
            `
            , [uid]);

            makeQuery.then(result => {
                resolve(result.rowCount === 0)
            }).catch(err => reject(err))
        })
    }
}

module.exports = IqModels;