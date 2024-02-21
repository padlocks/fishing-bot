module.exports = {
	structure: {
		name: 'nsfw',
		description: 'Nsfw Command',
		aliases: ['ns'],
		permissions: 'SendMessages',
		cooldown: 5000,
		nsfw: true,
	},
	/**
   * @param {ExtendedClient} client
   * @param {Message<true>} message
   * @param {string[]} args
   */
	async run(client, message, _) {
		await message.reply({
			content: 'NSFW Command',
		});
	},
};
