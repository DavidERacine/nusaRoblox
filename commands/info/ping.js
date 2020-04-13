module.exports = {
    Name: "ping",
    Aliases: ["pong"],
    Mode: "Direct",
    Category: "Info",
    Description: "Gets response time of bot.",
    Usage: "",
    Run: async(Service, message, args)=>{
        let Test = await Service.Utils.BuildEmbed("Ping-Pong","Bot Ping is `" + `${message.createdTimestamp - Date.now()}` + " ms`.", []);
        message.reply(Test);
    }
}