const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Pet } = require('../../../class/Pet');
const { Aquarium } = require('../../../class/Aquarium');
const { PetFish } = require('../../../schemas/PetSchema');
const { Habitat } = require('../../../schemas/HabitatSchema');
const buttonPagination = require('../../../buttonPagination');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('pet')
		.setDescription('Everything about your pets!')
		.addSubcommand((o) => o.setName('view').setDescription('View your pets.'))
		.addSubcommand((o) => o.setName('rename').setDescription('Upgrade your aquarium.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the pet you want to rename.').setRequired(true))
			.addStringOption((p) => p.setName('newname').setDescription('The new name for the pet.').setRequired(true)))
		.addSubcommand((o) => o.setName('feed').setDescription('Feed your pet.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the pet you want to feed.').setRequired(true)))
		.addSubcommand((o) => o.setName('play').setDescription('Play with your pet.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the pet you want to play with.').setRequired(true)))
		.addSubcommand((o) => o.setName('sell').setDescription('Sell your pet.')
			.addStringOption((p) => p.setName('name').setDescription('The name of the pet you want to sell.').setRequired(true)),
		),
	options: {
		cooldown: 3_000,
	},
	run: async (client, interaction) => {
		const subcommand = interaction.options.getSubcommand();
		await interaction.deferReply();

		if (subcommand === 'view') {
			// get pets owned by the user
			const pets = await PetFish.find({ owner: interaction.user.id });
			if (!pets.length) return await interaction.followUp('You do not own any pets. You can use the `adopt` command to adopt one.');

			const embeds = [];
			const fields = [];

			for (const p of pets) {
				const pet = new Pet(p);
				const aquarium = new Aquarium(await Habitat.findById(await pet.getHabitat()));
				await pet.updateStatus(aquarium);
				const petData = await pet.getFishData();
				fields.push({ name: `${await pet.getName()}`, value: `**Species**: <${petData.icon?.animated ? 'a' : ''}:${petData.icon?.data}> ${await pet.getSpecies()}\n**Age**: ${await pet.getAge()}\n**Hunger**: ${await pet.getHunger()}%\n**Mood**: ${await pet.getMood()}%\n**Stress**: ${await pet.getStress()}%\n**XP**: ${await pet.getXP()}` });
			}

			const chunkSize = 1;
			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle(`${interaction.user.username}'s Pets`)
					.setDescription(`You own ${pets.length} pets.`)
					.setColor('Green')
					.addFields(chunk),
				);
			}

			return await buttonPagination(interaction, embeds, true);
		}

		if (subcommand === 'rename') {
			const name = interaction.options.getString('name');
			const newName = interaction.options.getString('newname');
			const petData = await PetFish.findOne({ name: name, owner: interaction.user.id });
			if (!petData) return await interaction.followUp('You do not own a pet with that name.');

			const pet = new Pet(petData);
			await pet.updateName(newName);

			return await interaction.followUp(`Successfully renamed your pet to ${newName}.`);
		}

		if (subcommand === 'feed') {
			const name = interaction.options.getString('name');
			const petData = await PetFish.findOne({ name: name, owner: interaction.user.id });
			if (!petData) return await interaction.followUp('You do not own a pet with that name.');

			const pet = new Pet(petData);
			await pet.feed();

			return await interaction.followUp(`Successfully fed ${name}.`);
		}

		if (subcommand === 'play') {
			const name = interaction.options.getString('name');
			const petData = await PetFish.findOne({ name: name, owner: interaction.user.id });
			if (!petData) return await interaction.followUp('You do not own a pet with that name.');

			const pet = new Pet(petData);
			await pet.play();

			return await interaction.followUp(`Successfully played with ${name}.`);
		}

		if (subcommand === 'sell') {
			const name = interaction.options.getString('name');
			const petData = await PetFish.findOne({ name: name, owner: interaction.user.id });
			if (!petData) return await interaction.followUp('You do not own a pet with that name.');

			const pet = new Pet(petData);
			const aquarium = new Aquarium(await pet.getHabitat());
			await pet.sell(aquarium);

			return await interaction.followUp(`Successfully sold ${name} for $${(await pet.getXP()).toLocaleString()}.`);
		}
	},
};