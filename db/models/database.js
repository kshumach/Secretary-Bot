'use strict';

const pg = require('pg');
const config = require('../config');

class Model {
    constructor(){}

    static endConnection(){
        pg.end();
    }

    static performQuery(query, params){

        return new Promise(function(resolve, reject) {
            if (!query || query.length === 0) {
                return reject(new Error('No db query provided'));
            }

            let pool = new pg.Pool(config);

            pool.connect(function(err, client, done) {
                if(err) {
                    console.log('error fetching client from pool', err);
                    done();
                    return reject(err);
                }
                client.query(query, params, function(err, result) {
                    if(err){
                        console.log('error running query', err);
                        return reject(err);
                    }
                    done();
                    return resolve(result);
                });
            });

            pool.on('error', function (err, client) {
                // if an error is encountered by a client while it sits idle in the pool
                // the pool itself will emit an error event with both the error and
                // the client which emitted the original error
                // this is a rare occurrence but can happen if there is a network partition
                // between your application and the database, the database restarts, etc.
                // and so you might want to handle it and at least log it out
                console.error('idle client error', err.message, err.stack);
                done();
                this.endConnection();
            })
        });
    }
}

module.exports = Model;