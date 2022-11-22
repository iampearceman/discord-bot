// Setup our environment variables via dotenv
require('dotenv').config()

// Import relevant classes from discord.js
const { Client, GatewayIntentBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events} = require('discord.js');

// parent channel id where threads are to be looked up for
const serverId = '895029566685462578';
const parentChannelId = '1019663407915483176';

// Roles to be mentioned
const supportRoleId = '986960430528331776';
const moderatorRoleId = '949961460384157746';

// Instantiate a new client with some necessary parameters.
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Notify if the bot is online
client.on('ready', function(e){
    console.log(`Logged in as ${client.user.tag}!`)
})

//Functionality
client.on('threadCreate', async (channel) => {
	// Check the form title or ID; Reply to threads only in a specific forum
	if (channel.parentId !== parentChannelId) return;
 
	channel.send({
		content: `Thanks for posting, one of the <@&${moderatorRoleId}> or <@&${supportRoleId}> will address the matter as soon as possible 🙇‍♂️`
	});
});

// Authenticate
client.login(process.env.TOKEN)
