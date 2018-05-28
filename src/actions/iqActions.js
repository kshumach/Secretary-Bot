const IqRoutes = require('../../routes/iq');
const { extractFromMessage, checkIqMessageValidity } = require('./helpers');
const { RegexList } = require('../../constants/regexList');

const iqActions = {
  handleIqPoints(message, botId) {
    const extractedItems = extractFromMessage(message.content);
    const { mention, adjustment, help } = extractedItems;
    const errorMessage = checkIqMessageValidity(mention, adjustment, help);
    if (errorMessage) {
      message.reply(errorMessage);
      return;
    }
    const reasonTextArray = message.content.match(RegexList.textRegex);
    const targetUser = mention[0].indexOf('!') === -1 ?
      mention[0].slice(2, mention[0].length - 1)
      : mention[0].slice(3, mention[0].length - 1);
    if (targetUser === botId) return;
    const changeType = adjustment[0] === '--' ? 0 : 1;
    const reason = reasonTextArray ? reasonTextArray.join('') : '';
    if (targetUser === message.author.id && changeType === 1) {
      const punishMessage = `#iq ${message.author} -- For trying to give themselves iq.`;
      message.reply(`You can't give yourself iq you ${'<:pleb:237058273054818306>'}.`)
        .then(msg => msg.channel.send(punishMessage));
      return;
    }


    IqRoutes.adjustIq(targetUser, message.guild.id, changeType, message.author.id, reason).then((result) => {
      if ('error' in result) {
        message.channel.send(result.error);
      } else {
        console.log(`${message.author.id} ${changeType === 0 ? 'deducted' : 'gave'} ${targetUser} iq on ${new Date()} `
          + `in server: ${message.guild.id}.`, reason);
        message
          .channel
          .send(`${message.guild.members.get(targetUser).user.username} has ${changeType === 0 ? 'lost' : 'gained'} iq`
            + `${reason ? ` ${reason}` : ' for no real reason other than the fact that '
              + `${message.author.username} ${changeType === 0 ? 'hates' : 'loves'} you`}`);
      }
    });
  },
  setIq(message) {
    const contents = message.content.split(' ');
    const errorMessage = this.checkSetIqValidity(contents);
    if (errorMessage) {
      message.reply(errorMessage);
      return;
    }

    const targetUser = contents[1].indexOf('!') === -1 ?
      contents[1].slice(2, contents[1].length - 1)
      : contents[1].slice(3, contents[1].length - 1);
    const iq = contents[2];

    const successMessage = `Set ${contents[1]} iq to ${iq}.`;

    IqRoutes.setUserIq(targetUser, message.guild.id, iq, message.author.id)
      .then((result) => {
        if ('error' in result) {
          message.channel.send(result.error);
        } else {
          message.channel.send(successMessage);
        }
      }).catch(error => console.error(error));
  },
  getIq(message) {
    const contents = message.content.split(' ');
    const errorMessage = this.checkGetIqValidity(contents);
    if (errorMessage) {
      message.reply(errorMessage);
      return;
    }

    const user = contents[1].indexOf('!') === -1 ?
      contents[1].slice(2, contents[1].length - 1)
      : contents[1].slice(3, contents[1].length - 1);

    IqRoutes.getUserIq(user, message.guild.id).then((result) => {
      if ('error' in result) {
        message.channel.send(result.error);
      } else {
        message.channel.send(`${contents[1]} iq is currently ${result.iq}`);
      }
    }).catch(err => console.error(err));
  },
  checkGetIqValidity(messageContents) {
    if (messageContents.length === 1) {
      return 'Expecting at least 1 argument but got none. Type #getiq --help for info.';
    }
    if (messageContents.length > 1 && messageContents[1] === '--help') {
      return 'Type #getiq [user mention] to get the mentioned user\'s current iq.'
    }
    return false;
  },
  checkSetIqValidity(messageContents) {
    if (messageContents.length === 1) {
      return 'Expecting at least 2 arguments but got none. Type #setiq --help for info.';
    }
    if (messageContents.length > 1 && messageContents[1] === '--help') {
      return 'Type #getiq [user mention] [iq value] to set the mentioned user\'s iq to the '
        + 'specified value.\nNote: triggering user must be an admin.';
    }
    if (!(messageContents.length > 1
        && RegexList.userMentionRegex.test(messageContents[1])
        && RegexList.valueRegex.test(messageContents[2]))) {
      return 'Invalid form. Type #setiq --help for info.';
    }

    return false;
  },
};

module.exports = iqActions;
