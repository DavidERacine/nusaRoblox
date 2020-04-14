module.exports = {
    Name: "rank",
    Aliases: [],
    Mode: "Both",
    Category: "Clan Management",
    Description: "Rank a user from a group.",
    Usage: "<groupid> <username/userid/discordmention/discordid> <role>",
    Run: async(Service, message, args)=>{
        if (!args) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan |  Rank`,`Requires 3 parameters.`, [{name:"Format", value:`${Service.Environment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
        let GroupParam = args[0];
        let UserParam = (message.mentions.members.first() ? message.mentions.members.first().user.id : args[1]);
        let RoleParam = args.slice(2).join(' ');

        let GroupInfo = await Service.Utils.GroupSearch(GroupParam);
        let UserInfo = await Service.Utils.UserSearch(UserParam);
        if (UserInfo.UserID === undefined) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | UserSearch`, UserInfo, []);
        if (GroupInfo.Name === undefined) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | GroupSearch`, `We could not find a group by the parameter "${GroupParam}".`, []);
        
        let CurrentRole = await Service.Roblox.getRankNameInGroup(GroupInfo.Id, UserInfo.UserID);
        if (CurrentRole == "Guest") return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | Rank`, `${UserInfo.Username} is currently a guest in the group. Accept them first.`,[]);
        if (CurrentRole == RoleParam) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | Rank`, `${UserInfo.Username} is currently that rank in the group, select a different rank.`,[]);
       
        await Service.Roblox.setRank({group: GroupInfo.Id, target: UserInfo.UserID, name: RoleParam}).then(async(Resp)=>{
            await Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | Rank Successful`, `You have ranked ${UserInfo.Username} in ${GroupInfo.Name} from ${CurrentRole} to ${RoleParam}.`, []);
        }).catch(async(err)=>{
            await Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | Rank Error`, `You have not ranked ${UserInfo.Username} in ${GroupInfo.Name}. \n${err}`, []);
            await Service.Utils.ExternalLog(null, `nusaRoblox.Clan | Rank Error`, `You have not ranked ${UserInfo.Username} in ${GroupInfo.Name}. \n${err}`);
        });
    }
}