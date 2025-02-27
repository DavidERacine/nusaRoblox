const Roblox = require('noblox.js');

module.exports = {
    Name: "AutoRole",
    Description: "Handles the immigrations, blacklists, federal prisoners, and rank locks.",
   
    /* async function `AutoBlacklist`
     * Grabs all the nusaBlacklist Users, checks if they are Guest or already ranked, then ranks.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    AutoBlacklist: async(Service) => {
        let Blacklisted = await Service.Utils.BuildQuery(`SELECT * FROM nusaBlacklists WHERE Active='Y'`);
        Blacklisted.forEach( async(Blacklist) => {
            let RobloxData = await Roblox.getRankNameInGroup(Service.Environment.nusaGroup, Blacklist.UserID);
            if (RobloxData != "Guest" && RobloxData != Blacklist.lockType){
                console.log(`Demoting ${Blacklist.Username}(${Blacklist.UserID}) from ${RobloxData} to ${Blacklist.lockType}.`);
                await Service.Utils.ChangeRank(Blacklist.UserID, Service.Environment.nusaGroup, Blacklist.lockType);
            }
        });
    },

    /* async function `AutoImmigrate`
     * Grabs all the Immigration Users, checks RobloxAge, then ranks.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    AutoImmigrate: async(Service) => {
        let ImmigrationUsers = await Roblox.getPlayers(Service.Environment.nusaGroup, Service.Environment.imRoleset);
        ImmigrationUsers.forEach( async(User) => {
            let ImmigrationCheck = await Service.Utils.ImmigrationCheck(User.userId);
            if (ImmigrationCheck[0]){
                console.log(`Immigrating ${User.username}(${User.userId}).`);
                await Service.Utils.ChangeRank(User.userId, Service.Environment.nusaGroup, "American Citizen");
            }else{
                console.log(`Not Immigrating ${User.username}(${User.userId}). [${ImmigrationCheck[1]}]`);
                await Service.Utils.ChangeRank(User.userId, Service.Environment.nusaGroup, "Group Blacklist");
            }
        });
    },

    /* async function `AutoPrisoner`
     * Grabs all the Current Prisoners Users, sees if there is a valid sentence, if not, re-promote, if so, keeps.
     * Grabs all the Current Sentences, sees if they are ranked already and they in the group, then ranks.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    AutoPrisoner: async(Service) => {
        let CurrentPrisoners = await Roblox.getPlayers(Service.Environment.nusaGroup, Service.Environment.fpRoleset);
        let ActivePrisoners = await Service.Utils.BuildQuery(`SELECT * FROM nusaPrisoners WHERE Active='Y'`);

        CurrentPrisoners.forEach(async(Prisoner)=>{
            let ActiveFilter = ActivePrisoners.filter(P=>P.UserID==Prisoner.userId);
            if (ActiveFilter.length === 0){
                console.log(`Sentence not found for ${Prisoner.username}. Putting back to American Citizen.`);
                await Service.Utils.ChangeRank(User.userId, Service.Environment.nusaGroup, "American Citizen");
            }else{
                console.log(`Sentence found for ${Prisoner.username}.`);
            }
        });

        ActivePrisoners.forEach(async(Prisoner)=>{
            let RobloxData = await Roblox.getRankNameInGroup(Service.Environment.nusaGroup, Prisoner.UserID);
            if (RobloxData != "Guest" && RobloxData != "Federal Prisoner"){
                await Service.Utils.ChangeRank(Prisoner.UserID, Service.Environment.nusaGroup, "Federal Prisoner");
                console.log(`New Sentence found for ${Prisoner.Username}. Transporting from ${RobloxData} to Prison Transport Van!`);
            }
        });
    },

    /* async function `Initialize`
     * Runs the first AutoBlacklist/AutoImmigrate/AutoPrisoner, then sets up the intervals of the crons.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    Initialize: async (Service) =>{
        //module.exports.AutoBlacklist(Service);
        //module.exports.AutoImmigrate(Service);
        //module.exports.AutoPrisoner(Service);

        /*
        setInterval(()=>{
            module.exports.AutoBlacklist(Service);
            module.exports.AutoImmigrate(Service);
            module.exports.AutoPrisoner(Service);
        }, 5*1000);  
        */
    }
}