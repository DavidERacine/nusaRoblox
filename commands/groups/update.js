const Axios     = require('axios').default;

module.exports = {
    Name: "update",
    Aliases: ["ur"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Updates those mentioned.",
    Usage: "<@Member> <...>",
    Run: async(Service, message, args)=>{
        if (message.mentions.members.array().length === 0) return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`You need to mention the user(s) you wish to force-update.`, []);
        const Targets = message.mentions.members.array();
       
        await Service.Utils.asyncForEach(Targets, async(Target) => {
            if (Target.user.bot) return;
            let VerData = await Service.Utils.GetRobloxUser(Target.user.id);
            if (VerData){
                let RoleData = await Service.Utils.GetUserBinds(VerData.RobloxID, message.guild.id);
                let DiscordMember = Target;

                await DiscordMember.addRoles(RoleData.Add).then(async(Resp)=>{}).catch(async(err)=>{
                    await Service.Utils.ExternalLog(Service, "GetRoles Error", `${DiscordMember.id} could not be stricken from roles in ${message.guild.name}. \n ${err}`);
                });
        
                await DiscordMember.removeRoles(RoleData.Remove).then(async(Resp)=>{}).catch(async(err)=>{
                    await Service.Utils.ExternalLog(Service, "GetRoles Error", `${DiscordMember.id} could not be stricken from roles in ${message.guild.name}. \n ${err}`);
                });  
            }
        });
        Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`Their roles have been updated.`, []);
    }
}