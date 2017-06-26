'use strict';

// Test server: 328967450400129024
// Live server: 328388894884102144

const Actions = new Object();

Actions.handleMention = function(message) {
    let userList = message.guild.roles.get('328388894884102144').members;
    let users = userList.map(item => item.user.id);

    if(message.author.id !== users[0])
        message.reply(`Please do not speak directly to me you ${'<:pleb:237058273054818306>'}. See available commands by typing #help.`);
    else
        message.reply("How may I serve you my lord?");
};

Actions.handleCeoMention = function (message) {
    let userList = message.guild.roles.get('328388894884102144').members;
    let users = userList.map(item => item.user.id);

    // currently take the first users as there should only be one anyway. Pulls all users listed under the role anyway in case of changes later.
    // TODO: Figure out what you want to do here
    let reply = `Mr. CEO, <@${users[0]}> is currently taking appointments. If you would like to schedule one, please type #book, or type #sched to see the current schedule.`;
    message.reply(reply);
};

Actions.displayHelp = function (message) {
    let help = "Available commands:\n#help\n#sched\n#book";
    message.channel.send(help);
};

// TODO: Add in scheduling and booking appointments
Actions.displayCurrentSchedule = function (message) {
    let reply = "Feature not available in free version.";
    message.channel.send(reply);
};

Actions.bookAppointment = function (message) {
    let reply = "Feature not available in free version.";
    message.channel.send(reply);
};

exports.Actions = Actions;
