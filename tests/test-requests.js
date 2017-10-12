'use strict';

const { assert } = require('chai');
const Requests = require('../src/requests');

let requests = new Requests();

describe('Requests', () => {
    it('Should start empty', () => {
        assert.equal(requests.getSize(), 0);
    });

    it('Should add a new item to the request queue', () => {
        requests.add(1);
        assert.equal(requests.getSize() === 1 && requests.getRequests()[0] === 1, true);
    });

    it('Should remove the added item', () => {
        requests.remove();
        assert.equal(requests.getSize(), 0);
    });

    it('Should add an array of items', () => {
        let expected = [1,2,3,4,5].toString();
        requests.add([1,2,3,4,5]);
        assert.equal(requests.getSize() === 5 && (requests.getRequests().toString() === expected), true);
    });

    it('Should return the correct value at a given index', () => {
        assert.equal(requests.getItem(3), 4);
    });

    it('should reset to an empty array', () => {
        requests.reset();
        assert.equal(requests.getSize(), 0);
    });
});