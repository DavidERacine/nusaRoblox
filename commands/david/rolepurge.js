module.exports = {
    Name: "rolepurge",
    Aliases: ["rp","allrolesbyebye"],
    Mode: "Guild",
    Category: "David",
    Description: "Removes all roles.",
    Usage: "",
    Run: async(Service, message, args)=>{
        let Roles = await message.guild.roles.array();
        await Service.Utils.asyncForEach(Roles, async(Role) => {
            if (Role.editable && !Role.Managed){
                Role.delete().then(async(Response)=>{
                }).catch(async(err)=>{
                    await Service.Utils.ExternalLog(Service, "RolePurge Error", `${err}`);
                });
            }else{
                await Service.Utils.ExternalLog(Service, "RolePurge Error", `${Role.name} can't be deleted. Sorry. :-( `);;
            }
        });
        return Service.Utils.ReturnMessage(message, `David.RolePurge :: Success`,`Good job fatass, ya removed all the roles.`, []);
    }
}