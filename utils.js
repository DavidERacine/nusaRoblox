const Discord   = require('discord.js');
const Roblox    = require('noblox.js');
const Mysql     = require('mysql');
const Settings  = require('./Settings.json');
const Axios     = require('axios').default;
const Cheerio   = require('cheerio');

const DBConfig  = {
  host     : Settings.mHost,
  user     : Settings.mUser,
  password : Settings.mPass,
  database : Settings.mDB
};
const LogWebhook = new Discord.WebhookClient("699206140927410206","zLUZM0XHYzMFPa-VCOEvxlhS01iHomc38DzeZo038RdfZ2DrHFu93fYSAbex-FaCMUtK");

module.exports = {
    BuildQuery: async(Query) => {
        const sqlConn = await Mysql.createConnection(DBConfig);
        sqlConn.connect();
        var resolvedPromise = new Promise((resolve) => {
                sqlConn.query(Query, async(err, result) => {
                    if (err) { module.exports.ExternalLog(null, "RolePurge Error", `${err}`) };
                    resolve(result);
                });
            });
        sqlConn.end();
        return resolvedPromise;
    },

    BuildEmbed: async(Title, Desc, Fields) => {
        let Embed = await new Discord.RichEmbed()
        .setTitle(Title)
        .setDescription(Desc)
        .setColor('#0099ff')
        .setTimestamp()
        .setFooter('RobloxNUSA-WS', 'https://robloxnusa.org/wp-content/uploads/2020/01/usSeal-e1578990242943.png');
        await module.exports.asyncForEach(Fields, async(Field)=>{
            Embed.addField(Field.name, Field.value, (Field.inline === undefined ? false : Field.inline));
        });
        return Embed;
    },

    ReturnMessage: async( Message, Title, Description, Fields) => {
        const Embed = await module.exports.BuildEmbed(Title, Description, (Fields ? Fields : []));
        await Message.reply(Embed).then( async(Receipt) => {
            await module.exports.Sleep(10000);
            if (Receipt.deletable) Receipt.delete();
            if (Message.deletable) Message.delete();
        }).catch( async(err) => {
            module.exports.ExternalLog(`ReturnMessage Error`,`${err}`);
        });
    },

    Sleep: async(SleepTime) => {
        return new Promise(resolve => {
            setTimeout(resolve, SleepTime)
        })
    },

    asyncForEach: async(array, callback) =>{
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    
    NumberCompile: async(Numbers) => {
        const Output = []
        let RangeStart
        for (let i = 0; i < Numbers.length; i++) {
            const CurNumber = Numbers[i];
            const NextNumber= Numbers[i + 1];
            if (RangeStart != null && (NextNumber - CurNumber !== 1 || NextNumber == null)) {
                Output.push(`${RangeStart}-${CurNumber}`);
                RangeStart = null;
            } else if (NextNumber == null || NextNumber - CurNumber !== 1) {
                Output.push(`${CurNumber}`);
            } else if (RangeStart == null) {
                RangeStart = CurNumber;
            }
        }
        return Output.join(', ');
    },

    NumberExplode: async(StringTarget) => {
        const Numbers = [];
        const UnexplodedNumbers = StringTarget.split(',');
        for (const Num of UnexplodedNumbers) {
            const RangeMatch = Num.match(/(\d+)-(\d+)/);
            const NewNumber = parseInt(Num);
            if (RangeMatch) {
                const Start = parseInt(RangeMatch[1]);
                const Stop = parseInt(RangeMatch[2]);
                if (Start && Stop) {
                    for (let i = Start; i <= Stop; i++) {
                        Numbers.push(i);
                    }
                }
            } else if (NewNumber != null) {
                Numbers.push(NewNumber);
            }
        }
        return Numbers;
    },
    
    ExternalLog: async(Main, Title, Log) => {
        let Embed = await module.exports.BuildEmbed(Title, Log, []);
        LogWebhook.send(Embed);
        return;
    },

    AxiosGet: async(Url) =>{
        let Result = await Axios.get(Url);
        return await Result.data;
    },

    GetRobloxUser: async(DiscordID) => {
        let Query = await module.exports.BuildQuery(`SELECT * FROM nusaDiscordUsers WHERE DiscordID='${DiscordID}' AND Status='Active'`);
        if (Query.length === 0) return false;
        return Query[0];
    },
    
    GetUserBinds: async(RobloxID, GuildID) => {
        let RobloxGroups = await Axios.get(`https://api.roblox.com/users/${RobloxID}/groups`);
        RobloxGroups = await RobloxGroups.data;

        let GuildBindings= await module.exports.BuildQuery(`SELECT * FROM nusaBindings WHERE bindGuild='${GuildID}' AND bindActive='Y'`)
        let RoleData = {Add:[],Remove:[]};

        await module.exports.asyncForEach(GuildBindings, async(Binding)=>{
            let rGroups = await RobloxGroups.filter(g=>g.Id==Binding.bindGroup);
            if (rGroups.length === 0) return RoleData.Remove.push(Binding.bindRole);

            let ExpandedRankNumbers = await module.exports.NumberExplode(Binding.bindNumbers);
            let GoodBind = false;

            await module.exports.asyncForEach(ExpandedRankNumbers, async(GoodNumber)=>{
                if (Binding.bindNumbers == rGroups[0].Rank){
                    GoodBind = true;
                }
            });

            if (GoodBind == true){
                RoleData.Add.push(Binding.bindRole);
            }else{
                RoleData.Remove.push(Binding.bindRole);
            }
        });
        return (RoleData);
    },
    
    ImmigrationCheck: async(UserID)=>{
        let ImmigrationBan = await module.exports.BuildQuery(`SELECT * FROM nusaImmigrationBans WHERE userid='${UserID}'`);
        if (ImmigrationBan.length !== 0) return [false, `Immigration Ban | ${ImmigrationBan[0].reason}`];

        let Profile = await module.exports.AxiosGet(`https://www.roblox.com/users/${UserID}/profile`);
        Profile = await Profile.toString();
        let ProfileObject = Cheerio.load(Profile);
        let JoinDate = await ProfileObject(`p:contains('Join Date')`).next().html();      
        if (!JoinDate) JoinDate = await ProfileObject(`p:contains('Join Date')`).next().attr(`data-date-time-i18n-value`)
        if (!JoinDate) JoinDate = await ProfileObject(`p:contains('Join Date')`).first().html();
        if (!JoinDate) return console.log('Profile Data Changed.');
        JoinDate = new Date(JoinDate);
        let RobloxAge = (new Date() - JoinDate) / (1000 * 60 * 60 * 24);
        
        if (RobloxAge >= 30) {
            return [true];
        }else{
            module.exports.BuildQuery(`INSERT INTO nusaImmigrationBans (userid, reason, agent) VALUES ('${UserID}','Age','Bot')`);
            return [false, `Immigration Ban | Age`];
        }
    },

    UserSearch: async(Information) =>{
        let IdAttempt     = ((parseInt(Information) && Information.length < 10) ? await module.exports.AxiosGet(`https://api.roblox.com/users/${Information}`) : false);
        let NameAttempt   = (typeof(Information) == "string" ? await module.exports.AxiosGet(`https://api.roblox.com/users/get-by-username?username=${Information}`) : false);
        let DiscAttempt   = ((parseInt(Information) && Information.length > 10) ? await module.exports.GetRobloxUser(Information) : false);

        if (IdAttempt && IdAttempt.errorMessage === undefined)      return {UserID:IdAttempt.Id, Username: IdAttempt.Username};
        if (NameAttempt && NameAttempt.errorMessage === undefined)  return {UserID:NameAttempt.Id, Username: NameAttempt.Username};
        if (DiscAttempt)                                            return  {UserID:DiscAttempt.RobloxID, Username: DiscAttempt.RobloxName};
        return false;
    },

    GroupSearch: async(Information) =>{
        let IdAttempt     = (parseInt(Information) ? await module.exports.AxiosGet(`https://api.roblox.com/groups/${Information}`) : false);
        if (IdAttempt && IdAttempt.errorMessage === undefined) return IdAttempt;
        return false;
    },

    ChangeRank: async(User, GroupID, Role) => {
        let UserResult = await module.exports.UserSearch(User);
        if (!UserResult) return "No user information found.";
        await Roblox.setRank({group: GroupID, target: UserResult.UserID, name: Role}).then(async(Resp)=>{
            //console.log(Resp);
            return true;
        }).catch(async(err)=>{
            module.exports.ExternalLog(null, `Change Rank Error `, `User: ${User} | GroupID: ${GroupID} | Role: ${Role} \n ${err}`);
            return err;
        });
    }
    
}