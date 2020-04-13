module.exports = {
    Name: "commands",
    Aliases: ["cmds"],
    Mode: "Both",
    Category: "Info",
    Description: "Get command format and description by category.",
    Usage: "",
    Run: async(Service, message, args)=>{
        const Commands = await Service.Client.Commands;
        let Categories = ["Info","Groups","Verification"];
        await Service.Utils.asyncForEach(Categories, async(Cat)=>{
            let CatCmds = await Service.Client.Commands.filter(Cmd=>Cmd.Category == Cat);

            let Embeds = [];
            await Service.Utils.asyncForEach(CatCmds.array(), async(Cmd)=>{
                await Embeds.push({name:`${Service.Settings.Prefix}${Cmd.Name} ${Cmd.Usage}`, value:`${Cmd.Description}`});
            });

            let CatEmbed = await Service.Utils.BuildEmbed(`nusaRoblox Commands | ${Cat}`, ``, Embeds);
            await message.author.send(CatEmbed).then((msg)=>{}).catch(async(err)=>{
                return await Service.Utils.ReturnMessage(message, `nusaRoblox Error`,'Privacy error most likely.');                
            });

        });
        await Service.Utils.ReturnMessage(message, `nusaRoblox Commands`,'A list of commands by category have been direct-messaged to you.');
    }
}