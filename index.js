// Setup our environment variables via dotenv
require('dotenv').config();
 
// Cron job needed to check for inactive threads
const cron = require('node-cron');
 
// Import relevant classes from discord.js
const { Client, GatewayIntentBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
 
// parent channel id where threads are to be looked up for
const serverId = '895029566685462578';
const parentChannelId = '1019663407915483176';
 
// Roles to be mentioned
const supportRoleId = '986960430528331776';
const moderatorRoleId = '986960430528331776';
 
//
const supportThreadIdentifier = 'thread';
 
//
const ResponseTypes = {
	YES: 'yes',
	NO: 'no'
};
 
// keeping track where the messages have been sent already
const alreadyTracking = [];
 
// Instantiate a new client with some necessary parameters.
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
 
// Notify progress
client.on(Events.ClientReady, () => {
	console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on(Events.ThreadCreate, async (channel) => {
	// Check the form title or ID; Reply to threads only in a specific forum
	if (channel.parentId !== parentChannelId) return;
 
	channel.send({
		content: `Thanks for posting, one of the <@&${moderatorRoleId}> or <@&${supportRoleId}> will address the matter as soon as possible 🙇‍♂️`
	});
});
 
client.on(Events.InteractionCreate, async (interaction) => {
	// We are only listening to button type interactions
	if (!interaction.isButton()) return;
 
	//
	const [identifier, channelId, response] = interaction.customId.split('-');
 
	// Must be our support specific interaction
	if (identifier !== supportThreadIdentifier) return;
 
	//
	const guild = await client.guilds.fetch(serverId);
	if (!guild) return;
 
	//
	const channel = await guild.channels.fetch(parentChannelId);
	if (!channel) return;
 
	// Channel must exists and must be of Forum type
	if (channel.type !== ChannelType.GuildForum) return;
 
	//
	const thread = channel.threads.cache.find((x) => x.id === channelId);
	if (!thread) return;
 
	//
	if (thread.locked || thread.archived) return;
 
	//
	if (response === ResponseTypes.YES) {
		await interaction.reply({ content: "The post has been closed as per the Original Poster's request." });
		await thread.setArchived(true);
	}
 
	if (response === ResponseTypes.NO) {
		// Send message to the support team again
		await interaction.reply({ content: `Hi <@&${moderatorRoleId}> and <@&${supportRoleId}>. Please help our user with the query above 🙏` });
	}
});
 
// Check threads every at 0 minute every hour
cron.schedule('*/1 * * * *', async () => {
	const hoursForInactive = 48;
 
	const guild = await client.guilds.fetch(serverId);
	if (!guild) return;
 
	const channel = await guild.channels.fetch(parentChannelId);
	if (!channel) return;
 
	// Channel must exists and must be of Forum type
	if (channel.type !== ChannelType.GuildForum) return;
 
	const allThreads = await channel.threads.fetchActive();
	const staleThreads = [];
 
	for (const singleThread of Array.from(allThreads.threads.values())) {
		if (singleThread.locked || singleThread.archived) continue;
 
		// If already tracking, we need to do nothing
		if (alreadyTracking.includes(singleThread.id)) continue;
 
		// Fetching latest message in the thread
		const lastMessage = (await singleThread.messages.fetch({ limit: 1 })).first();
		if (!lastMessage) continue;
 
		// Checking if there has been any update
		const isStale = lastMessage.createdTimestamp + 60 * 60 * hoursForInactive * 1000 < Date.now();
		if (!isStale) continue;
 
		staleThreads.push(singleThread);
	}
 
	// Going through all the threads now
	for (const thread of Array.from(staleThreads.values())) {
		// Asking if stale
		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`${supportThreadIdentifier}-${thread.id}-${ResponseTypes.YES}`)
				.setLabel('Yes')
				.setStyle(ButtonStyle.Success),
			new ButtonBuilder().setCustomId(`${supportThreadIdentifier}-${thread.id}-${ResponseTypes.NO}`).setLabel('No').setStyle(ButtonStyle.Danger)
		);
 
		// Asking if thread can be closed.
		await thread.send({
			content: `Hi <@${thread.ownerId}> 👋\nThere has been no activity in the past ${hoursForInactive} hours. Should I close the post?`,
			components: [row]
		});
 
		alreadyTracking.push(thread.id);
	}
});
 
// Authenticate
client.login(process.env.DISCORD_TOKEN);




