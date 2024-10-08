const { REST, Routes } = require('discord.js');
const { Utils } = require('../class/Utils');
const config = require('../config');

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = async (client) => {
	const rest = new REST({ version: '10' }).setToken(
		process.env.CLIENT_TOKEN || config.client.token,
	);

	try {
		Utils.log('Started loading application commands... (this might take minutes!)', 'info');

		const guildId = process.env.GUILD_ID || config.development.guild;

		if (config.development && config.development.enabled && guildId) {
			if (!Utils.isSnowflake(guildId)) {
				Utils.log('Guild ID is missing. Please set it in .env or config file or disable development in the config', 'err');
				return;
			}

			await rest.put(
				Routes.applicationGuildCommands(process.env.CLIENT_ID || config.client.id, guildId), {
					body: client.applicationcommandsArray,
				},
			);

			Utils.log(`Successfully loaded application commands to guild ${guildId}.`, 'done');
		}
		else {
			await rest.put(
				Routes.applicationCommands(process.env.CLIENT_ID || config.client.id), {
					body: client.applicationcommandsArray,
				},
			);

			Utils.log('Successfully loaded application commands globally to Discord API.', 'done');
		}
	}
	catch (e) {
		Utils.log(`Unable to load application commands to Discord API: ${e.message}`, 'err');
	}
};
