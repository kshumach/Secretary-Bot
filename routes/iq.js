const IqModels = require('../db/models/iq');

class IqActions {
  static async getUserIq(uid, serverId) {
    try {
      return await IqModels.getIq(uid, serverId);
    } catch (e) {
      return console.error(e);
    }
  }

  static async setUserIq(uid, serverId, iq, adminId) {
    try {
      return await IqModels.setIq(uid, serverId, parseInt(iq, 10), adminId);
    } catch (e) {
      return console.error(e);
    }
  }

  static async adjustIq(uid, serverId, type, triggerUser, reason) {
    try {
      return await IqModels.adjustIq(uid, serverId, parseInt(type, 10), triggerUser, reason);
    } catch (e) {
      return console.error(e);
    }
  }
}

module.exports = IqActions;
