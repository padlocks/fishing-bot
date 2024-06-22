/* eslint-disable no-mixed-spaces-and-tabs */
const config = require('../../config');
const { log } = require('../../util/Utils');
const { Interaction } = require('../../class/Interaction');
const { Interaction: InteractionSchema } = require('../../schemas/InteractionSchema');
const { Command } = require('../../schemas/CommandSchema');

module.exports = {
	event: 'interactionCreate',
	/**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Interaction} interaction
     * @returns
     */
	run: async (client, interaction) => {
		if (interaction.isCommand()) return;
		const componentPermission = async (component) => {
			if (component.options?.public === false && interaction.user.id !== interaction.message.interaction.user.id) {
				await interaction.reply({
					content:
                        config.messageSettings.notHasPermissionComponent !== undefined &&
                        config.messageSettings.notHasPermissionComponent !== null &&
                        config.messageSettings.notHasPermissionComponent !== ''
                        	? config.messageSettings.notHasPermissionComponent
                        	: 'You do not have permission to use this component',
					ephemeral: true,
				});
				return false;
			}

			return true;
		};

		// get most recent command ran by that user
		const command = await Command.findOne({ user: interaction.user.id, type: 'command' })
			.sort('-time')
			.exec();
		
		const interactionId = command.chainedTo;
		const interactionObject = new Interaction(await InteractionSchema.findById(interactionId));

		if (interaction.isButton()) {
			const component = client.collection.components.buttons.get(interaction.customId);

			if (!component) return;

			if (!(await componentPermission(component))) return;

			try {
				const commandObject = new Command({
					user: interaction.user.id,
					command: interaction.customId,
					channel: interaction.channel.id,
					guild: interaction.guild.id,
					interaction: interaction.toJSON(),
					chainedTo: interactionId,
					type: 'component',
				});
				await commandObject.save();
				interactionObject.pushInteraction(commandObject);
				component.run(client, interaction, interactionObject);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}

		if (interaction.isAnySelectMenu()) {
			const component = client.collection.components.selects.get(interaction.customId);

			if (!component) return;

			if (!(await componentPermission(component))) return;

			try {
				const commandObject = new Command({
					user: interaction.user.id,
					command: interaction.customId,
					channel: interaction.channel.id,
					guild: interaction.guild.id,
					interaction: interaction.toJSON(),
					chainedTo: interactionId,
					type: 'component',
				});
				await commandObject.save();
				interactionObject.pushInteraction(commandObject);
				component.run(client, interaction, interactionObject);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}

		if (interaction.isModalSubmit()) {
			const component = client.collection.components.modals.get(interaction.customId);

			if (!component) return;

			try {
				const commandObject = new Command({
					user: interaction.user.id,
					command: interaction.customId,
					channel: interaction.channel.id,
					guild: interaction.guild.id,
					interaction: interaction.toJSON(),
					chainedTo: interactionId,
					type: 'component',
				});
				await commandObject.save();
				interactionObject.pushInteraction(commandObject);
				component.run(client, interaction, interactionObject);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}

		if (interaction.isAutocomplete()) {
			const component = client.collection.components.autocomplete.get(interaction.commandName);

			if (!component) return;

			try {
				component.run(client, interaction);
			}
			catch (error) {
				log(error, 'error');
			}

			return;
		}
	},
};
