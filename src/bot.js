'use strict';

const Actions = require('./actions');
const Discord = require('discord.js');
const Requests = require('./requests');
const Token = require('../secrets/token');

const client = new Discord.Client();
const token = Token;
const botId = '328946580633812993';

let requests = '';

client.on('ready', () => {
    console.log('I am ready!');
    // Create new requests queue object
    requests = new Requests();
});

client.on('message', message => {
    // Check to see if message author is not the bot
    if(message.author.id === botId && message.content.split(' ')[0] === '#iq') {
        Actions.handleIqPoints(message);
    }
    if(message.author.id !== botId){
        if(message.mentions.users.exists('id', botId)) {
            Actions.handleMention(message);
        } else if(message.mentions.roles.exists('name', 'Test') || message.mentions.roles.exists('name', 'Mr. CEO')) {
            Actions.handleCeoMention(message);
        } else {
            Actions.handleStandardMessage(message);
        }
    }
});

client.login(token);