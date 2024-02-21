module.exports = {
	customId: 'modal-example',
	/**
     *
     * @param {ExtendedClient} client
     * @param {ModalSubmitInteraction} interaction
     */
	async run(client, interaction) {
		const nameInput = interaction.fields.getTextInputValue('name');

		await interaction.reply({
			content: `Hey **${nameInput}**, what's up?`,
		});
	},
};
