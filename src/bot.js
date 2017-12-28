'use strict';

const ActionSet = require('./actions');
const Discord = require('discord.js');
const Requests = require('./requests');
const { RegexList} = require('../constants/regexList');
const Token = process.env.DEVELOPMENT === 'prod' ? process.env.BOT_TOKEN_MAIN : process.env.BOT_TOKEN_TEST;

const client = new Discord.Client();
const botId = process.env.DEVELOPMENT === 'prod' ? process.env.BOT_ID_MAIN : process.env.BOT_ID_TEST;

const Actions = new ActionSet();

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    const isDM = message.guild === null || message.guild === undefined;
    // Needed to allow the bot to make iq changes for other users
    if(message.author.id === botId && message.content.split(' ')[0] === '#iq') {
        Actions.handleIqPoints(message, botId);
    }
    // Check to see if message author is not the bot
    if(message.author.id !== botId){
        if(message.mentions.users.exists('id', botId)) {
            Actions.handleMention(message);
        } else if(message.mentions.roles.exists('name', 'Test') || message.mentions.roles.exists('name', 'Mr. CEO')) {
            Actions.handleCeoMention(message);
        } else {
            Actions.handleStandardMessage(message, botId, isDM);
        }
    }
    if(RegexList.emojiRegex.test(message.content)) {
        Actions.handleEmojis(message, isDM);
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    const isDM = reaction.message.guild === null || reaction.message.guild === undefined;
    const emoji = Array.of(reaction.emoji.toString());
    if(RegexList.emojiRegex.test(emoji)) {  // Only track custom emojis
        Actions.handleReactions(emoji, user.id, reaction.message, isDM);
    }
});

client.login(Token);