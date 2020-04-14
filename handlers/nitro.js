const Roblox = require('noblox.js');

module.exports = {
    Name: "Nitro",
    Description: "Handles the automated nitrobooster role and perks",
   
    /* async function `GenerateNitro`
     * Deletes all non-locked nitros and then regrabs the data.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    GenerateNitro: async(Service) => {
        let Guild = await Service.Client.guilds.get(`188563418570031104`);
        let Boosters = await Guild.roles.get(`586110443286691841`).members.map(member=>member.user);
        let DeleteQuery = await Service.Utils.BuildQuery(`DELETE FROM nusaNitroBoosters WHERE lock='N'`);
        let InsertText = "INSERT INTO nusaNitroBoosters (discordId, robloxId) VALUES ";
        await Service.Utils.asyncForEach(Boosters, async(Booster)=>{
            let RobloxData = await Service.Utils.GetRobloxUser(Booster.id);
            if (!RobloxData) return;
            InsertText += `('${Booster.id}','${RobloxData.RobloxID}'),`;
        });
        console.log(InsertText.slice(0,-1));
        let InsertQuery = await Service.Utils.BuildQuery(InsertText.slice(0,-1));
        console.log(InsertQuery);
    },

    /* async function `Initialize`
     * Sets up the nitro-booster system and its' cron.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    Initialize: async (Service) =>{
        /*
        module.exports.GenerateNitro(Service);
        
        setInterval(()=>{
            module.exports.GenerateNitro(Service);
        }, 5*60*1000);  
        */
    }
}