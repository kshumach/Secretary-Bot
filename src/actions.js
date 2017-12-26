'use strict';

const IqRoutes = require('../routes/iq');
const EmojiRoutes = require('../routes/emoji');
const { RegexList} = require('../constants/regexList');

class Actions {

    // CEO methods
    static handleMention(message) {
        let userList = message.guild.roles.find('name', 'Mr. CEO') ? message.guild.roles.find('name', 'Mr. CEO').members : [];
        let users = userList.map(item => item.user.id) || -1;

        if(message.author.id !== users[0] && message.content.split(' ')[0] !== '#iq'){
            message.reply(`Please do not speak directly to me you ${'<:pleb:237058273054818306>'}. See available commands by typing #help.`);
        } else if(message.author.id !== users[0] && message.content.split(' ')[0] === '#iq') {
            const reply = `#iq ${message.author} --9001 For being a ${'<:pleb:237058273054818306>'}.`;
            message.reply(`You dare adjust a supreme being's iq? It is infinite. You must be punished for such behavior`)
                .then(msg => msg.channel.send(reply));
        } else if (message.author.id === users[0] && message.content.split(' ')[0] !== '#iq') {
            message.reply(`What have I done to anger you my lord? I am truly sorry for my incompetence`)
        } else {
            message.reply("How may I serve you my lord?");
        }
    }

    static handleCeoMention(message) {
        let userList = message.guild.roles.find('name', 'Mr. CEO').members;
        let users = userList.map(item => item.user.id);

        // currently take the first users as there should only be one anyway. Pulls all users listed under the role anyway in case of changes later.
        // TODO: Figure out what you want to do here
        users[0] ?
            message.reply(`Mr. CEO, <@${users[0]}> is currently taking appointments. If you would like to schedule one, please type #book, or type #sched to see the current schedule.`)
                .catch(console.error)
            : message.reply('Server currently does not have a CEO. Looks like i\'m unemployed.')
                .catch(console.error);
    }

    static displayHelp(message) {
        let help = "Available commands:\n#help\n#sched\n#book\n#iq\n#setiq\n#getiq\n\nFor specific command help, type in a command with no arguments.";
        message.channel.send(help);
    }

    static displayCurrentSchedule(message) {
        let reply = "Feature not available in free version.";
        message.channel.send(reply);
    }

    static displayBookAppointmentHelp(message) {
        let reply = "To book an appointment, please type #book followed by the day and time, separated by spaces. For example, #book sun 12-2";
        message.channel.send(reply);
    }

    static bookAppointments(message) {
        if(!message.content.split(' ')[1]) {
            Actions.displayBookAppointmentHelp(message);
        }
    }

    // General Functionality
    static deleteMessages(message) {
        let amount = message.content.split(' ')[1];
        // Delete the messages
        message.channel.bulkDelete(parseInt(amount) + 1)
            .then(msg => console.log(`${message.author.username} requested that ${amount} messages be deleted on ${new Date()}`))
            .catch(err => {
                if(RegexList.errorMessageRegex.test(err.message)) {
                    message.channel.send("Provided too few or too many messages to delete. Must provide at least 2 and at most 100 messages to delete")
                        .catch(console.error);
                } else {
                    console.error(err);
                }
            });

        // Send notification message that deletes itself after the specified timeout

        const TIMEOUT = 1000;
        message.channel.send(`Deleted the last ${amount} messages.`)
            .then(msg => msg.delete(TIMEOUT))
            .catch(console.error);
    }

    static handleIqPoints(message) {
        console.log('MESSAGE', message.content);
        const contents = message.content.split(' ');
        const errorMessage = Actions.checkIqMessageValidity(contents);
        if(errorMessage) {
            message.reply(errorMessage);
            return;
        }
        const targetUser = contents[1].indexOf('!') === -1 ?
            contents[1].slice(2, contents[1].length-1)
            : contents[1].slice(3, contents[1].length-1);
        if(targetUser === '328946580633812993') return;
        const changeType = contents[2].slice(0,2) === '--' ? 0 : 1;
        // Set amount to 10 if it's over or 1 if no amount was specified.
        const amount = (parseInt(contents[2].slice(2)) > 1 ? 1 : parseInt(contents[2].slice(2))) || 1;
        if(parseInt(contents[2].slice(2)) > 10) {
            message.reply(`Maximum iq change is 1 point. Making iq changes with 1 point instead of ${parseInt(contents[2].slice(2))}`)
        }
        const reason = contents[3] ? contents.filter((item) => { return contents.indexOf(item) > 2 }).join(' ') : 'No reason given.';
        if(targetUser === message.author.id && changeType === 1) {
            const punishMessage = `#iq ${message.author} --${amount} For trying to give themselves iq.`;
            message.reply(`You can't give yourself iq you ${'<:pleb:237058273054818306>'}.`)
                .then(msg => msg.channel.send(punishMessage));
            return;
        }


        IqRoutes.adjustIq(targetUser, message.guild.id, changeType, message.author.id, reason).then(result => {
            if ('error' in result) {
                message.channel.send(result.error);
            } else {
                console.log(`${message.author.id} ${changeType === 0 ? 'deducted' : 'gave'} ${targetUser} ${amount} iq on ${new Date()} in server: ${message.guild.id}.`, reason);
                message.channel.send(
                    `${message.guild.members.get(targetUser).user.username} has ${changeType === 0 ? `lost ${amount}`: `gained ${amount}`} iq `
                    + `${reason ? `${reason}` : `for no real reason other than the fact that <@${message.author.username}> ${changeType === 0 ? 'hates' : 'loves'} you`}`);
            }
        });
    }

    static checkIqMessageValidity(messageContents) {
        console.log('contents', messageContents);
        if(messageContents.length === 1) {
            return `Expecting several arguments but got none. Type #iq --help for more info.`
        }
        if(messageContents[1] && messageContents[1] === '--help') {
            return `#iq help. Specify the user to adjust iq for, followed by the amount to subtract or give (-- or ++) and a reason (optional). For example #iq [user mention] --5 [reason]`;
        }
        if(!(messageContents[1] && RegexList.userMentionRegex.test(messageContents[1]))) {
            return 'Invalid format on user. Expecting a mention of the user to adjust iq points for';
        }
        if(!(messageContents[2] && RegexList.iqChangeRegex.test(messageContents[2]))) {
            return 'Invalid format on number of points to deduct/give. Expecting input in the form --[amount] or ++[amount] where amount is a number';
        }
        return false;
    }

    static setIq(message) {
        const contents = message.content.split(' ');
        const errorMessage = Actions.checkSetIqValidity(contents);
        if(errorMessage) {
            message.reply(errorMessage);
            return;
        }

        const targetUser = contents[1].indexOf('!') === -1 ?
            contents[1].slice(2, contents[1].length-1)
            : contents[1].slice(3, contents[1].length-1);
        const iq = contents[2];

        const successMessage = `Set ${contents[1]} iq to ${iq}.`;

        IqRoutes.setUserIq(targetUser, message.guild.id, iq, message.author.id)
            .then(result => {
                if('error' in result) {
                    message.channel.send(result.error);
                } else {
                    message.channel.send(successMessage);
                }
            }).catch(error => console.error(error));
    }

    static checkSetIqValidity(messageContents) {
        if (messageContents.length === 1) {
            return 'Expecting at least 2 arguments but got none. Type #setiq --help for info.';
        }
        if (messageContents.length > 1 && messageContents[1] === '--help') {
            return 'Type #getiq [user mention] [iq value] to set the mentioned user\'s iq to the specified value.\nNote: triggering user must be an admin.'
        }
        if (!(messageContents.length > 1
                && RegexList.userMentionRegex.test(messageContents[1])
                && RegexList.valueRegex.test(messageContents[2]))) {
            return 'Invalid form. Type #setiq --help for info.'
        }

        return false;
    }

    static getIq(message) {
        const contents = message.content.split(' ');
        const errorMessage = Actions.checkGetIqValidity(contents);
        if(errorMessage) {
            message.reply(errorMessage);
            return;
        }

        const user = contents[1].indexOf('!') === -1 ?
            contents[1].slice(2, contents[1].length-1)
            : contents[1].slice(3, contents[1].length-1);

        IqRoutes.getUserIq(user, message.guild.id).then(result => {
            if ('error' in result) {
                message.channel.send(result.error);
            } else {
                message.channel.send(`${contents[1]} iq is currently ${result.iq}`);
            }
        }).catch(err => console.error(err));
    }

    static checkGetIqValidity(messageContents) {
        if (messageContents.length === 1) {
            return 'Expecting at least 1 argument but got none. Type #getiq --help for info.';
        }
        if (messageContents.length > 1 && messageContents[1] === '--help') {
            return 'Type #getiq [user mention] to get the mentioned user\'s current iq.'
        }
        return false;
    }

    static handleEmojis(message) {
        const emojis = message.content.match(RegexList.emojiRegex);
        EmojiRoutes.checkEmoji(emojis, message.guild.id).then(result => {
            if(result.exists) {
                EmojiRoutes.updateEmoji(emojis, message.guild.id).then(result => {
                    return ('error' in result);
                }).catch(error => console.error(error));
            } else {
                EmojiRoutes.addEmoji(emojis, message.guild.id).then(result => {
                    return ('error' in result);
                }).catch(error => console.error(error));
            }
        }).then((result) => {
            // if(result) {
            //     EmojiRoutes.updateUserEmojiUsage(emojis, message.guild.id, message.author.id)
            //         .catch(error => console.error(error));
            // }
        }).catch(error => console.error(error))
    }

    static handleStandardMessage(message) {
        switch(message.content.split(' ')[0]) {
            case '#help':
                Actions.displayHelp(message);
                break;
            case '#sched':
                Actions.displayCurrentSchedule(message);
                break;
            case '#book':
                Actions.bookAppointments(message);
                break;
            case '#delete':
                Actions.deleteMessages(message);
                break;
            case '#iq':
                Actions.handleIqPoints(message);
                break;
            case '#setiq':
                Actions.setIq(message);
                break;
            case '#getiq':
                Actions.getIq(message);
                break;
            default:
                break;
        }
    }
}

module.exports = Actions;
