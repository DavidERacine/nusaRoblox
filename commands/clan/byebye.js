module.exports = {
    Name: "discordpurge",
    Aliases: [],
    Mode: "Both",
    Category: "Clan Management",
    Description: "Kick a user form all discords the bot is in.",
    Usage: "<username/userid/discordmention/discordid>",
    Run: async(Service, message, args)=>{
        let UserParam = (message.mentions.members.first() ? message.mentions.members.first().user.id : (args.length > 0 ? args.join(' ') : ""));
        let UserInfo = await Service.Utils.UserSearch(UserParam);
        if (UserInfo.UserID === undefined) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | DiscordByeBye`, UserInfo, []);
        let DiscordID = await Service.Utils.GetRobloxUser(UserInfo.UserID);

        let ClientGuilds = await Service.Client.guilds.filter(g=>(await g.members.find(mem=>mem.id==DiscordID)));
        console.log(ClientGuilds);
    }
}

