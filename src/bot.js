import dotenv from 'dotenv';
dotenv.config();
import { Client, Intents } from 'discord.js';
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
const prefix = process.env.prefix;
import f from 'fs';
const fs = f.promises;
import path from 'path';
const __dirname = path.join(path.resolve(), 'src');

client.commands = new Map();
client.login(process.env.bot_token);

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in.`);
  client.user.setActivity('Being a bot');
});

client.on('message', function (message) {
  if (message.author.bot) return;
  if (message.content.charAt(0) !== prefix) return;
  let cmdArgs = message.content
    .substring(message.content.indexOf(prefix) + 1)
    .split(new RegExp(/\s+/));
  let cmdName = cmdArgs.shift();
  console.log(cmdName);
  if (client.commands.get(cmdName)) {
    client.commands.get(cmdName).run(client, message, cmdArgs);
  } else {
    return;
  }
});

client.on('guildMemberAdd', function (member) {
  let role = member.guild.roles.cache.find((r) => r.name === `Member`);
  if (!role) {
    return;
  } else {
    member.roles.add(role);
  }
});

(async function registerCommands(dir = 'commands') {
  let files = await fs.readdir(path.join(__dirname, dir));
  for (let file of files) {
    let stat = await fs.lstat(path.join(__dirname, dir, file));
    if (stat.isDirectory()) registerCommands(path.join(dir, file));
    else {
      try {
        if (file.endsWith('.js')) {
          let cmdName = file.substring(0, file.indexOf('.js'));
          let cmdModule = await import(`./commands/${file}`);
          console.log(cmdModule);
          console.log(cmdName);
          client.commands.set(cmdName, cmdModule);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  //console.log(client.commands);
})();
