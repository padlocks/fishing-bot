const { default: mongoose } = require('mongoose');
const { Interaction: InteractionSchema } = require('../schemas/InteractionSchema');
const { Command } = require('../schemas/CommandSchema');

class Interaction {
	constructor(data) {
		this.interaction = new InteractionSchema(data);
	}

	save() {
		return this.interaction.save();
	}

	async getId() {
		return this.interaction._id;
	}

	async getInteractionId() {
		return this.interaction.interaction.id;
	}

	async getCommand() {
		return this.interaction.command;
	}

	async getUser() {
		return this.interaction.user;
	}

	async getTime() {
		return this.interaction.time;
	}

	async getChannel() {
		return this.interaction.channel;
	}

	async getGuild() {
		return this.interaction.guild;
	}

	async getType() {
		return this.interaction.type;
	}

	async getCommand() {
		return this.interaction.command;
	}

	async setCommand(command) {
		this.interaction.command = command;
		return this.interaction.save();
	}

	async getInteractions() {
		return this.interaction.interactions;
	}

	async pushInteraction(interaction) {
		this.interaction.interactions.push(interaction);
		return this.interaction.save();
	}

	async getStatus() {
		return this.interaction.status;
	}

	async setStatus(status) {
		this.interaction.status = status;
		return this.interaction.save();
	}

	async getStatusMessage() {
		return this.interaction.statusMessage;
	}

	async setStatusMessage(message) {
		this.interaction.statusMessage = message;
		return this.interaction.save();
	}
}

const findMostRecentInteraction = async (userId) => {
	const command = await Command.findOne({ user: userId, type: 'command' })
		.sort('-time')
		.exec();
		
	const interactionId = command.chainedTo;
	const analyticsObject = new Interaction(await InteractionSchema.findById(interactionId));

	return analyticsObject;
};

const generateCommandObject = async (interaction, analyticsObject) => {
	let title;
	if (interaction.isCommand()) title = interaction.commandName;
	else title = interaction.customId;

	const commandObject = new Command({
		user: interaction.user.id,
		command: title,
		channel: interaction.channel.id,
		guild: interaction.guild.id,
		interaction: interaction.toJSON(),
		chainedTo: await analyticsObject.getId(),
		type: interaction.isCommand() ? 'command' : 'component',
	});
	await commandObject.save();
	analyticsObject.pushInteraction(commandObject);
};

module.exports = { Interaction, findMostRecentInteraction, generateCommandObject };