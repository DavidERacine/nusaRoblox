module.exports = {
    Name: "lookup",
    Aliases: [],
    Mode: "Both",
    Category: "Moderators",
    Description: "Looks up user information for bans, blacklists, and immigration bans.",
    Usage: "<username/userid/discordmention>",
    Run: async(Service, message, args)=>{
        let UserParam = (message.mentions.members.first() ? message.mentions.members.first().user.id : (args.length > 0 ? args.join(' ') : ""));
        let UserInfo = await Service.Utils.UserSearch(UserParam);
        if (UserInfo.UserID === undefined) return Service.Utils.ReturnMessage(message, `nusaRoblox.Clan | Lookup`, UserInfo, []);
        let InfractionCt = 0;

        let oldBlacklistQuery   = await Service.Utils.BuildQuery(`SELECT * FROM nusaBlacklists,nusaUsers WHERE Active='Y' AND UserID='${UserInfo.UserID}' AND nusaBlacklists.modSSO=nusaUsers.nusaID`);
        let newBlacklistQuery   = await Service.Utils.BuildQuery(`SELECT * FROM nusaBlacklists WHERE Active="Y" AND (Username="${UserInfo.Username}" OR UserID="${UserInfo.Username}") AND nusaBlacklists.modSSO IS NULL `)
        let GameBanQuery     = await Service.Utils.BuildQuery(`SELECT * FROM nusaGameBans WHERE Active='Y' AND UserID='${UserInfo.UserID}'`);
        let ImmigrationQuery = await Service.Utils.BuildQuery(`SELECT * FROM nusaImmigrationBans WHERE userid='${UserInfo.UserID}'`);
        await Service.Utils.asyncForEach(oldBlacklistQuery, async(Blacklist)=>{
            let Embed = await Service.Utils.BuildEmbed(`Blacklist Record #${Blacklist.banId}`,``,[
                {name:"Username",value:`${Blacklist.Username}`,inline:true},
                {name:"UserID",value:`${Blacklist.UserID}`,inline:true},
                {name:"Level",value:`${Blacklist.Level}`,inline:true},
                {name:"Created",value:`${Blacklist.Creation}`},
                {name:"Expires",value:`${Blacklist.Expires}`},
                {name:"Appealable",value:`${Blacklist.Appealable == 'Y'?'Yes':'No'}`},
                {name:"Game Ban Also",value:`${Blacklist.gameBan == 'Y'?'Yes':'No'}`},
                {name:"Rank Lock",value:`${Blacklist.lockType}`},
            ]);
            message.channel.send(Embed);
            InfractionCt++;
        });
        await Service.Utils.asyncForEach(newBlacklistQuery, async(Blacklist)=>{
            let Embed = await Service.Utils.BuildEmbed(`Blacklist Record #${Blacklist.banId}`,``,[
                {name:"Username",value:`${Blacklist.Username}`,inline:true},
                {name:"UserID",value:`${Blacklist.UserID}`,inline:true},
                {name:"Level",value:`${Blacklist.Level}`,inline:true},
                {name:"Created",value:`${Blacklist.Creation}`},
                {name:"Expires",value:`${Blacklist.Expires}`},
                {name:"Appealable",value:`${Blacklist.Appealable == 'Y'?'Yes':'No'}`},
                {name:"Game Ban Also",value:`${Blacklist.gameBan == 'Y'?'Yes':'No'}`},
                {name:"Rank Lock",value:`${Blacklist.lockType}`},
            ]);
            message.channel.send(Embed);
            InfractionCt++;
        });
        await Service.Utils.asyncForEach(GameBanQuery, async(GameBan)=>{
            let Embed = await Service.Utils.BuildEmbed(`GameBan Record #${GameBan.banId}`,``,[
                {name:"Username",value:`${GameBan.Username}`,inline:true},
                {name:"UserID",value:`${GameBan.UserID}`,inline:true},
                {name:"Level",value:`${GameBan.Level}`,inline:true},
                {name:"Reason",value:`${GameBan.Reason}`},
                {name:"Created",value:`${GameBan.Creation}`},
                {name:"Expires",value:`${GameBan.Expires}`},
                {name:"Appealable",value:`${GameBan.Appealable == 'Y'?'Yes':'No'}`},
            ]);
            message.channel.send(Embed);
            InfractionCt++;
        });
        await Service.Utils.asyncForEach(ImmigrationQuery, async(ImmigrationBan)=>{
            let Embed = await Service.Utils.BuildEmbed(`Immigration Ban Record`,``,[
                {name:"Username",value:`${UserInfo.Username}`,inline:true},
                {name:"UserID",value:`${ImmigrationBan.userid}`,inline:true},
                {name:"Reason",value:`${ImmigrationBan.reason}`, inline:true},
                {name:"Created",value:`${ImmigrationBan.date}`},
            ]);
            message.channel.send(Embed);
            InfractionCt++;
        });
        if (InfractionCt === 0){
            let Embed = await Service.Utils.BuildEmbed(`Lookup Results`, `There are no infractions active found for ${UserInfo.Username}(${UserInfo.UserID}).`,[]);
            message.channel.send(Embed);
        }
    }
}