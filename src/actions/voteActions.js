const { RegexList } = require('../../constants/regexList');
const { extractFromMessage, checkIqMessageValidity } = require('./helpers');
const Tock = require('tocktimer');

const voteActions = {
  voteInProgress: false,
  voteResults: {},
  voteTimer: null,
  handleVote(message) {
    const messageContents = message.content.split(',');
    if (/--help/.test(message.content)) {
      const helpText = 'To register a vote type #iqvote followed by [+1/yes] for yes or [-1/no] for no\n\n'
        + 'You can change your vote as much as you like before time runs out\n\nTo create a vote, type #iqvote '
        + '[vote topic], [what to execute once the vote ends on a \'yes\'], '
        + '[duration::optional::default=30s::max=300s]\n\n'
        + 'For example, #iqvote Does selim deserve an iq loss?, #iq -- @person, 120.\nNOTE: '
        + 'commas are important!\nTo see how much time is left in the vote type #iqvote --time';
      message.channel.send(helpText);
      return;
    }
    if (/--time/.test(message.content)) {
      if (this.voteInProgress && this.voteTimer) {
        message.channel.send(`Time remaining: ${Math.ceil(this.voteTimer.lap() / 1000)}s`);
        return;
      }
      message.channel.send('No ongoing vote. Start one with #iqvote.');
      return;
    }
    if (RegexList.voteRegexYes.test(message.content)) {
      if (this.voteTimer && this.voteInProgress) {
        this.voteResults[`${message.guild.id}`][`${message.author.id}`] = 'yes';
        message.reply('Noted.');
        return;
      }
      message.channel.send('No vote in progress.');
      return;
    }

    if (RegexList.voteRegexNo.test(message.content)) {
      if (this.voteTimer && this.voteInProgress) {
        this.voteResults[`${message.guild.id}`][`${message.author.id}`] = 'no';
        message.reply('Noted.');
        return;
      }
      message.channel.send('No vote in progress.');
      return;
    }

    const errorMessage = this.handleVoteErrors(messageContents, message);
    if (errorMessage) {
      message.channel.send(errorMessage);
      return;
    }
    const context = messageContents[0].slice(7).trim();
    const voteFinishExecution = messageContents[1].trim();
    const duration = messageContents[2] && messageContents[2].trim() <= 300 && messageContents[2].trim() >= 30 ?
      messageContents[2].trim() : 30;
    this.voteResults[message.guild.id] = {};
    this.createVote(message, context, voteFinishExecution, duration);
  },
  createVote(message, context, execution, duration) {
    const notify = `@here, ${message.author.username} has started a vote. Key in your vote with a #iqvote [vote].\n`
      + 'For help on voting options type #iqvote --help';
    this.voteInProgress = true;
    this.voteTimer = new Tock({
      countdown: true,
      complete: this.endVote.bind(this, message, context, execution),
    });

    const notifierTimer = new Tock({
      countdown: true,
      complete: this.voteEndingNotify.bind(this, message),
    });
    message.channel.send(notify).then(() => {
      message.channel.send(context);
    }).then(() => {
      this.voteTimer.start(duration * 1000);
      notifierTimer.start((duration - 10) * 1000);
    }).catch(err => console.error(err));
  },
  handleVoteErrors(messageContents, message) {
    if (messageContents.length < 2) {
      return 'Not enough arguments provided or you forgot commas you <:pleb:237058273054818306>.'
        + 'Type #iqvote --help for more info.';
    }
    const extractedItems = extractFromMessage(messageContents[1].trim());
    const { mention, adjustment, help } = extractedItems;
    const targetUserId = mention[0].indexOf('!') === -1 ?
      mention[0].slice(2, mention[0].length - 1)
      : mention[0].slice(3, mention[0].length - 1);
    const changeType = adjustment[0] === '--' ? 0 : 1;
    if (targetUserId === message.author.id && changeType === 1) {
      return 'Cannot start a vote where the vote creator is trying to give themselves iq on a success.';
    }
    const executionErrors = checkIqMessageValidity(mention, adjustment, help);
    if (executionErrors) {
      return executionErrors;
    }
    if (messageContents[2] && !(parseInt(messageContents[2].trim(), 10) / Math.ceil(messageContents[2]) === 1)) {
      return 'Incorrect syntax on supplied duration. Duration must be an Integer. i.e. 1, 25, 36 etc.';
    }
    return false;
  },
  endVote(message, topic, execution) {
    const notification = `@here, Voting has ended.\n${topic}`;
    // Get the votes by server id
    const serverVoters = this.voteResults[`${message.guild.id}`];
    const yesVotes = Object.keys(serverVoters).filter(item => serverVoters[item] === 'yes').length;
    const noVotes = Object.keys(this.voteResults[`${message.guild.id}`]).filter((item) => { // eslint-disable-line arrow-body-style, max-len
      return serverVoters[item] === 'no';
    }).length;
    const result = ((yesVotes > noVotes) && (yesVotes + noVotes >= 2)) ? 1 : 0;
    const announce = `Results:\nYes: ${yesVotes}\nNo: ${noVotes}`;
    message.channel.send(notification).then(() => {
      message.channel.send(announce);
    }).then(() => {
      if (result === 1) {
        message.channel.send(execution);
        return;
      }
      message.channel.send('Majority vote was no or there was not enough of votes. (Minimum 2)');
    });
    this.resetVoteVariables();
  },
  voteEndingNotify(message) {
    message.channel.send('10s left! Key in your votes now!');
  },
  resetVoteVariables() {
    this.voteInProgress = false;
    this.voteTimer = null;
    this.voteResults = {};
  },
};

module.exports = voteActions;
