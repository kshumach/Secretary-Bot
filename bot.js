'use strict';

const Actions = require('../sec_bot/actions').Actions;
const Discord = require('discord.js');
const client = new Discord.Client();
const token = "";

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
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
                return Actions.bookAppointment(message);
            default:
                return;
        }
    }
});

client.login(token);