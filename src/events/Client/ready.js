const { log } = require('../../class/Utils');
// const fs = require('fs');

module.exports = {
	event: 'ready',
	once: true,
	/**
     *
     * @param {ExtendedClient} _
     * @param {import('discord.js').Client<true>} client
     * @returns
     */
	run: (_, client) => {

		Utils.log('Logged in as: ' + client.user.tag, 'done');

		// const serverIds = ['1244064107834118244', '1244065421636931675'];

		// serverIds.forEach(async (serverId) => {
		// 	try {
		// 		const server = await client.guilds.fetch(serverId);
		// 		console.log(`Emojis in ${server.name}:`);

		// 		server.emojis.cache.forEach((emoji) => {
		// 			console.log(`${emoji.name}: ${emoji.url}`);
		// 			fs.appendFileSync('/Users/bee/Documents/Git/fishing-bot/src/scripts/emojis.txt', `${emoji.name}:${emoji.id}\n`);
		// 		});
		// 	}
		// 	catch (error) {
		// 		console.error(`Failed to fetch server with ID ${serverId}: ${error}`);
		// 	}
		// });

	},
};