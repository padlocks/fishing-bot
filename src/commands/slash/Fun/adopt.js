const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUser } = require('../../../util/User');
const { Pet } = require('../../../class/Pet');
const { FishData, Fish } = require('../../../schemas/FishSchema');
const { Aquarium } = require('../../../schemas/HabitatSchema');
const { capitalizeWords } = require('../../../util/Utils');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('adopt')
		.setDescription('Adopt a fish!')
		.addStringOption((option) =>
			option
				.setName('species')
				.setDescription('Species of the fish you wish to adopt.')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('name')
				.setDescription('Name the fish you wish to adopt.')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('aquarium')
				.setDescription('Name of the aquarium your pet belongs to.')
				.setRequired(true),
		),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {
		await interaction.deferReply();

		let species = interaction.options.getString('species');
		species = capitalizeWords(species.toLowerCase());
		// check if species exists in database
		const exists = await Fish.exists({ name: species });
		if (!exists) return interaction.followUp({ content: 'That species does not exist!', ephemeral: true });
		const name = interaction.options.getString('name');
		const aquariumName = interaction.options.getString('aquarium');

		const user = await getUser(interaction.user.id);
		if (!user) return interaction.followUp({ content: 'There was an error retrieving your data!', ephemeral: true });

		// check if user has an aquarium
		const aquariums = await user.inventory.aquariums;
		if (!aquariums.length) {
			return interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle('Adoption Agency')
						.addFields(
							{ name: 'Uh-oh..', value: 'You do not have an aquarium to adopt a fish!' },
						),
				],
			});
		}

		const aquariumData = await user.inventory.aquariums.find((a) => a.name.toLowerCase() === aquariumName.toLowerCase());
		const aquarium = new Aquarium(aquariumData);

		const fishInInventory = await user.inventory.fish.find((f) => f.name.toLowerCase() === species.toLowerCase() && !f.locked);
		const fish = await FishData.findById(fishInInventory.id);

		let success = false;
		let newPet;
		if (fish) {
			newPet = new Pet({
				fish: fish.id,
				aquarium: aquarium.getId(),
				name: name,
				age: 1,
				owner: user._id,
				traits: [],
				health: 100,
				mood: 100,
				hunger: 50,
				stress: 20,
				xp: 0,
			});

			success = await newPet.save();
			if (success) {
				await aquarium.addFish(newPet.getId());
			}
		}

		if (success) {
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle('Adoption Agency')
						.addFields(
							{ name: 'Congratulations!', value: `You have successfully adopted the ${species} **${name}**! They have been added to ${aquariumName}.` },
						),
				],
			});
		}
		else {
			await interaction.followUp({
				embeds: [
					new EmbedBuilder()
						.setTitle('Adoption Agency')
						.addFields(
							{ name: 'Congratulations!', value: 'You have failed to adopt a fish!' },
						),
				],
			});
		}
	},
};
