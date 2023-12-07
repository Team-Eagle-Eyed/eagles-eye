module.exports = {
	name: 'ready', // name, duh
	once: true, // remove if false
	async execute(client) { // stuff to do
		console.info(`Ready at: ${client.readyAt}`);
		console.info('Harold Bot Copyright (C) 2021-Present John Gooden');
		console.info('Copyright info: https://github.com/TheHaroldBot/Harold/blob/main/LICENSE\n\n');
		client.user.setActivity('Go 8825!');
	},
};