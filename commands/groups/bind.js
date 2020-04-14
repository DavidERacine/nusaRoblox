module.exports = {
    Name: "bind",
    Aliases: ["link"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Description.",
    Usage: `"<Role Name>" <GroupID>:<Params>`,
    Run: async(Service, message, args)=>{
        if (!args) return Service.Utils.ReturnMessage(message, `RobloxNUSA.Bind :: Error`,`Requires 2 parameters.`, [{name:"Format", value:`${Service.Enviroment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
        if (args.length != 2 && message.content.indexOf('"')  == -1) return Service.Utils.ReturnMessage( message, `RobloxNUSA.Bind :: Error`,`Requires 2 parameters. ${args.length} were supplied.`, [{name:"Format", value:`${Service.Enviroment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
        if (args[1].indexOf(':') == -1 && message.content.indexOf('"')  == -1) return Service.Utils.ReturnMessage(message, `RobloxNUSA.Bind :: Error`,`Invalid GroupID:Params format.`, [{name:"Example", value:`${Service.Enviroment.Prefix}bind "American Citizen" 758071:15-30,45-255`}]);
        var RoleFormat = new RegExp('"(.*?)"', 'g');
        var RoleName = "";
        var GroupData = "";
        
        if (RoleFormat.test(message.content)){
            var RegexResult = message.content.match(RoleFormat)[0];
            var RegexResult = RoleFormat.exec(message.content)[0];
            RoleName  = RegexResult.replace('"','').replace('"','');
            GroupData = message.content.substring(RoleFormat.lastIndex).split(':');
        }else{
            RoleName = args[0];
            GroupData = args[1].split(':');
        }
        GroupID = GroupData[0];
        Params = GroupData[1];
   
        let DiscordRole = await message.guild.roles.find(gRole=>gRole.name==RoleName);
        let RanksArray = await Service.Utils.NumberExplode(Params);
        if (!DiscordRole){
            DiscordRole = await message.guild.createRole({
                name: RoleName,
                hoist: true,
                permissions: [],
                position: 1,
                mentionable: true
            },`Imported by ${message.author.username}#${message.author.discriminator}.`).then(async(newRole)=>{
                DiscordRole = newRole;
                let CurrentBind = await Service.Utils.BuildQuery(`SELECT * FROM nusaBindings WHERE bindActive='Y' AND bindRole=${DiscordRole.id}`);
                if (CurrentBind.length === 0){
                    let newBind = await Service.Utils.BuildQuery(`INSERT INTO nusaBindings (bindGuild, bindRole, bindGroup, bindNumbers, bindAdministrator) VALUES ('${message.guild.id}','${DiscordRole.id}','${GroupID}','${Params}','${message.author.id}')`);
                }else{
                    return Service.Utils.ReturnMessage(message, `RobloxNUSA.Bind :: Error`,`Binding Exists Already.`, []);
                }
            }).catch(async(err)=>{
                await Service.Utils.ExternalLog(Service, "Bind NewRole Error", `${Role.name} could not be created in ${message.guild.name}. \n ${err}`);
            });
        }else{
            let CurrentBind = await Service.Utils.BuildQuery(`SELECT * FROM nusaBindings WHERE bindActive='Y' AND bindRole=${DiscordRole.id}`);
            if (CurrentBind.length === 0){
                let newBind = await Service.Utils.BuildQuery(`INSERT INTO nusaBindings (bindGuild, bindRole, bindGroup, bindNumbers, bindAdministrator) VALUES ('${message.guild.id}','${DiscordRole.id}','${GroupID}','${Params}','${message.author.id}')`);
            }else{
                return Service.Utils.ReturnMessage(message, `RobloxNUSA.Bind :: Error`,`Binding Exists Already.`, []);
            }    
        }
        return Service.Utils.ReturnMessage(message, `RobloxNUSA.Bind :: Success`,`${RoleName} was successfully bound.`, []);
    }
}