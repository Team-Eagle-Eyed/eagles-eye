const { EmbedBuilder } = require('discord.js');

module.exports = {
	name: 'guildCreate',
	once: true,
	async execute(guild) {
		const introembed = new EmbedBuilder()
			.setTitle('Hiya!')
			.setColor('Random')
			.setDescription('Thank you for adding me to your server!\nRun `/help` to get my commands!');
		const owner = await guild.fetchOwner();
		try {
			await owner.send({ embeds: [introembed] });
		}
		catch (error) {
			console.error(`
				Error sending into embed to user ${owner.id} from server ${guild.id}:
				${error}
			`);
		}
		console.info(`I just joined a new server! I am now a member of ${guild.name}`);
	},
};
