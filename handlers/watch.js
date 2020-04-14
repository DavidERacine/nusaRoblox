const Roblox = require('noblox.js');

module.exports = {
    Name: "Watcher",
    Description: "Handles the watching handlers for shout and auditlogs.",
   
    WatchShout: async(Service) => {
        let ShoutObject = await Roblox.onShout(758071);
        ShoutObject.on('data',async(Shout)=>{
            let ShoutLockQuery = await Service.Utils.BuildQuery("SELECT * FROM nusaShoutLock  WHERE active='Y' ORDER BY ID DESC LIMIT 1");
            if (ShoutLockQuery.length === 0) return;
            let ShoutLock = ShoutLockQuery[0];
            if (Shout.body != ShoutLock.shoutMessage){
                Roblox.shout(758071, ShoutLock.shoutMessage);
                if (ShoutLock.autoDemote != "" && ShoutLock.autoDemote != "Nothing"){
                    await Service.Utils.ChangeRank(Shout.userId, 758071, ShoutLock.autoDemote);
                }
            } 
        });
    },

    WatchAudit: async(Service) => {
        let AuditObject = await Roblox.onAudit(758071);
        AuditObject.on('data',async(Audit)=>{
            console.log(Audit);
        });
    },

    ShoutlockUpdate: async(Service) =>{
        //this
    },

    Initialize: async (Service) =>{
        module.exports.WatchShout(Service);
        module.exports.WatchAudit(Service);
    }
}