module.exports = {
    Name: "getroles",
    Aliases: ["get"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Gets all roles ya need.",
    Usage: "",
    Run: async(Service, message, args)=>{
        let VerData = await Service.Utils.GetRobloxUser(message.author.id);
        if (VerData){
            let RoleData = await Service.Utils.GetUserBinds(VerData.RobloxID, message.guild.id);
            let DiscordMember = message.member;
            if (!DiscordMember) DiscordMember = await message.guild.fetchMember(message);
            if (!DiscordMember) return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`Member error on message.`, []);

            await DiscordMember.addRoles(RoleData.Add).then(async(Resp)=>{}).catch(async(err)=>{
                await Service.Utils.ExternalLog(Service, "GetRoles Error", `${DiscordMember.id} could not be given roles in ${message.guild.name}. \n ${err}`);
            });

            await DiscordMember.removeRoles(RoleData.Remove).then(async(Resp)=>{}).catch(async(err)=>{
                await Service.Utils.ExternalLog(Service, "GetRoles Error", `${DiscordMember.id} could not be stricken from roles in ${message.guild.name}. \n ${err}`);
            });

            Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`Your roles have been updated.`, []);
        }else{
            Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`You have no valid verification record.`, []);
        }
    }
}