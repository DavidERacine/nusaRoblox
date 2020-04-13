const Axios     = require('axios').default;

module.exports = {
    Name: "updateall",
    Aliases: ["ura"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Updates all members in the discord.",
    Usage: "",
    Run: async(Service, message, args)=>{
        const Targets = await message.guild.members.array();

        await Service.Utils.asyncForEach(Targets, async(Target)=>{
            if (Target.user.bot) return;
            let VerData = await Service.Utils.GetRobloxUser(Target.id);
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