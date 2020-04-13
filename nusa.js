const Discord = require('discord.js');
const Utils   = require('./utils.js');
const Settings= require('./Settings.json');

const Client  	= new Discord.Client();
Client.Commands = new Discord.Collection();
Client.Aliases 	= new Discord.Collection();

["command"].forEach(handler=> {
	require(`./handler/${handler}`)(Client);
});

Client.on('message', async(message)=>{
	if (message.author.bot) return;
	if (!message.content.startsWith(Settings.Prefix)) return;

	const args = message.content.slice(Settings.Prefix.length).trim().split(/ +/g);
	const cmd = args.shift().toLowerCase();
	if (cmd.length === 0) return; 

	let Command = Client.Commands.get(cmd);
	if (!Command) Command = Client.Commands.get(Client.Aliases.get(cmd));

	if (Command){
		if (Command.Mode == "Guild"  && message.channel.type != "text") return Utils.ReturnMessage(message, "nusaRoblox","This command is restricted to guilds.",[]);
		if (Command.Mode == "Direct" && message.channel.type != "dm") return Utils.ReturnMessage(message, "nusaRoblox","This command is restricted to direct messages.",[]);
		if (Command.Mode == "Both" && (message.channel.type != "text" && message.channel.type != "dm"))  return Utils.ReturnMessage(message, "nusaRoblox","This command is restricted to direct and guild messages.",[]);

		let Service = {Discord: Discord, Utils:Utils, Client: Client, Command: Command, Settings: Settings};
		await Command.Run(Service, message, args);
	}
});

Client.on('ready', async()=>{
	let RandomPhrase = [
		"The brit has David working all night!",
		"Jason is a deadbeat!",
		"Jared is nice and should not leave..."
	];
	let Service = {Discord: Discord, Utils:Utils, Client: Client, Command: null, Settings: Settings}
	await Utils.ExternalLog(Service, "Bot Online", `${RandomPhrase[Math.floor(Math.random()*RandomPhrase.length)]}`);
});

Client.on('roleDelete', async(Role)=>{
	let CurrentBinding = await Utils.BuildQuery(`SELECT * FROM nusaBindings WHERE bindActive='Y' AND bindRole='${Role.id}'`);
	if (CurrentBinding.length !== 0){
		await Utils.BuildQuery(`UPDATE nusaBindings SET bindActive='N' WHERE bindRole='${Role.id}'`);
	}
});

Client.login(Settings.nusa);
