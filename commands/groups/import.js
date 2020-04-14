module.exports = {
    Name: "import",
    Aliases: ["creategrouproles"],
    Mode: "Guild",
    Category: "Groups",
    Description: "Import all roles from group and binds.",
    Usage: "<GroupID>",
    Run: async(Service, message, args)=>{
        if (args.length === 1){
            if (parseInt(args[0])){
                let GroupData   = await Service.Utils.AxiosGet(`https://api.roblox.com/groups/${args[0]}`);
                let GuildRoles  = await message.guild.roles;
                if (GroupData.Name === undefined) return;
                let PositionsArray = [];
                let Current = 0;
                let BindQuery = "INSERT INTO nusaBindings (bindGuild, bindRole, bindGroup, bindNumbers, bindAdministrator) VALUES ";
                let UpdateQuery = "UPDATE nusaBindings SET bindActive='N' WHERE ";

                await Service.Utils.asyncForEach(GroupData.Roles.reverse(), async(Role)=>{
                    let GuildRole = GuildRoles.find(gRole=>gRole.name == Role.Name);
                    if (GuildRole){
                        if (GuildRole.editable){
                            PositionsArray.push({role: GuildRole, position: (GroupData.Roles.length - Current)});
                            BindQuery += `('${message.guild.id}','${GuildRole.id}','${args[0]}', '${Role.Rank}', '${message.author.id}'),`;
                            UpdateQuery += `bindRole='${GuildRole.id}' OR `;
                        }
                    }else{
                        await message.guild.createRole({
                            name: Role.Name,
                            hoist: true,
                            permissions: [],
                            mentionable: true
                        },`Imported by ${message.author.username}#${message.author.discriminator}.`).then(async(newRole)=>{
                            PositionsArray.push({role: newRole, position: (GroupData.Roles.length - Current)});
                            BindQuery += `('${message.guild.id}','${newRole.id}','${args[0]}', '${Role.Rank}', '${message.author.id}'),`;
                        }).catch(async(err)=>{
                            await Service.Utils.ExternalLog(Service, "Import NewRole Error", `${Role.Name} could not be created in ${message.guild.name}. \n ${err}`);
                        });
                    }
                    Current++;
                });
                await message.guild.setRolePositions(PositionsArray).then(async(resp)=>{
                    let MassUpdateQuery = await Service.Utils.BuildQuery(UpdateQuery.slice(0,-4));
                    let MassBindQuery = await Service.Utils.BuildQuery(BindQuery.slice(0,-1));
                    Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`Import successful!`,[
                        {name:"Group Name", value: `${GroupData.Name}`, inline: true},
                        {name: `Group Owner`, value: `${GroupData.Owner.Name}(${GroupData.Owner.Id})`, inline: true},
                        {name: `Group Role Ct.`, value: `${GroupData.Roles.length}`, inline: true}
                    ]);                        
                }).catch(async(err)=>{
                   Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Success`,`Import successful!`,[
                        {name:"Group Name", value: `${GroupData.Name}`, inline: true},
                        {name: `Group Owner`, value: `${GroupData.Owner.Name}(${GroupData.Owner.Id})`, inline: true},
                        {name: `Group Role Ct.`, value: `${GroupData.Roles.length}`, inline: true}
                    ]);      
                    await Service.Utils.ExternalLog(Service, "setRolePositions Error", `${err}`);
                });
            }else{
                return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`Please supply a numericl arguement.`, [{name:"Format", value:`${Service.Environment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
            }
        } else {
            return Service.Utils.ReturnMessage(message, `RobloxNUSA.Ver :: Error`,`Please supply only one arguement.`, [{name:"Format", value:`${Service.Environment.Prefix}${Service.Command.Name} ${Service.Command.Usage}`}]);
        }
    }
}