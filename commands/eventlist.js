const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { TBAToken } = require('../config.json');
const { parseFirstTime } = require('../functions.js');
const { default: fetch } = require('node-fetch');

module.exports = {
	name: 'eventlist', // command name
	description: 'Gets the events a team is registered for', // command description
	args: true, // needs arguments?
	usage: '<season, 2015+> <team number>', // usage instructions w/o command name and prefix
	cooldown: 3, // cooldown in seconds, defaults to 3
	myPermissions: [], // permissions required for bot
	ownerOnly: false, // need to be the owner? delete line if no
	disabled: false, // command disabled to all? delete line if no
	data: new SlashCommandBuilder()
		.setName('eventlist')
		.setDescription('Gets the events a team is registered for')
		.setDefaultMemberPermissions() // Set permissions required, separate multiple with bitwise OR
		.setDMPermission(true) // allow running in a DM
		.addIntegerOption(option =>
			option.setName('season')
				.setDescription('The season you want the info for.')
				.setRequired(true)
				.setMinValue(2015))
		.addIntegerOption(option =>
			option.setName('team')
				.setDescription('The team you want the events for.')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(9999)),

	async execute(interaction) { // inside here command stuff
		await interaction.deferReply();
		const season = interaction.options.getInteger('season') ?? new Date().getFullYear();
		const team = interaction.options.getInteger('team');
		const response = await fetch(`https://www.thebluealliance.com/api/v3/team/frc${team}/events/${season}`, {
			headers: {
				'X-TBA-Auth-Key': TBAToken,
			},
			method: 'Get',
		});
		if (response.status !== 200) return interaction.editReply({ content: 'Ohnoes! Something went wrong! Check your input(s) and try again!' });
		const responseParsed = await response.json();
		const events = [];
		await responseParsed.forEach(event => {
			events.push(`### [${event.name}](${event.website})\n**Event code:** ${event.first_event_code}\n**Starts on:** <t:${parseFirstTime(event.start_date + 'T00:00:00').secondsPastEpoch}:D>\n**Type:** ${event.event_type_string}\n**Location:** [${event.address}](${event.gmaps_url})`);
		});
		const seasonSummary = new EmbedBuilder()
			.setTitle('Events for ' + team)
			.setDescription(events.join('\n'))
			.setFooter({ text: `Team: ${team}, Season: ${season}` })
			.setColor('Random');
		interaction.editReply({ embeds: [seasonSummary] });
	},
};