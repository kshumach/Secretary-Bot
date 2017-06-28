'use strict';

const Actions = require('../sec_bot/actions');
const Discord = require('discord.js');
const Requests = require('../sec_bot/requests');

const client = new Discord.Client();
const token = "";

let requests = '';

client.on('ready', () => {
    console.log('I am ready!');
    // Create new requests queue object
    requests = new Requests();
});

client.on('message', message => {
    // Check to see if message author is not the bot
    if(message.author !== "328946580633812993"){
        if (message.mentions.users.exists('username', 'Secretary-Bot')) {
            Actions.handleMention(message);
        } else if(message.mentions.roles.exists('name', 'Test') || message.mentions.roles.exists('name', 'Mr. CEO')) {
            Actions.handleCeoMention(message);
        } else {
            switch(message.content) {
                case '#help':
                    return Actions.displayHelp(message);
                case '#sched':
                    return Actions.displayCurrentSchedule(message);
                case '#book':
                    return Actions.displayBookAppointmentHelp(message);
                default:
                    return;
            }
        }
    }
});

client.login(token);