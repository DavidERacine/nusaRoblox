module.exports = {
    Name: "unverify",
    Aliases: ["unlink"],
    Mode: "Direct",
    Category: "Verification",
    Description: "Remove all verifications for this discord account.",
    Usage: "",
    Run: async(Service, message, args)=>{
        let UnVerifyQuery = await Service.Utils.BuildQuery(`UPDATE nusaDiscordUsers SET Status='Inactive' WHERE DiscordID = ${message.author.id} & Status!='Inactive'`);
        if (UnVerifyQuery.affectedRows > 0){
            let VerifyInfoEmbed = await Service.Utils.BuildEmbed(`nusaRoblox Verification`, `All verifications have been been disabled.`, []);
            message.channel.send(VerifyInfoEmbed);
        }else{
            let VerifyInfoEmbed = await Service.Utils.BuildEmbed(`nusaRoblox Verification`, `No current verifications with this discord to unlink.`, []);
            message.channel.send(VerifyInfoEmbed);
        }
    }
}