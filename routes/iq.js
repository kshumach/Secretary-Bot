'use strict';

const IqModels = require('../db/models/iq');

class IqActions {
    static async getUserIq(uid, serverId) {
        try {
            return await IqModels.getIq(uid, serverId);
        } catch(e) {
            console.error(e);
        }
    }

    static async setUserIq(uid, serverId, iq, adminId) {
        try {
            return await IqModels.setIq(uid, serverId, parseInt(iq), adminId);
        } catch (e) {
            console.error(e);
        }
    }

    static async adjustIq(uid, serverId, type, triggerUser, reason) {
        try {
            return await IqModels.adjustIq(uid, serverId, parseInt(type), triggerUser, reason)
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = IqActions;