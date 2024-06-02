const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Pet, breed } = require('../../../class/Pet');
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
			.addStringOption((p) => p.setName('name').setDescription('The name of the pet you want to sell.').setRequired(true)))
		.addSubcommand((o) => o.setName('breed').setDescription('Breed your pets.')
			.addStringOption((p) => p.setName('first_pet').setDescription('The name of the first pet you want to breed.').setRequired(true))
			.addStringOption((p) => p.setName('second_pet').setDescription('The name of the second pet you want to breed.').setRequired(true))
			.addStringOption((p) => p.setName('name').setDescription('The name of the baby pet.').setRequired(true))
			.addStringOption((p) => p.setName('aquarium').setDescription('The name of the aquarium you want to put the baby pet in.').setRequired(true)),
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
				fields.push({ name: `<${petData.icon?.animated ? 'a' : ''}:${petData.icon?.data}> ${await pet.getName()}`, value: `**Species**: ${await pet.getSpecies()}\n**Age**: ${await pet.getAge()}\n**Health**: ${await pet.getHealth()}%\n**Hunger**: ${await pet.getHunger()}%\n**Mood**: ${await pet.getMood()}%\n**Stress**: ${await pet.getStress()}%\n**XP**: ${await pet.getXP()}\n\n**Traits**: ${(await pet.getUnlockedTraitNames()).join(', ')}` });
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

			return await interaction.followUp(`Successfully sold ${name} for $${(await pet.sell(aquarium)).toLocaleString()}.`);
		}

		if (subcommand === 'breed') {
			const firstPetName = interaction.options.getString('first_pet');
			const secondPetName = interaction.options.getString('second_pet');
			const babyName = interaction.options.getString('name');
			const aquariumName = interaction.options.getString('aquarium');

			const firstPetData = await PetFish.findOne({ name: firstPetName, owner: interaction.user.id });
			if (!firstPetData) return await interaction.followUp(`You do not own a pet with the name ${firstPetName}.`);
			const secondPetData = await PetFish.findOne({ name: secondPetName, owner: interaction.user.id });
			if (!secondPetData) return await interaction.followUp(`You do not own a pet with the name ${secondPetName}.`);

			let aquarium = await Habitat.findOne({ name: aquariumName, owner: interaction.user.id });
			if (!aquarium) return await interaction.followUp('You do not own an aquarium with that name.');
			aquarium = new Aquarium(aquarium);

			const babyExists = await PetFish.exists({ name: babyName, owner: interaction.user.id });
			if (babyExists) return await interaction.followUp(`You already own a pet with the name ${babyName}.`);

			// check if the user has enough space in the aquarium
			const aquariumPets = await aquarium.getFish();
			if (aquariumPets.length >= aquarium.getSize()) return await interaction.followUp('Your aquarium is full. You need to upgrade it to breed more pets.');

			const firstPet = new Pet(firstPetData);
			const secondPet = new Pet(secondPetData);

			// check if the pets are the same water type
			const firstPetCompatibility = await aquarium.compareBiome(await firstPet.getBiome());
			const secondPetCompatibility = await aquarium.compareBiome(await secondPet.getBiome());
			if (!firstPetCompatibility || !secondPetCompatibility) return await interaction.followUp('The pets you are trying to breed are not compatible because they require different water types.');

			await firstPet.updateStatus(aquarium);
			await secondPet.updateStatus(aquarium);
			const result = await breed(firstPet, secondPet, babyName, await aquarium.getId());
			if (!result.success) return await interaction.followUp(`Failed to breed pets: ${result.reason}.`);

			const baby = new Pet(result.child);
			return await interaction.followUp(`Successfully bred **${await firstPet.getName()}** and **${await secondPet.getName()}** to create ${await baby.getSpecies()} **${babyName}**.`);
		}
	},
};