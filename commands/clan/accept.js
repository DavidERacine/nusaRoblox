module.exports = {
    Name: "accept",
    Aliases: [],
    Mode: "Both",
    Category: "Clan Management",
    Description: "Accepts a user to a group.",
    Usage: "<groupid> <username/userid/discordmention/discordid>",
    Run: async(Service, message, args)=>{
        if (!args) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan |  Accept`,`Requires 2 parameters.`, [{name:"Format", value:`${Service.Environment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
        let GroupParam = args[0];
        let UserParam = (message.mentions.members.first() ? message.mentions.members.first().user.id : (args.length > 1 ? args.slice(1).join(' ') : ""));

        let GroupInfo = await Service.Utils.GroupSearch(GroupParam);
        let UserInfo = await Service.Utils.UserSearch(UserParam);
        if (UserInfo.UserID === undefined) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | UserSearch`, UserInfo, []);
        if (GroupInfo.Name === undefined) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | GroupSearch`, `We could not find a group by the parameter "${GroupParam}".`, []);

        await Service.Roblox.handleJoinRequest({group: GroupInfo.Id, userId: UserInfo.UserID, accept: true}).then(async(Resp)=>{
            await Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | Acceptance Successful`, `You have accepted ${UserInfo.Username} into ${GroupInfo.Name}`, []);
        }).catch(async(err)=>{
            await Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | Acceptance Error`, `You have not accepted ${UserInfo.Username} into ${GroupInfo.Name}\n${err}`, []);
            await Service.Utils.ExternalLog(null, `nusaRoblox.Clan | Acceptance Error`, `You have not accepted ${UserInfo.Username} into ${GroupInfo.Name}\n${err}`);
        });
    }
}