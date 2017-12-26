'use strict';
// TODO: Make return values more consistent
const Model = require('./database');

class IqModels {

    static getIq(uid, serverId) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
               SELECT IQ FROM iq_points
                    WHERE user_id = $1 AND server_id = $2
            `
                , [uid, serverId]);

            makeQuery.then(result => {
                if (result.length === 0) {
                    resolve({error: 'Given user, server pair does not exist. Set an iq for them with #setiq.'})
                } else {
                    resolve(result[0]);
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
                                }).catch(err => reject(err));
                            } else {
                                resolve({error: `User's iq is already set to ${iq}. No changes made`});
                            }
                        } else {
                            IqModels.insertEntry(uid, serverId, iq).then(result => {
                                resolve(result);
                            }).catch(err => reject(err));;
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
                if (result) {
                    resolve(result);
                }
            }).catch(err => reject({error: 'Could not update iq'}));
        })
    }

    static adjustIq(uid, serverId, type, triggerUser, reason) {
        return new Promise((resolve, reject) => {
            IqModels.checkEntry(uid, serverId).then(result => {
                if (result.exists) {
                    IqModels.setIqWithoutChecks(uid, serverId, type).then(result => {
                        if (result) {
                            const query = `
                                INSERT INTO iq_points_alterations
                                    (target_user, trigger_user, server_id, change_type, reason)
                                    VALUES
                                    ($1, $2, $3, $4, $5)
                            `;
                            const params = [uid, triggerUser, serverId, type, reason];

                            Model.performQuery(query, params).then(result => {
                                if (result) {
                                    resolve(result);
                                }
                            }).catch(err => reject({error: 'Could not make record'}));
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
                if (result.length === 1) {
                    resolve({ exists: true, iq: result[0].iq });
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
                if (result) {
                    resolve({updated: true})
                }
            }).catch(err => reject({ error: 'Failed to update iq.' }));
        });
    }

    static insertEntry(uid, serverId, iq) {
        return new Promise((resolve, reject) => {

            const makeQuery = Model.performQuery(`
               INSERT INTO iq_points VALUES ($1, $2, $3)
            `
            , [uid, serverId, iq]);

            makeQuery.then(result => {
                if (result) {
                    resolve({inserted: true})
                }
            }).catch(err => reject({ error: 'failed to insert entry.' }));
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
                resolve(result.length === 1) // Return true if user is an admin
            }).catch(err => reject(err))
        })
    }
}

module.exports = IqModels;