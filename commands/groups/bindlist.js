module.exports = {
    Name: "getbindings",
    Aliases: ["gb","bindings","binds"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Gets all role buildings for this guild.",
    Usage: "",
    Run: async(Service, message, args)=>{
        let GuildBinds = await Service.Utils.BuildQuery(`SELECT * FROM nusaBindings WHERE bindGuild=${message.guild.id} AND bindActive='Y'`);
        if (GuildBinds.length === 0) return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`No bindings in this server.`, []);

        let FieldArray = [];
        
        await Service.Utils.asyncForEach(GuildBinds, async(Binding) => {
            let Role = await message.guild.roles.find(r=>r.id===Binding.bindRole);
            if (FieldArray.length >= 25){
                let Result = await Service.Utils.BuildEmbed(`Bindings`, `Current bindings for this discord.`, FieldArray);
                message.channel.send(Result);
                FieldArray = [];
            }
            if (Role){
                FieldArray.push({name:`${Role.name}`,value:`*${Binding.bindGroup}:${Binding.bindNumbers}*`, inline: true});
            }else{
                FieldArray.push({name:`${Binding.bindRole}\n[Role is Deleted]`,value:`*${Binding.bindGroup}:${Binding.bindNumbers}*`, inline: true});
            }
        });
        let Result = await Service.Utils.BuildEmbed(`Bindings`, `Current bindings for this discord.`, FieldArray);
        message.channel.send(Result);
    }
}