'use strict';

const IqRoutes = require('../routes/iq');
const EmojiRoutes = require('../routes/emoji');
const { RegexList} = require('../constants/regexList');
const Tock = require('tocktimer');

class Actions {
    constructor() {
        this.voteInProgress = false;
        this.voteResults = {};
        this.voteTimer = null;
    }
    // CEO methods
    handleMention(message) {
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

    handleCeoMention(message) {
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

    displayHelp(message) {
        let help = "Available commands:\n#help\n#sched\n#book\n#iq\n#setiq\n#getiq\n#iqvote\n\nFor specific command help, type in a command with no arguments.";
        message.channel.send(help);
    }

    displayCurrentSchedule(message) {
        let reply = "Feature not available in free version.";
        message.channel.send(reply);
    }

    displayBookAppointmentHelp(message) {
        let reply = "To book an appointment, please type #book followed by the day and time, separated by spaces. For example, #book sun 12-2";
        message.channel.send(reply);
    }

    bookAppointments(message) {
        if(!message.content.split(' ')[1]) {
            this.displayBookAppointmentHelp(message);
        }
    }

    // General Functionality
    deleteMessages(message) {
        let amount = message.content.split(' ')[1];
        // Delete the messages
        message.channel.bulkDelete(parseInt(amount) + 1)
            .then(() => console.log(`${message.author.username} requested that ${amount} messages be deleted on ${new Date()}`))
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

    extractFromMessage(messageContent) {
        const mention = messageContent.match(RegexList.userMentionRegex);
        const adjustment = messageContent.match(RegexList.iqChangeRegex);
        const helpRegex = /--help/;
        const help = helpRegex.test(messageContent);
        return { mention, adjustment, help };
    }

    handleIqPoints(message, botId) {
        const extractedItems = this.extractFromMessage(message.content);
        const { mention, adjustment, help } = extractedItems;
        const errorMessage = this.checkIqMessageValidity(mention, adjustment, help);
        if(errorMessage) {
            message.reply(errorMessage);
            return;
        }
        const reasonTextArray = message.content.match(RegexList.textRegex);
        const targetUser = mention[0].indexOf('!') === -1 ?
            mention[0].slice(2, mention[0].length-1)
            : mention[0].slice(3, mention[0].length-1);
        if(targetUser === botId) return;
        const changeType = adjustment[0] === '--' ? 0 : 1;
        const reason = reasonTextArray ? reasonTextArray.join('') : '';
        if(targetUser === message.author.id && changeType === 1) {
            const punishMessage = `#iq ${message.author} -- For trying to give themselves iq.`;
            message.reply(`You can't give yourself iq you ${'<:pleb:237058273054818306>'}.`)
                .then(msg => msg.channel.send(punishMessage));
            return;
        }


        IqRoutes.adjustIq(targetUser, message.guild.id, changeType, message.author.id, reason).then(result => {
            if ('error' in result) {
                message.channel.send(result.error);
            } else {
                console.log(`${message.author.id} ${changeType === 0 ? 'deducted' : 'gave'} ${targetUser} iq on ${new Date()} in server: ${message.guild.id}.`, reason);
                message.channel.send(
                    `${message.guild.members.get(targetUser).user.username} has ${changeType === 0 ? `lost`: `gained`} iq`
                    + `${reason ? ` ${reason}` : ` for no real reason other than the fact that ${message.author.username} ${changeType === 0 ? 'hates' : 'loves'} you`}`);
            }
        });
    }

    checkIqMessageValidity(mention, adjustment, help) {
        if(help) {
            return `#iq help. Specify the user to adjust iq for, followed by the type of change (-- or ++) and a reason (optional). For example #iq [user mention] -- [reason]`;
        }
        if(!mention && !adjustment) {
            return `Expecting several arguments but got none or not enough. Type #iq --help for more info.`
        }
        if(!mention) {
            return 'Invalid format on user. Expecting a mention of the user to adjust iq points for';
        }
        if(!adjustment) {
            return 'Invalid format on type of change. Expecting input in the form [user mention] [-- or ++]';
        }
        if(mention && mention.length > 1) {
            return 'Can only change the iq of one user at a time.';
        }
        return false;
    }

    setIq(message) {
        const contents = message.content.split(' ');
        const errorMessage = this.checkSetIqValidity(contents);
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

    checkSetIqValidity(messageContents) {
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

    getIq(message) {
        const contents = message.content.split(' ');
        const errorMessage = this.checkGetIqValidity(contents);
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

    checkGetIqValidity(messageContents) {
        if (messageContents.length === 1) {
            return 'Expecting at least 1 argument but got none. Type #getiq --help for info.';
        }
        if (messageContents.length > 1 && messageContents[1] === '--help') {
            return 'Type #getiq [user mention] to get the mentioned user\'s current iq.'
        }
        return false;
    }

    handleEmojis(message, isDM) {
        if(isDM) return;
        const emojis = message.content.match(RegexList.emojiRegex);
        EmojiRoutes.checkEmoji(emojis, message.guild.id).then(result => {
            if(result.exists) {
                return EmojiRoutes.updateEmoji(emojis, message.guild.id).then(result => {
                    return !('error' in result);
                }).catch(error => message.channel.send(error));
            } else {
                return EmojiRoutes.addEmoji(emojis, message.guild.id).then(result => {
                    return !('error' in result);
                }).catch(error => message.channel.send(error));
            }
        }).then((result) => {
            if(result) {
                EmojiRoutes.updateUserEmojiUsage(emojis, message.guild.id, message.author.id)
                    .catch(error => message.channel.send(error));
            }
        }).catch(error => console.error(error))
    }

    handleReactions(emoji, userId, message, isDM) {
        if(isDM) return;
        EmojiRoutes.checkEmoji(emoji, message.guild.id).then(result => {
            if(result.exists) {
                return EmojiRoutes.updateEmoji(emoji, message.guild.id).then(result => {
                    return !('error' in result);
                }).catch(error => message.channel.send(error));
            } else {
                return EmojiRoutes.addEmoji(emoji, message.guild.id).then(result => {
                    return !('error' in result);
                }).catch(error => message.channel.send(error));
            }
        }).then((result) => {
            if(result) {
                EmojiRoutes.updateUserEmojiUsage(emoji, message.guild.id, userId)
                    .catch(error => message.channel.send(error));
            }
        }).catch(error => console.error(error))
    }

    handleVote(message) {
        const messageContents = message.content.split(',');
        if(/--help/.test(message.content)) {
            const helpText = `To register a vote type #iqvote followed by [+1/yes] for yes or [-1/no] for no\n\n`
                + `You can change your vote as much as you like before time runs out\n\nTo create a vote, type #iqvote `
                + `[vote topic], [what to execute once the vote ends on a 'yes'], [duration::optional::default=30s::max=300s]\n\n`
                + `For example, #iqvote Does selim deserve an iq loss?, #iq -- @person, 120.\nNOTE: `
                + `commas are important!\nTo see how much time is left in the vote type #iqvote --time`;
            message.channel.send(helpText);
            return;
        }
        if(/--time/.test(message.content)) {
            if(this.voteInProgress && this.voteTimer) {
                message.channel.send(`Time remaining: ${Math.ceil(this.voteTimer.lap() / 1000)}s`);
                return;
            }
            message.channel.send(`No ongoing vote. Start one with #iqvote.`);
            return;
        }
        if(RegexList.voteRegexYes.test(message.content)) {
            if(this.voteTimer && this.voteInProgress) {
                this.voteResults[`${message.guild.id}`][`${message.author.id}`] = 'yes';
                message.reply('Noted.');
                return;
            }
            message.channel.send('No vote in progress.');
            return;
        }

        if(RegexList.voteRegexNo.test(message.content)) {
            if(this.voteTimer && this.voteInProgress) {
                this.voteResults[`${message.guild.id}`][`${message.author.id}`] = 'no';
                message.reply('Noted.');
                return;
            }
            message.channel.send('No vote in progress.');
            return;
        }

        const errorMessage = this.handleVoteErrors(messageContents, message);
        if(errorMessage) {
            message.channel.send(errorMessage);
            return;
        }
        const context = messageContents[0].slice(7).trim();
        const voteFinishExecution = messageContents[1].trim();
        const duration = messageContents[2] && messageContents[2].trim() <= 300 && messageContents[2].trim() >= 30 ? messageContents[2].trim() : 30;
        this.voteResults[message.guild.id] = {};
        this.createVote(message, context, voteFinishExecution, duration);
    }

    createVote(message, context, execution, duration) {
        const notify = `@here, ${message.author.username} has started a vote. Key in your vote with a #iqvote [vote].\n`
            + `For help on voting options type #iqvote --help`;
        this.voteInProgress = true;
        this.voteTimer = new Tock({
            countdown: true,
            complete: this.endVote.bind(this, message, context, execution)
        });

        const notifierTimer = new Tock({
            countdown: true,
            complete: this.voteEndingNotify.bind(this, message)
        });
        message.channel.send(notify).then(() => {
            message.channel.send(context);
        }).then(() => {
            this.voteTimer.start(duration * 1000);
            notifierTimer.start((duration - 10) * 1000);
        }).catch(err => console.error(err));
    }

    voteEndingNotify(message) {
        message.channel.send(`10s left! Key in your votes now!`);
    }

    endVote(message, topic, execution) {
        const notification = `@here, Voting has ended.\n${topic}`;
        // Get the votes by server id
        const serverVoters = this.voteResults[`${message.guild.id}`];
        const yesVotes = Object.keys(serverVoters).filter((item) => {
            return serverVoters[item] === 'yes';
        }).length;
        const noVotes = Object.keys(this.voteResults[`${message.guild.id}`]).filter((item) => {
            return serverVoters[item] === 'no';
        }).length;
        const result = ((yesVotes > noVotes) && (yesVotes + noVotes >= 2)) ? 1 : 0;
        const announce = `Results:\nYes: ${yesVotes}\nNo: ${noVotes}`;
        message.channel.send(notification).then(() => {
            message.channel.send(announce);
        }).then(() => {
            if(result === 1) {
                message.channel.send(execution);
                return;
            }
            message.channel.send('Majority vote was no or there was not enough of votes. (Minimum 2)');
        });
        this.resetVoteVariables();
    }

    resetVoteVariables() {
        this.voteInProgress = false;
        this.voteTimer = null;
        this.voteResults = {};
    }

    handleVoteErrors(messageContents, message) {
        if (messageContents.length < 2) {
            return `Not enough arguments provided or you forgot commas you <:pleb:237058273054818306>.`
            + `Type #iqvote --help for more info.`
        }
        const extractedItems = this.extractFromMessage(messageContents[1].trim());
        const { mention, adjustment, help } = extractedItems;
        const targetUserId = mention[0].indexOf('!') === -1 ?
            mention[0].slice(2, mention[0].length-1)
            : mention[0].slice(3, mention[0].length-1);
        const changeType = adjustment[0] === '--' ? 0 : 1;
        if(targetUserId === message.author.id && changeType === 1) {
            return `Cannot start a vote where the vote creator is trying to give themselves iq on a success.`;
        }
        const executionErrors = this.checkIqMessageValidity(mention, adjustment, help);
        if(executionErrors) {
            return executionErrors;
        }
        if(messageContents[2] && !(parseInt(messageContents[2].trim()) / Math.ceil(messageContents[2]) === 1)) {
            return `Incorrect syntax on supplied duration. Duration must be an Integer. i.e. 1, 25, 36 etc.`
        }
        return false;
    }
    getEmojiUsageReport(message) {
        const emojiNameRegex = /:[a-zA-Z0-9]+:/g;
        EmojiRoutes.getEmojiUsageReport(message.guild.id).then(emojisList => {
            const serverEmojiList = message.client.emojis.map(item => item.name);
            // Filter the emoji list by whats currently on the server
            console.log('mapped', serverEmojiList);
            const reportEmojisList = emojisList.filter(obj => {
                const parsedName = obj.emoji.match(emojiNameRegex)[0].split(':')[1];
                return serverEmojiList.indexOf(parsedName) !== -1
            });
            const reportMessage = reportEmojisList.map(obj => {
                return `${obj.emoji}: ${obj.usage_count}`
            }).join(', ');
            console.log(reportMessage);
            message.channel.send(`Emoji Usage: ${reportMessage}`).then(() => {
                message.channel.send('End Report'); // Need to send some message otherwise the next message cant parse emojis
            }).catch(err => console.error(err));
        }).catch(error => console.error(error));
    }

    handleStandardMessage(message, botId, isDM) {
        const actionId = message.content.split(' ')[0];
        if(isDM && !(actionId === '#help')) return;
        switch(actionId) {
            case '#help':
                this.displayHelp(message);
                break;
            case '#sched':
                this.displayCurrentSchedule(message);
                break;
            case '#book':
                this.bookAppointments(message);
                break;
            case '#delete':
                this.deleteMessages(message);
                break;
            case '#iq':
                this.handleIqPoints(message, botId);
                break;
            case '#setiq':
                this.setIq(message);
                break;
            case '#getiq':
                this.getIq(message);
                break;
            case '#iqvote':
                this.handleVote(message);
                break;
            case '#report':
                this.getEmojiUsageReport(message);
                break;
            default:
                break;
        }
    }
}

module.exports = Actions;
