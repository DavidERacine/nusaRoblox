module.exports = {
    Name: "clearbinds",
    Aliases: ["cb","clearbindings"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Removes all role buildings for this guild.",
    Usage: "",
    Run: async(Service, message, args)=>{
        let PurgeBinds = await Service.Utils.BuildQuery(`UPDATE nusaBindings SET bindActive='N' WHERE bindGuild=${message.guild.id} AND bindActive='Y'`);
        return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`All bindings(${PurgeBinds.affectedRows} ct) were removed.`, []);
    }
}