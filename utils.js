const Discord   = require('discord.js');
const Roblox    = require('noblox.js');
const Mysql     = require('mysql');
const Axios     = require('axios').default;
const Cheerio   = require('cheerio');

const FileServ= require('fs');
const Enviroment= FileServ.existsSync("./DevEnvironment.json") ? require("./DevEnvironment.json") : require("./Environment.json");

const DBConfig  = {
  host     : Enviroment.mHost,
  user     : Enviroment.mUser,
  password : Enviroment.mPass,
  database : Enviroment.mDB
};

module.exports = {

    /* async function `BuildQuery`
     * Executes and returns a query from the RobloxNUSA Databases
     * 
     * @param Query : mysql query 
     * @return A resolved query promise;
     */
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

    /* async function `BuildEmbed`
     * Designs a Embed based on data.
     * 
     * @param Title : Header of the new embed
     * @param Desc : Description of the new embed 
     * @param Fields : ArrayList of EmbedArray's {name:"",value:"",inline:boolean}
     * @return A built Embed, ready to be sent elsewhere
     */
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

    /* async function `ReturnMessage`
     * Sends a embeded message with Title/Desc/Fields, and deletes the command message sent.
     * 
     * @param Message : Trigger message  
     * @param Title : Header of the new embed
     * @param Desc : Description of the new embed 
     * @param Fields : ArrayList of EmbedArray's {name:"",value:"",inline:boolean}
     * @return --------
     */
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

    /* async function `Sleep`
     * Creates a promise to create a asynchronous sleep function.
     * 
     * @param Message : Trigger message  
     * @return Unresolved Promise that should be await'ed in the calling function.
     */
    Sleep: async(SleepTime) => {
        return new Promise(resolve => {
            setTimeout(resolve, SleepTime)
        })
    },

    /* async function `asyncForEach`
     * Creates promises for each item in the array and runs the callback one-by-one.
     * 
     * @param array : Array that you want to use for the forEach loop
     * @param callback : Asynchonus function that you want ran per item in the `array`  
     * @return --------
     */
    asyncForEach: async(array, callback) =>{
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    },
    
    /* async function `NumberCompile`
     * Takes a array of numbers and converts them into shorthand. i.e. [1,2,3,6,9,10] -> "1-3,6,9-10"
     * 
     * @param Numbers : ArrayList of numbers
     * @return Shorthand string of numbers
     */
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

    /* async function `NumberExplode`
     * Takes a shorthand string of numbers and converts them into arraylist of numbers. i.e. "1-3,6,9-10" -> [1,2,3,6,9,10] 
     * 
     * @param StringTarget : Shorthand string of numbers
     * @return ArrayList of numbers
     */
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
    
    /* async function `ExternalLog`
     * Sends a webhooked embed detailing a log. 
     * 
     * @param Service : Shorthand string of numbers
     * @param Title : Header of the new embed
     * @param Log : Description of the new embed 
     * @return --------
     */
    ExternalLog: async(Service, Title, Log) => {
        let LogChannel = await Service.Client.channels.find(c=>c.id == Service.Enviroment.logChannel);
        let Embed = await module.exports.BuildEmbed(Title, Log, []);
        LogChannel.send(Embed);
    },

    /* async function `AxiosGet`
     * This returns the .data of a Axios.get in order to condense code in other areas. 
     * 
     * @param Url : URL you wish to get the data from
     * @return data from url
     */
    AxiosGet: async(Url) =>{
        let Result = await Axios.get(Url);
        return await Result.data;
    },

    /* async function `GetRobloxUser`
     * Grabs the active verification record from the database where the discordID is matched. 
     * 
     * @param DiscordID : Discord Client ID you want to reference
     * @return Query Result or false
     */
    GetRobloxUser: async(DiscordID) => {
        let Query = await module.exports.BuildQuery(`SELECT * FROM nusaDiscordUsers WHERE DiscordID='${DiscordID}' AND Status='Active'`);
        if (Query.length === 0) return false;
        return Query[0];
    },
    
    /* async function `GetUserBinds`
     * Grabs all bindings for a guild, and grabs all groups for a UserID, and then nest-checks to see what gets added/removed. 
     * 
     * @param RobloxID : Roblox ID you want to reference
     * @param GuildID : Discord Guild ID you want to reference
     * @return {Add:[?],Remove:[?]}
     */
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
    
    /* async function `ImmigrationCheck`
     * Checks for Immigration Ban, then grabs their JoinData and sees if they have been a Roblox User for 30 days. 
     * 
     * @param UserID : Roblox UserID of the user you wish to check immigration attempt on.
     * @return [success_boolen, errormessage if exists] (as arraylist)
     */
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

    /* async function `UserSearch`
     * Attempts to detect what type of information was supplied and give the correct result. 
     * 
     * @param Information : Either Roblox UserID, Roblox Username, or Discord Client ID
     * @return {UserID: ?, Username: ?} OR false
     */
    UserSearch: async(Information) =>{
        let IdAttempt     = ((parseInt(Information) && Information.length < 10) ? await module.exports.AxiosGet(`https://api.roblox.com/users/${Information}`) : false);
        let NameAttempt   = (typeof(Information) == "string" ? await module.exports.AxiosGet(`https://api.roblox.com/users/get-by-username?username=${Information}`) : false);
        let DiscAttempt   = ((parseInt(Information) && Information.length > 10) ? await module.exports.GetRobloxUser(Information) : false);

        if (IdAttempt && IdAttempt.errorMessage === undefined)      return {UserID:IdAttempt.Id, Username: IdAttempt.Username};
        if (NameAttempt && NameAttempt.errorMessage === undefined)  return {UserID:NameAttempt.Id, Username: NameAttempt.Username};
        if (DiscAttempt)                                            return  {UserID:DiscAttempt.RobloxID, Username: DiscAttempt.RobloxName};
        return false;
    },

    /* async function `GroupSearch`
     * Grabs the Roblox Group data from the rAPI. 
     * 
     * @param UserID : Roblox userID
     * @return GroupData OR false
     */
    GroupSearch: async(UserID) =>{
        let IdAttempt     = (parseInt(Information) ? await module.exports.AxiosGet(`https://api.roblox.com/groups/${UserID}`) : false);
        if (IdAttempt && IdAttempt.errorMessage === undefined) return IdAttempt;
        return false;
    },

    /* async function `ChangeRank`
     * Sets the users rank.
     * 
     * @param User : Either Roblox UserID, Roblox Username, or Discord Client ID
     * @param GroupID : Roblox Group ID where you wish to do the rank change.
     * @param Role : Role Name of the target role.
     * @return true OR error string
     */
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