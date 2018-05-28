// TODO: Make return values more consistent
const { db } = require('../pgp');
const sql = require('./sql').iq;

class IqModels {
  static getIq(uid, serverId) {
    return new Promise((resolve, reject) => {
      db.oneOrNone(sql.get, [uid, serverId]).then((result) => {
        if (result) {
          resolve(result);
        } else {
          resolve({
            error: 'Given user, server pair does not exist. Set an iq for them with #setiq.'
          });
        }
      }).catch(err => reject(err));
    });
  }

  static setIq(uid, serverId, iq, adminId) {
    return new Promise((resolve, reject) => {
      db.task((t) => {
        // Check if user is an admin
        const query = `
          SELECT *
              FROM admins
              WHERE user_id = $1
        `;
        return t.oneOrNone(query, adminId)
          .then((result) => {
            if (result) {
              return t.oneOrNone(sql.get, [uid, serverId])
                .then((res) => {
                  if (res) {
                    if (res.iq !== iq) {
                      const updateQuery = `
                         UPDATE iq_points 
                         SET IQ = $1 
                         WHERE user_id = $2 
                         AND server_id = $3
                      `;
                      return t.none(updateQuery, [iq, uid, serverId]);
                    }
                    return ({
                      error: `User's iq is already set to ${iq}. No changes made`,
                    });
                  }
                  const insertQuery = `
                      INSERT INTO iq_points 
                      VALUES ($1, $2, $3)
                      RETURNING *
                  `;
                  return t.one(insertQuery, [uid, serverId, iq])
                    .then((status) => {
                      if (status.user_id === uid) {
                        return status;
                      }
                      return false;
                    });
                });
            }
            return false;
          });
      })
        .then(events => resolve(events || []))
        .catch(() => reject({ error: 'Failed to update iq.' })); // eslint-disable-line prefer-promise-reject-errors
    });
  }

  static adjustIq(uid, serverId, type, triggerUser, reason) {
    return new Promise((resolve, reject) => {
      db.task((t) => { // eslint-disable-line arrow-body-style
        return t.oneOrNone(sql.get, [uid, serverId])
          .then((result) => {
            if (result) {
              const updateQuery = `
                  UPDATE iq_points
                  SET IQ = IQ ${type === 1 ? '+' : '-'} 1
                  WHERE user_id = $1 AND server_id = $2
              `;

              return t.none(updateQuery, [uid, serverId])
                .then(() => {
                  const insertQuery = `
                      INSERT INTO iq_points_alterations
                      (target_user, trigger_user, server_id, change_type, reason)
                      VALUES
                      ($1, $2, $3, $4, $5)
                      RETURNING *
                  `;
                  const params = [uid, triggerUser, serverId, type, reason];
                  return t.one(insertQuery, params)
                    .then(res => res);
                });
            }
            return false;
          });
      })
        .then(events => resolve(events))
        .catch(err => reject({ error: err })); // eslint-disable-line prefer-promise-reject-errors
    });
  }
}

module.exports = IqModels;
