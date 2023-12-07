const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, generateDependencyReport } = require('@discordjs/voice');

module.exports = {
	name: 'stream', // command name
	description: 'Streams a FIRST webcast to Discord', // command description
	args: true, // needs arguments?
	usage: '<event>', // usage instructions w/o command name and prefix
	cooldown: 30, // cooldown in seconds, defaults to 3
	myPermissions: [], // permissions required for bot
	ownerOnly: true, // need to be the owner? delete line if no
	disabled: true, // command disabled to all? delete line if no
	data: new SlashCommandBuilder()
		.setName('stream')
		.setDescription('Streams a FIRST webcast to Discord')
		.setDMPermission(true), // allow running in a DM

	async execute(interaction) { // inside here command stuff
		console.log(generateDependencyReport());
		interaction.reply('On my way!');

		const stream = ytdl('https://www.youtube.com/watch?v=vrOjy-v5JgQ', { // https://www.youtube.com/watch?v=vrOjy-v5JgQ video
			filter:'audioonly',
		});

		const resource = createAudioResource(stream);

		const player = createAudioPlayer();

		const connection = joinVoiceChannel({
			channelId: '1171990271651754034', // temp
			guildId: '788813687283646515', // temp
			adapterCreator: interaction.guild.voiceAdapterCreator, // temp
		});
		const subscription = connection.subscribe(player);

		player.play(resource);


		if (subscription) {
			// Unsubscribe after 5 seconds (stop playing audio on the voice connection)
			setTimeout(() => subscription.unsubscribe(), 29_000);
			setTimeout(() => connection.destroy(), 30_000);
		}
	},
};