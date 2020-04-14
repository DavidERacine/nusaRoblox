const { readdirSync} = require('fs');
const ascii = require("ascii-table");
const table = new ascii().setHeading("Command","Load status");

module.exports = {
    Name: "Commands",
    Description: "Loads all commands and categories.",
    Initialize: async (Service) =>{
        readdirSync("./commands/").forEach(Dir => {
            const Commands = readdirSync(`./commands/${Dir}/`).filter(File=>File.endsWith('.js'));
            for (let File of Commands){
                let Pull = require(`../commands/${Dir}/${File}`);
                if (Pull.Name){
                    Service.Client.Commands.set(Pull.Name, Pull);
                    table.addRow(File, ":white_check_mark:");
                }else{
                    table.addRow(File, ":negative_squared_cross_mark:");
                    continue;
                }
                if (Pull.Aliases){
                    Pull.Aliases.forEach(Alias=>{
                        Service.Client.Aliases.set(Alias, Pull.Name)
                    });
                }
            }
        });
    }
}