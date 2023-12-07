const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { firstToken } = require('../config.json');
const { parseFirstTime } = require('../functions.js');
const { default: fetch } = require('node-fetch');

module.exports = {
	name: 'schedule', // command name
	description: 'Gets event schedule for a FIRST event.', // command description
	args: true, // needs arguments?
	usage: '<season, 2015+> <eventcode, EX MOLee for cowtown. Can be found on the first website.> <level> [teamnumber, optional for filtering] [start, what match to start the list from.]', // usage instructions w/o command name and prefix
	cooldown: 3, // cooldown in seconds, defaults to 3
	myPermissions: [], // permissions required for bot
	ownerOnly: false, // need to be the owner? delete line if no
	disabled: false, // command disabled to all? delete line if no
	data: new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Gets event schedule for a FIRST event.')
		.setDefaultMemberPermissions() // Set permissions required, separate multiple with bitwise OR
		.setDMPermission(true) // allow running in a DM
		.addIntegerOption(option =>
			option.setName('season')
				.setDescription('The season for the event you want information on.')
				.setRequired(true)
				.setMinValue(2015))
		.addStringOption(option =>
			option.setName('eventcode')
				.setRequired(true)
				.setDescription('The event code for the event you want information on.'))
		.addStringOption(option =>
			option.setName('level')
				.setDescription('Tournament level for desired match schedule.')
				.setRequired(true)
				.addChoices(
					{
						name: 'Qualificaiton',
						value: 'Qualification',
					},
					{
						name: 'Playoffs',
						value: 'Playoff',
					},
				))
		.addIntegerOption(option =>
			option.setName('teamnumber')
				.setDescription('Optional to search only for matches with team number')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(9999))
		.addIntegerOption(option =>
			option.setName('start')
				.setDescription('From which match to start the list.')
				.setRequired(false)
				.setMinValue(1)),

	async execute(interaction) { // inside here command stuff
		await interaction.deferReply();
		const season = interaction.options.getInteger('season');
		const event = interaction.options.getString('eventcode');
		const level = interaction.options.getString('level');
		const teamNumber = interaction.options.getInteger('teamnumber');
		const start = interaction.options.getInteger('start') ?? 1;
		let end = start + 9;
		if (teamNumber) end = undefined;
		const response = await fetch(`https://frc-api.firstinspires.org/v3.0/${season}/schedule/${event}?tournamentLevel=${level}&teamNumber=${teamNumber ?? ''}&start=${start ?? ''}&end=${end ?? ''}`, {
			headers: {
				'Authorization': `Basic ${firstToken}`,
				'If-Modified-Since': '',
			},
			method: 'Get',
		});
		if (response.status === 404) return interaction.editReply({ content: 'Ohnoes! We couldn\'t find that event! Are you sure you entered the correct information?' });
		if (response.status === 304) return interaction.editReply({ content: 'Ohnoes! No results passed the filter! Are you sure the team number is correct?' });
		if (response.status !== 200) return interaction.editReply({ content: 'Ohnoes! Something went wrong! Check your input(s) and try again!' }), console.log(response.status);
		const responseParsed = await response.json();
		const matchScheduleDescription = [];
		await responseParsed.Schedule.forEach(match => {
			const teams = [];
			match.teams.forEach(team => {
				if (!team.surrogate) {
					if (team.teamNumber === teamNumber) {
						teams.push(`**${team.station}: ${team.teamNumber}**`);
					}
					else {
						teams.push(`${team.station}: ${team.teamNumber}`);
					}
				}
			});
			matchScheduleDescription.push(`## ${match.description}\nStarts at: ${parseFirstTime(match.startTime).timeString}\n### Teams:\n${teams.join('\n')}`);
		});
		const matchSchedule = new EmbedBuilder()
			.setTitle(`${level} match schedule for ${event}${teamNumber ? ', filtered for team ' + teamNumber : ''}:`)
			.setDescription(matchScheduleDescription.join('\n') + '\n\nMax 10 matches shown. Specify a start or add a team filter to see more.'.substring(0, 4095))
			.setFooter({ text: `Season: ${season}, Event code: ${event}, Level: ${level}, Start from: ${start}${teamNumber ? ', Team: ' + teamNumber : ''}` })
			.setColor('Random');
		interaction.editReply({ embeds: [matchSchedule] });
	},
};