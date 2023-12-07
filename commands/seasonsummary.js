const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { firstToken } = require('../config.json');
const { parseFirstTime } = require('../functions.js');
const { default: fetch } = require('node-fetch');

module.exports = {
	name: 'seasonsummary', // command name
	description: 'Gets the season summary', // command description
	args: true, // needs arguments?
	usage: '<season, 2015+>', // usage instructions w/o command name and prefix
	cooldown: 3, // cooldown in seconds, defaults to 3
	myPermissions: [], // permissions required for bot
	ownerOnly: false, // need to be the owner? delete line if no
	disabled: false, // command disabled to all? delete line if no
	data: new SlashCommandBuilder()
		.setName('seasonsummary')
		.setDescription('Gets the season summary')
		.setDefaultMemberPermissions() // Set permissions required, separate multiple with bitwise OR
		.setDMPermission(true) // allow running in a DM
		.addIntegerOption(option =>
			option.setName('season')
				.setDescription('The season you want a summary for. Leave blank for current year.')
				.setRequired(false)
				.setMinValue(2015)),

	async execute(interaction) { // inside here command stuff
		await interaction.deferReply();
		const season = interaction.options.getInteger('season') ?? new Date().getFullYear();
		const response = await fetch(`https://frc-api.firstinspires.org/v3.0/${season}`, {
			headers: {
				'Authorization': `Basic ${firstToken}`,
				'If-Modified-Since': '',
			},
			method: 'Get',
		});
		if (response.status !== 200) return interaction.editReply({ content: 'Ohnoes! Something went wrong! Check your input(s) and try again!' });
		const responseParsed = await response.json();
		const events = [];
		responseParsed.frcChampionships.forEach(event => {
			events.push(`### ${event.name}\n**Starts on:** ${parseFirstTime(event.startDate).timeString}\n**Location:** ${event.location}`);
		});
		const seasonSummary = new EmbedBuilder()
			.setTitle('Season summary: ' + responseParsed.gameName)
			.setDescription(`**Kickoff:** ${parseFirstTime(responseParsed.kickoff).timeString}\n**New teams start at:** ${responseParsed.rookieStart}\n**Active teams:** ${responseParsed.teamCount}\n\n## Championships:\n` + events.join('\n'))
			.setFooter({ text: `Season: ${season}` })
			.setColor('Random');
		interaction.editReply({ embeds: [seasonSummary] });
	},
};