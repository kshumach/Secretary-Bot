'use strict';

const Actions = require('./actions');
const Discord = require('discord.js');
const Requests = require('./requests');
const { RegexList} = require('../constants/regexList');
const Token = process.env.DEVELOPMENT === 'prod' ? process.env.BOT_TOKEN_MAIN : process.env.BOT_TOKEN_TEST;

const client = new Discord.Client();
const botId = process.env.DEVELOPMENT === 'prod' ? process.env.BOT_ID_MAIN : process.env.BOT_ID_TEST;

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    // Check to see if message author is not the bot
    if(message.author.id === botId && message.content.split(' ')[0] === '#iq') {
        Actions.handleIqPoints(message, botId);
    }
    if(message.author.id !== botId){
        if(message.mentions.users.exists('id', botId)) {
            Actions.handleMention(message);
        } else if(message.mentions.roles.exists('name', 'Test') || message.mentions.roles.exists('name', 'Mr. CEO')) {
            Actions.handleCeoMention(message);
        } else {
            Actions.handleStandardMessage(message, botId);
        }
    }
    if(RegexList.emojiRegex.test(message.content)) {
        Actions.handleEmojis(message);
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    const emoji = Array.of(reaction.emoji.toString());
    if(RegexList.emojiRegex.test(emoji)) {  // Only track custom emojis
        Actions.handleReactions(emoji, user.id, reaction.message);
    }
});

client.login(Token);