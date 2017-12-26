'use strict';

const db = require('../pgp');

class Model {
    static performQuery(query, params){
        return new Promise(function(resolve, reject) {
            if (!query || query.length === 0) {
                return reject(new Error('No db query provided'));
            }

            db.connect()
                .then(client => {
                    return client.query(query, params)
                        .then(res => {
                            client.done();
                            resolve(res)
                        })
                        .catch(e => {
                            client.done();
                            console.error(e);
                            reject(e);
                        })
                });
        });
    }
}

module.exports = Model;