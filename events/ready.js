module.exports = {
	name: 'ready', // name, duh
	once: true, // remove if false
	async execute(client) { // stuff to do
		console.info(`Ready at: ${client.readyAt}`);
		client.user.setActivity('Go 8825!');
	},
};