'use strict';

const { db } = require('../pgp');

let connection;

class Model {
    static performQuery(query, params){
        return new Promise((resolve, reject) => {
            if (!query || query.length === 0) {
                return (new Error('No db query provided'));
            }

            db.connect()
                .then(obj => {
                    // obj.client = new connected Client object;

                    connection = obj; // save the connection object;

                    return connection.any(query, params);
                })
                .then(data => {
                    if (connection) {
                        connection.done();
                    }
                    resolve(data);
                })
                .catch(e => {
                    if (connection) {
                        connection.done();
                    }
                    console.error(e);
                    reject(e);
                })
        });
    }
}

module.exports = Model;