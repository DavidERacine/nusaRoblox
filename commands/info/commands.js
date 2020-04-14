module.exports = {
    Name: "commands",
    Aliases: ["cmds"],
    Mode: "Both",
    Category: "Info",
    Description: "Get command format and description by category.",
    Usage: "",
    Run: async(Service, message, args)=>{
        const Commands = await Service.Client.Commands;
        let Categories = ["Info","Groups","Verification","Clan Management","Moderators"];
        let Fields = [];
        await Service.Utils.asyncForEach(Categories, async(Cat)=>{
            let CatCmds = await Service.Client.Commands.filter(Cmd=>Cmd.Category == Cat);

            await Service.Utils.asyncForEach(CatCmds.array(), async(Cmd)=>{
                if (Fields.length == 25){
                    let Embed = await Service.Utils.BuildEmbed(`nusaRoblox Commands`, `The following are the commands.`, Fields);
                    Fields = [];
                    await message.author.send(Embed).then((msg)=>{}).catch(async(err)=>{
                        return await Service.Utils.ReturnMessage(message, `nusaRoblox Error`,'Privacy error most likely.');                
                    });
                }
                await Fields.push({name:`${Service.Environment.Prefix}${Cmd.Name} ${Cmd.Usage}`, value:`Aliases: ${(Cmd.Aliases.length == 0 ? "None." : Cmd.Aliases.join(','))}\nCategory: ${Cmd.Category}\nDescription: ${Cmd.Description}\nValid: ${(Cmd.Mode != "Both" ? `${Cmd.Mode} only` : `Anywhere.`)}`});
            });

        });
        let Embed = await Service.Utils.BuildEmbed(`nusaRoblox Commands`, `The following are the commands.`, Fields);
        await message.author.send(Embed).then((msg)=>{}).catch(async(err)=>{
            return await Service.Utils.ReturnMessage(message, `nusaRoblox Error`,'Privacy error most likely.');                
        });
        await Service.Utils.ReturnMessage(message, `nusaRoblox Commands`,'A list of commands by category have been direct-messaged to you.');
    }
}