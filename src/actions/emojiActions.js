const { RegexList } = require('../../constants/regexList');
const EmojiRoutes = require('../../routes/emoji');

const emojiActions = {
  getEmojiUsageReport(message) {
    EmojiRoutes.getEmojiUsageReport(message.guild.id).then((emojisList) => {
      const serverEmojiList = message.client.emojis.map(item => item.name);
      // Filter the emoji list by whats currently on the server
      const reportEmojisList = emojisList.filter((obj) => {
        const parsedName = obj.emoji.match(RegexList.emojiNameRegex)[0].split(':')[1];
        return serverEmojiList.indexOf(parsedName) !== -1;
      });
      const reportMessage = reportEmojisList.map(obj => `${obj.emoji}: ${obj.usage_count}`).join(', ');
      message.channel.send(`Emoji Usage: ${reportMessage}`).then(() => {
        message.channel.send('End Report'); // Need to send some message otherwise the next message cant parse emojis
      }).catch(err => console.error(err));
    }).catch(error => console.error(error));
  },
  handleEmojis(message, isDM) {
    if (isDM) return;
    const emojis = message.content.match(RegexList.emojiRegex);
    EmojiRoutes.checkEmoji(emojis, message.guild.id).then((result) => {
      if (result.exists) {
        return EmojiRoutes.updateEmoji(emojis, message.guild.id).then(res => !('error' in res))
          .catch(error => message.channel.send(error));
      }
      return EmojiRoutes.addEmoji(emojis, message.guild.id).then(res => !('error' in res))
        .catch(error => message.channel.send(error));
    }).then((result) => {
      if (result) {
        EmojiRoutes.updateUserEmojiUsage(emojis, message.guild.id, message.author.id)
          .catch(error => message.channel.send(error));
      }
    }).catch(error => console.error(error));
  },
  handleReactions(emoji, userId, message, isDM) {
    if (isDM) return;
    EmojiRoutes.checkEmoji(emoji, message.guild.id).then((res) => {
      if (res.exists) {
        return EmojiRoutes.updateEmoji(emoji, message.guild.id).then(status => !('error' in status))
          .catch(error => message.channel.send(error));
      }
      return EmojiRoutes.addEmoji(emoji, message.guild.id).then(status => !('error' in status))
        .catch(error => message.channel.send(error));
    }).then((result) => {
      if (result) {
        EmojiRoutes.updateUserEmojiUsage(emoji, message.guild.id, userId)
          .catch(error => message.channel.send(error));
      }
    }).catch(error => console.error(error));
  },
};

module.exports = emojiActions;
