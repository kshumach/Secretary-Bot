const EmojiActions = require('./emojiActions');
const IqActions = require('./iqActions');
const VoteActions = require('./voteActions');
const RegexList = require('../../constants/regexList');

const actions = {
  // General functionality
  handleMention(message) {
    const userList = message.guild.roles.find('name', 'Mr. CEO').members || [];
    const users = userList.map(item => item.user.id) || -1;
    if (message.author.id !== users[0] && message.content.split(' ')[0] === '#getiq') {
      this.getIq(message);
    } else if (message.author.id !== users[0] && message.content.split(' ')[0] !== '#iq') {
      message.reply(`Please do not speak directly to me you ${'<:pleb:237058273054818306>'}.`
        + 'See available commands by typing #help.');
    } else if (message.author.id !== users[0] && message.content.split(' ')[0] === '#iq') {
      const reply = `#iq ${message.author} --9001 For being a ${'<:pleb:237058273054818306>'}`;
      message.reply('You dare adjust a supreme being\'s iq? It is infinite. You must be punished for such behavior')
        .then(msg => msg.channel.send(reply));
    } else if (message.author.id === users[0] && message.content.split(' ')[0] !== '#iq') {
      message.reply('What have I done to anger you my lord? I am truly sorry for my incompetence');
    } else {
      message.reply('How may I serve you my lord?');
    }
  },
  handleCeoMention(message) {
    const userList = message.guild.roles.find('name', 'Mr. CEO').members;
    const users = userList.map(item => item.user.id);

    // currently take the first users as there should only be one anyway.
    // Pulls all users listed under the role anyway in case of changes later.
    // TODO: Figure out what you want to do here
    if (users[0]) { // If there is at least one user
      message.reply(`Mr. CEO, <@${users[0]}> is currently taking appointments.`
        + 'If you would like to schedule one, please type #book, or type #sched to see the current schedule.')
        .catch(console.error);
    } else {
      message.reply('Server currently does not have a CEO. Looks like i\'m unemployed.')
        .catch(console.error);
    }
  },
  displayHelp(message) {
    const help = 'Available commands:\n#help\n#sched\n#book\n#iq\n#setiq\n#getiq\n#iqvote\n#report\n\n'
      + 'For specific command help, type in a command with no arguments.';
    message.channel.send(help);
  },
  displayCurrentSchedule(message) {
    const reply = 'Feature not available in free version.';
    message.channel.send(reply);
  },
  displayBookAppointmentHelp(message) {
    const reply = 'To book an appointment, please type #book followed by the day and time, separated by spaces.'
      + 'For example, #book sun 12-2';
    message.channel.send(reply);
  },
  bookAppointments(message) {
    if (!message.content.split(' ')[1]) {
      this.displayBookAppointmentHelp(message);
    }
  },
  deleteMessages(message) {
    const amount = message.content.split(' ')[1];
    const now = new Date();
    // Delete the messages
    message.channel.bulkDelete(parseInt(amount, 10) + 1)
      .then(() => console.log(`${message.author.username} requested that ${amount} messages be deleted on ${now}`))
      .catch((err) => {
        if (RegexList.errorMessageRegex.test(err.message)) {
          message.channel.send('Provided too few or too many messages to delete.'
            + 'Must provide at least 2 and at most 100 messages to delete')
            .catch(console.error);
        } else {
          console.error(err);
        }
      });

    // Send notification message that deletes itself after the specified timeout

    const TIMEOUT = 2000;
    message.channel.send(`Deleted the last ${amount} messages.`)
      .then(msg => msg.delete(TIMEOUT))
      .catch(console.error);
  },
  // IQ
  setIq: (message) => {
    IqActions.setIq(message);
  },
  getIq: (message) => {
    IqActions.getIq(message);
  },
  handleVote: (message) => {
    VoteActions.handleVote(message);
  },
  getEmojiUsageReport: (message) => {
    EmojiActions.getEmojiUsageReport(message);
  },
  handleIqPoints: (message, botId) => {
    IqActions.handleIqPoints(message, botId);
  },
  handleEmojis: (message, isDm) => {
    EmojiActions.handleEmojis(message, isDm);
  },
  handleReactions: (emoji, userId, message, isDM) => {
    EmojiActions.handleReactions(emoji, userId, message, isDM);
  },
  handleStandardMessage(message, botId, isDM) {
    const actionId = message.content.split(' ')[0];
    if (isDM && !(actionId === '#help')) return;
    switch (actionId) {
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
  },
};

module.exports = actions;
