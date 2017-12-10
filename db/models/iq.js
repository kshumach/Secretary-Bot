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

    static setIq(uid, serverId, iq, adminId) {
        return new Promise((resolve, reject) => {

            IqModels.isAdmin(adminId).then(isAdmin => {
                if (isAdmin) {
                    IqModels.checkEntry(uid, serverId).then(result => {
                        if (result) {
                            console.log(result.iq, iq);
                            if (result.iq !== iq) {
                                IqModels.updateEntry(uid, serverId, iq).then(result => {
                                    console.log('I just updated', result);
                                    resolve(result);
                                });
                            } else {
                                resolve({error: `User's iq is already set to ${iq}. No changes made`});
                            }
                        } else {
                            IqModels.insertEntry(uid, serverId, iq).then(result => {
                                console.log('I just inserted', result);
                                resolve(result);
                            });
                        }
                    }).catch(err => reject(err));
                } else {
                    resolve({error: 'User does not have required permissions'});
                }
            }).catch(err => console.error(err));
        })
    }

    // Checks if an entry exists. Returns true if it does
    static checkEntry(uid, serverId) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
               SELECT IQ FROM iq_points WHERE user_id = $1 AND server_id = $2
            `
            , [uid, serverId]);

            makeQuery.then(result => {
                if (result.rowCount === 1) {
                    resolve(result.rows[0]);
                } else {
                    resolve(false);
                }
            }).catch(err => reject(err));
        })
    }

    static updateEntry(uid, serverId, iq) {
        return new Promise((resolve, reject) =>{

            const makeQuery = Model.performQuery(`
               UPDATE iq_points SET IQ = $1 WHERE user_id = $2 AND server_id = $3
            `
            , [iq, uid, serverId]);

            makeQuery.then(result => {
                resolve(result.rowCount === 1);
            }).catch(err => reject(err));
        });
    }

    static insertEntry(uid, serverId, iq) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
               INSERT INTO iq_points VALUES ($1, $2, $3)
            `
            , [uid, serverId, iq]);

            makeQuery.then(result => {
                resolve(result.rowCount === 1);
            }).catch(err => reject(err));
        });
    }

    static isAdmin(uid) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
                SELECT *
                    FROM admins
                    WHERE user_id = $1
            `
            , [uid]);

            makeQuery.then(result => {
                resolve(result.rowCount === 1) // Return true if user is an admin
            }).catch(err => reject(err))
        })
    }
}

module.exports = IqModels;