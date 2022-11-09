// Setup our environment variables via dotenv
require('dotenv').config()

// Import relevant classes from discord.js
const { Client, GatewayIntentBits, } = require('discord.js');

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

  // Check the channel ID; Reply to threads only in a specific forum

  if (channel.parentId !== '1019663407915483176') return;

  channel.send({ 
    content: 
    'Thanks for posting, one of the <@&949961460384157746> or <@&986960430528331776> will address the matter as soon as possible'
  });
});

// Authenticate
client.login(process.env.TOKEN)




