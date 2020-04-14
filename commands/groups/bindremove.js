module.exports = {
    Name: "unbind",
    Aliases: ["unlink","removebind"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Removes bindings from the specific role name.",
    Usage: `"<Role Name>" OR RoleID`,
    Run: async(Service, message, args)=>{
        if (!args) return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`Requires 1 parameters.`, [{name:"Format", value:`${Service.Environment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
        if (args.length != 1 && message.content.indexOf('"')  == -1) return Service.Utils.ReturnMessage( message, `RobloxNUSA.Ver :: Error`,`Requires 1 parameters. ${args.length} were supplied.`, [{name:"Format", value:`${Service.Environment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
        if (!parseInt(args[0]) && message.content.indexOf('"')  == -1) return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`Invalid Role format.`, [{name:"Example", value:`${Service.Environment.Prefix}unbind "American Citizen"`}]);
        var RoleFormat = new RegExp('"(.*?)"', 'g');
        var RoleParam = "";
        
        if (RoleFormat.test(message.content)){
            var RegexResult = message.content.match(RoleFormat)[0];
            var RegexResult = RoleFormat.exec(message.content)[0];
            RoleParam  = RegexResult.replace('"','').replace('"','');
        }else{
            RoleParam = args[0];
        }
        let DiscordRole = await message.guild.roles.find(gRole=>gRole.name==RoleParam);
        if (DiscordRole){
            let CurrentBind = await Service.Utils.BuildQuery(`UPDATE nusaBindings SET bindActive='N' WHERE bindRole=${DiscordRole.id}`);
            return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`${DiscordRole.name}(${DiscordRole.id}) was unbinded.`, []);
        }else{
            DiscordRole = await message.guild.roles.find(gRole=>gRole.id==RoleParam);
            if (DiscordRole){
                let CurrentBind = await Service.Utils.BuildQuery(`UPDATE nusaBindings SET bindActive='N' WHERE bindRole=${DiscordRole.id}`);
                return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`${DiscordRole.name}(${DiscordRole.id}) was unbinded.`, []);
            }else{
                let CheckQuery = await Service.Utils.BuildQuery(`UPDATE nusaBindings SET bindActive='N' WHERE bindRole='${RoleParam}'`);
                if (CheckQuery.length !== 0){
                    return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`${RoleParam} was removed from the db, no role existed.`, []);
                }else{
                    return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`No role by the parameter of `+"`"+`${RolePerm}`+"`"+`.`, []);
                }
            }
        }
    }
}