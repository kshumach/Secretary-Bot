'use strict';

const IqModels = require('../db/models/iq');

class IqActions {
    static async getUserIq(uid, serverId) {
        await IqModels.getIq(uid, serverId)
            .then(result => {
                return result
            }).catch(err => {
                console.error(err);
            })
    }

    static async setUserIq(uid, serverId, adminId) {
        await IqModels.setIq(uid, serverId, adminId)
            .then(result => {
                return result;
            }).catch(err => {
                console.error(err);
            })
    }
}

module.exports = IqActions;