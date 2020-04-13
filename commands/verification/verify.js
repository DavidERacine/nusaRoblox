module.exports = {
    Name: "verify",
    Aliases: ["ver"],
    Mode: "Direct",
    Category: "Verification",
    Description: "Setup verification for your discord account.",
    Usage: "<Username> OR cancel",
    Run: async(Service, message, args)=>{
        let CurrentQuery = await Service.Utils.BuildQuery(`SELECT * FROM nusaDiscordUsers WHERE Status != 'Inactive' AND DiscordID = ${message.author.id}`);
        let Username = args.join(" ");
        if (Username.toLowerCase() == "cancel"){
            await Service.Utils.BuildQuery(`UPDATE nusaDiscordUsers SET Status='Inactive' WHERE DiscordID=${message.author.id}`);
            return message.channel.send(await Service.Utils.BuildEmbed(`nusaRoblox Verification`,`Your current verification has been cancelled.`, [])); 
        }
        if (CurrentQuery.length === 0){
            let RandomAuth = Math.floor(Math.random()*9999);
            let RobloxData = await Service.Utils.AxiosGet(`https://api.roblox.com/users/get-by-username?username=${Username}`);

            let NewRecord = await Service.Utils.BuildQuery(`INSERT INTO nusaDiscordUsers (RobloxName, RobloxID, DiscordID, AuthCode) VALUES ('${RobloxData.Username}','${RobloxData.Id}','${message.author.id}','${RandomAuth}')`);
            let VerifyInfoEmbed = await Service.Utils.BuildEmbed(`nusaRoblox Verification`, `Verification Info`, [
                {name: "Roblox Username", value: RobloxData.Username, inline:true},
                {name: "Roblox UserID",   value: RobloxData.Id, inline:true},
                {name: "JasonGay Code", value: `${RandomAuth}`, inline:true},
                {name: "Steps", value: `1. Go to Washington, DC and spawn in. [Link](https://)\n2. Chat "!discord <AuthCode>" and you will get a response saying success or failure.\n3. Boom! Verified and done!`}
            ]);
            message.channel.send(VerifyInfoEmbed);
        } else if (CurrentQuery[0].Status == "Active"){
            let Embed = await Service.Utils.BuildEmbed("nusaRoblox Verification", "You currently have a active verification. To unlink your discord, send `!unlink`.", [
                {name: "Roblox Username", value: CurrentQuery[0].RobloxName, inline:true},
                {name: "Roblox UserID", value: CurrentQuery[0].RobloxID, inline:true},
            ]);
            message.channel.send(Embed);
        } else if (CurrentQuery[0].Status == "Pending"){
            let Embed = await Service.Utils.BuildEmbed("nusaRoblox Verification", "You currently have a pending verification. Please head to DC and once spawned, say `!discord <auth_code>` to complete.", [
                {name: "Roblox Username", value: CurrentQuery[0].RobloxName, inline:true},
                {name: "Roblox UserID", value: CurrentQuery[0].RobloxID, inline:true},
                {name: "JasonGay Code", value: CurrentQuery[0].AuthCode, inline:true},
            ]);
            message.channel.send(Embed);
        }
    }
}