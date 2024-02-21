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
	async run(client, message, _) {
		await message.reply({
			content: 'Pong! ' + client.ws.ping,
		});
	},
};
