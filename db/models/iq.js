'use strict';

/*
    STANDARDS:
        - Return {} always whenever something fails/returns an empty set
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
                    resolve({error: 'Given user, server pair does not exist. Set an iq for them with #setiq.'})
                } else {
                    resolve(result.rows[0]);
                }
            }).catch(err => reject(err))
        })
    }

    static setIq(uid, serverId, iq, adminId) {
        return new Promise((resolve, reject) => {

            IqModels.isAdmin(adminId).then(isAdmin => {
                if (isAdmin) {
                    IqModels.checkEntry(uid, serverId).then(result => {
                        if (result.exists) {
                            if (result.iq !== iq) {
                                IqModels.updateEntry(uid, serverId, iq).then(result => {
                                    resolve(result);
                                });
                            } else {
                                resolve({error: `User's iq is already set to ${iq}. No changes made`});
                            }
                        } else {
                            IqModels.insertEntry(uid, serverId, iq).then(result => {
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

    static setIqWithoutChecks(uid, serverId, type) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
                UPDATE iq_points
                    SET IQ = IQ ${type === 1 ? '+' : '-'} 1
                    WHERE user_id = $1 AND server_id = $2
            `
            , [uid, serverId]);

            makeQuery.then(result => {
                if (result.rowCount === 1) {
                    resolve(result);
                } else {
                    resolve({error: 'Could not update iq'});
                }
            }).catch(err => reject(err));
        })
    }

    static adjustIq(uid, serverId, type, triggerUser, reason) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
                INSERT INTO iq_points_alterations 
                    (target_user, trigger_user, server_id, change_type, reason)
                    VALUES
                    ($1, $2, $3, $4, $5)
            `
            , [uid, triggerUser, serverId, type, reason]);

            IqModels.checkEntry(uid, serverId).then(result => {
                if (result.exists) {
                    IqModels.setIqWithoutChecks(uid, serverId, type).then(result => {
                        if ('error' in result) {
                            resolve(result);
                        } else {
                            makeQuery.then(result => {
                                if (result.rowCount === 1) {
                                    resolve(result);
                                } else {
                                    resolve({error: 'Could not make record'});
                                }
                            }).catch(err => reject(err));
                        }
                    }).catch(err => reject(err));
                }
            })
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
                    resolve({ exists: true, iq: result.rows[0].iq });
                } else {
                    resolve({ exists: false })
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
                if (result.rowCount === 1) {
                    resolve({updated: true})
                } else {
                    resolve({})
                }
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
                if (result.rowCount === 1) {
                    resolve({inserted: true})
                } else {
                    resolve({})
                }
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