module.exports = {
	structure: {
		name: 'ping',
		description: 'Replies with Pong!',
		aliases: ['p'],
		permissions: 'Administrator',
		cooldown: 5000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {Message<true>} message
     * @param {string[]} args
     */
	run: async (client, message) => {

		await message.reply({
			content: 'Pong! ' + client.ws.ping,
		});

	},
};
