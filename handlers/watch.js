const Roblox = require('noblox.js');

module.exports = {
    Name: "Watcher",
    Description: "Handles the watching handlers for shout and auditlogs.",
   
    /* async function `WatchShout`
     * Creates the shout watcher for the main NUSA group, if overshouted, puts back, and checks if it is auto-demotable and does it.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    WatchShout: async(Service) => {
        let ShoutObject = await Roblox.onShout(Service.Enviroment.nusaGroup);
        ShoutObject.on('data',async(Shout)=>{
            let ShoutLockQuery = await Service.Utils.BuildQuery("SELECT * FROM nusaShoutLock  WHERE active='Y' ORDER BY ID DESC LIMIT 1");
            if (ShoutLockQuery.length === 0) return;
            let ShoutLock = ShoutLockQuery[0];
            if (Shout.body != ShoutLock.shoutMessage){
                Roblox.shout(Service.Enviroment.nusaGroup, ShoutLock.shoutMessage);
                if (ShoutLock.autoDemote != "" && ShoutLock.autoDemote != "Nothing"){
                    await Service.Utils.ChangeRank(Shout.userId, Service.Enviroment.nusaGroup, ShoutLock.autoDemote);
                }
            } 
        });
    },

    /* async function `WatchAudit`
     * Creates the auditlog watcher for the main NUSA group. [Eventually will watch for abuse on clan-wide scale.]
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    WatchAudit: async(Service) => {
        let AuditObject = await Roblox.onAudit(Service.Enviroment.nusaGroup);
        AuditObject.on('data',async(Audit)=>{
            console.log(Audit);
        });
    },

    /* async function `ShoutlockUpdate`
     * Description
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    ShoutlockUpdate: async(Service) =>{
        //this
    },

    /* async function `Initialize`
     * Sets up the Shout and Auditlog Watchers.
     * 
     * @param Service : nusaRoblox Service
     * @return --------
     */
    Initialize: async (Service) =>{
        module.exports.WatchShout(Service);
        module.exports.WatchAudit(Service);
    }
}