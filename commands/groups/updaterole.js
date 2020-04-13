module.exports = {
    Name: "updaterole",
    Aliases: ["ur"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Updates all members in the role.",
    Usage: "<@Role> (limit 1 per command)",
    Run: async(Service, message, args)=>{
        if (!message.mentions.roles.first()) return await Service.Utils.ReturnMessage(message, 'nusaRoblox Updates', ``, []);
        
        const TargetRole = message.mentions.roles.first();
        const Targets = await message.guild.members.filter(mem=>mem.roles.find(mr=>mr.id==TargetRole.id)).array();
        

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
        
        await Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`Their roles have been updated.`, []);
    }
}