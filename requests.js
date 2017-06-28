'use strict';

const _ = require('lodash');

class Requests {
    constructor() {
        this.requests = [];
    }

    // Remove first request in queue
    remove(){
        if(this.requests.length <= 1) {
            this.requests = [];
        }
        else {
            this.requests.splice(1);
        }
    }

    add(req) {
        if(typeof req === 'object'){
            _.forEach(req, (item) => {
                this.requests.push(item);
            })
        } else {
            this.requests.push(req);
        }
    }

    getSize() {
        return this.requests.length;
    }

    getRequests() {
        return this.requests;
    }

    getItem(index) {
        return this.requests[index];
    }

    reset() {
        this.requests = [];
    }
}

module.exports = Requests;