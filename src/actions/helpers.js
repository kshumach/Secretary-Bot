const { RegexList } = require('../../constants/regexList');

const extractFromMessage = (messageContent) => {
  const mention = messageContent.match(RegexList.userMentionRegex);
  const adjustment = messageContent.match(RegexList.iqChangeRegex);
  const helpRegex = /--help/;
  const help = helpRegex.test(messageContent);
  return { mention, adjustment: adjustment || [], help };
};

const checkIqMessageValidity = (mention, adjustment, help) => {
  if (help) {
    return '#iq help. Specify the user to adjust iq for, followed by the type of change '
      + '(-- or ++) and a reason (optional). For example #iq [user mention] -- [reason]';
  }
  if (!mention && !adjustment) {
    return 'Expecting several arguments but got none or not enough. Type #iq --help for more info.';
  }
  if (!mention) {
    return 'Invalid format on user. Expecting a mention of the user to adjust iq points for';
  }
  if (!adjustment) {
    return 'Invalid format on type of change. Expecting input in the form [user mention] [-- or ++]';
  }
  if (mention && mention.length > 1) {
    return 'Can only change the iq of one user at a time.';
  }
  return false;
};

module.exports = {
  extractFromMessage,
  checkIqMessageValidity,
};
