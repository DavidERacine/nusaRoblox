const Roblox = require('noblox.js');

module.exports = {
    Name: "AutoRole",
    Description: "Handles the immigrations, blacklists, federal prisoners, and rank locks.",
   
    AutoBlacklist: async(Service) => {
        let Blacklisted = await Service.Utils.BuildQuery(`SELECT * FROM nusaBlacklists WHERE Active='Y'`);
        Blacklisted.forEach( async(Blacklist) => {
            let RobloxData = await Roblox.getRankNameInGroup(758071, Blacklist.UserID);
            if (RobloxData != "Guest" && RobloxData != Blacklist.lockType){
                console.log(`Demoting ${Blacklist.Username}(${Blacklist.UserID}) from ${RobloxData} to ${Blacklist.lockType}.`);
                await Service.Utils.ChangeRank(Blacklist.UserID, 758071, Blacklist.lockType);
            }
        });
    },

    AutoImmigrate: async(Service) => {
        let ImmigrationUsers = await Roblox.getPlayers(758071,4585176);
        ImmigrationUsers.forEach( async(User) => {
            let ImmigrationCheck = await Service.Utils.ImmigrationCheck(User.userId);
            if (ImmigrationCheck[0]){
                console.log(`Immigrating ${User.username}(${User.userId}).`);
                await Service.Utils.ChangeRank(User.userId, 758071, "American Citizen");
            }else{
                console.log(`Not Immigrating ${User.username}(${User.userId}). [${ImmigrationCheck[1]}]`);
                await Service.Utils.ChangeRank(User.userId, 758071, "Group Blacklist");
            }
        });
    },

    AutoPrisoner: async(Service) => {
        let CurrentPrisoners = await Roblox.getPlayers(758071,36755123);
        let ActivePrisoners = await Service.Utils.BuildQuery(`SELECT * FROM nusaPrisoners WHERE Active='Y'`);

        CurrentPrisoners.forEach(async(Prisoner)=>{
            let ActiveFilter = ActivePrisoners.filter(P=>P.UserID==Prisoner.userId);
            if (ActiveFilter.length === 0){
                console.log(`Sentence not found for ${Prisoner.username}. Putting back to American Citizen.`);
                await Service.Utils.ChangeRank(User.userId, 758071, "American Citizen");
            }else{
                console.log(`Sentence found for ${Prisoner.username}.`);
            }
        });

        ActivePrisoners.forEach(async(Prisoner)=>{
            let RobloxData = await Roblox.getRankNameInGroup(758071, Prisoner.UserID);
            if (RobloxData != "Guest" && RobloxData != "Federal Prisoner"){
                await Service.Utils.ChangeRank(Prisoner.UserID, 758071, "Federal Prisoner");
                console.log(`New Sentence found for ${Prisoner.Username}. Transporting from ${RobloxData} to Prison Transport Van!`);
            }
        });
    },

    Initialize: async (Service) =>{
        module.exports.AutoBlacklist(Service);
        module.exports.AutoImmigrate(Service);
        module.exports.AutoPrisoner(Service);

        /*
        setInterval(()=>{
            module.exports.AutoBlacklist(Service);
            module.exports.AutoImmigrate(Service);
            module.exports.AutoPrisoner(Service);
        }, 5*1000);  
        */
    }
}