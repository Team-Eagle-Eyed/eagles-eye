const fs = require('fs');

/**
	* Logs a command usage to the usage file.
	* @param { JSON } command - If no command can be provided, use `{ name: "name" }`
*/
function logUsage(command) {
	const usage = JSON.parse(fs.readFileSync('./usage.json', 'utf8'));
	usage[command.name] = usage[command.name] ? usage[command.name] + 1 : 1;
	fs.writeFileSync('./usage.json', JSON.stringify(usage, null, 4));
}

/**
	* Reloads the config file into the process
*/
async function refreshConfig() {
	try {
		const newConfig = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
		if (process.haroldConfig) {
			await delete process.haroldConfig;
		}
		process.haroldConfig = newConfig;
		console.log('Refreshed config!');
	}
	catch (error) {
		return error;
	}
}

function parseFirstTime(time) {
	const parsedTime = new Date(time);
	return {
		parsedTime: parsedTime,
		secondsPastEpoch: Math.round(parsedTime.getTime() / 1000),
		timeString: `<t:${Math.round(parsedTime.getTime() / 1000)}:F>`,
	};
}

module.exports = { logUsage, refreshConfig, parseFirstTime };