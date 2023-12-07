const { Collection } = require('discord.js');
const { client } = require('./client.js');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
const { token } = require('./config.json');
const { refreshConfig } = require('./functions.js');

client.commands = new Collection();
client.cooldowns = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const buttonFiles = fs.readdirSync('./buttons').filter(file => file.endsWith('.js'));
const selectMenuFiles = fs.readdirSync('./selectMenus').filter(file => file.endsWith('.js'));

for (const file of buttonFiles) {
	const buttonfile = require(`./buttons/${file}`);
	client.buttons.set(buttonfile.customId, buttonfile);
}

for (const file of selectMenuFiles) {
	const selectMenuFile = require(`./selectMenus/${file}`);
	client.selectMenus.set(selectMenuFile.customId, selectMenuFile);
}

for (const file of commandFiles) {
	const commandfile = require(`./commands/${file}`);
	client.commands.set(commandfile.name, commandfile);
}

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once === true) {
		client.once(event.name, (...args) => event.execute(...args));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}


// client.on('debug', console.debug);
client.on('warn', console.warn);
client.on('error', console.error);
client.rest.on('rateLimited', console.warn);


rl.on('line', async (input) => {
	try {
		await eval(input);
	}
	catch (error) {
		console.error(error);
	}
});

refreshConfig();

client.login(token).then(() => {
	console.info('Logged in.');
});