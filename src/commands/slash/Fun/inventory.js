const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { FishData } = require('../../../schemas/FishSchema');
const buttonPagination = require('../../../buttonPagination');
const { getUser, getEquippedRod, getInventoryValue, xpToLevel, xpToNextLevel, getEquippedBait } = require('../../../util/User');
const { getFishCount } = require('../../../util/Fish');
const { Biome } = require('../../../schemas/BiomeSchema');
const { ItemData } = require('../../../schemas/ItemSchema');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Check your inventory!'),
	options: {
		cooldown: 10_000,
	},
	/**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
	run: async (client, interaction) => {
		try {
			const embeds = [];
			const fields = [];
			const fishInventory = {
				common: [],
				uncommon: [],
				rare: [],
				ultra: [],
				giant: [],
				legendary: [],
				lucky: [],
			};

			const user = await getUser(interaction.user.id);

			if (user.inventory.fish && Array.isArray(user.inventory.fish)) {
				const fishNames = new Set();
				await Promise.all(
					user.inventory.fish.map(async (fishObject) => {
						const fish = await FishData.findById(fishObject.valueOf());
						if (!fishNames.has(fish.name)) {
							fishNames.add(fish.name);
							const fishCount = await getFishCount(user.userId, fish.name);
							fishInventory[fish.rarity.toLowerCase()].push(`**${fishCount}** <${fish.icon?.animated ? 'a' : ''}:${fish.icon?.data}> ${fish.name} ${fish.locked ? '🔒' : ''}\n`);
						}
					}),
				);
			}

			const chunkSize = 1;
			for (const rarity in fishInventory) {
				if (fishInventory[rarity].length > 0) {
					fields.push({ name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} fish`, value: fishInventory[rarity].join('') });
				}
			}

			const equippedRod = await getEquippedRod(user.userId);
			const equippedBait = await getEquippedBait(user.userId);
			const inventoryValue = await getInventoryValue(user.userId);
			const userBiome = user.currentBiome.charAt(0).toUpperCase() + user.currentBiome.slice(1);
			const biome = await Biome.findOne({ name: userBiome });
			const balance = `
			**Balance:** $${user.inventory.money.toLocaleString()}\n`;
			const level = `**Level ${await xpToLevel(user.xp)}**. ${await xpToNextLevel(user.xp)} to next level.\n`;
			const rod = `**Currently using**: <${equippedRod?.icon?.animated ? 'a' : ''}:${equippedRod?.icon?.data || ''}> ${equippedRod?.name || 'None'}\n${equippedRod?.durability || 0} / ${equippedRod?.maxDurability || 0}\n`;
			const bait = `**With**: <${equippedBait?.icon?.animated ? 'a' : ''}:${equippedBait?.icon?.data || ''}>${equippedBait?.name || 'None'}\n`;
			const biomeString = `**Current biome**: <${biome.icon?.animated ? 'a' : ''}:${biome.icon?.data || ''}> ${biome.name.charAt(0).toUpperCase() + biome.name.slice(1) || 'Ocean'}\n`;
			const inventoryValueString = `**Inventory value**: $${await inventoryValue.toLocaleString()}\n\n`;
			const description = balance + level + rod + (equippedBait ? bait : '') + biomeString + inventoryValueString;

			if (user.inventory.fish.length === 0) {
				fields.push({ name: 'No fish', value: 'You have no fish in your inventory.' });
			}

			const rods = {};
			for (let i = 0; i < user.inventory.rods.length; i++) {
				const rodId = user.inventory.rods[i].valueOf();
				const rodObject = await ItemData.findById(rodId);
				const rodsOfType = await ItemData.find({ name: rodObject.name, user: user.userId });
				const count = rodsOfType.length;
				rods[rodObject.name] = `x${count} <${rodObject.icon.animated ? 'a' : ''}:${rodObject.icon.data || ''}> ${rodObject.name || ''}\n`;
			}

			if (Object.keys(rods).length > 0) {
				fields.push({ name: 'Rods', value: Object.values(rods).join('') });
			}
			else {
				fields.push({ name: 'Rods', value: 'You have no fishing rods in your inventory.' });
			}

			const baits = {};
			for (let i = 0; i < user.inventory.baits.length; i++) {
				const baitId = user.inventory.baits[i].valueOf();
				const baitObject = await ItemData.findById(baitId);
				baits[baitObject.name] = `x${baitObject.count} <${baitObject.icon.animated ? 'a' : ''}:${baitObject.icon.data || ''}> ${baitObject.name || ''}\n`;
			}

			if (Object.keys(baits).length > 0) {
				fields.push({ name: 'Bait', value: Object.values(baits).join('') });
			}
			else {
				fields.push({ name: 'Bait', value: 'You have no bait in your inventory.' });
			}

			const items = {};
			for (let i = 0; i < user.inventory.items?.length; i++) {
				const itemId = user.inventory.items[i].valueOf();
				const itemObject = await ItemData.findById(itemId);
				const itemsOfType = await ItemData.find({ name: itemObject.name, user: user.userId });
				const count = itemsOfType.length;
				items[itemObject.name] = `x${count} <${itemObject.icon.animated ? 'a' : ''}:${itemObject.icon.data || ''}> ${itemObject.name || ''}\n`;
			}

			for (let i = 0; i < user.inventory.gacha?.length; i++) {
				const itemId = user.inventory.gacha[i].valueOf();
				const itemObject = await ItemData.findById(itemId);
				const itemsOfType = await ItemData.find({ name: itemObject.name, user: user.userId });
				const count = itemsOfType.length;
				items[itemObject.name] = `x${count} <${itemObject.icon.animated ? 'a' : ''}:${itemObject.icon.data || ''}> ${itemObject.name || ''}\n`;
			}

			for (let i = 0; i < user.inventory.buffs?.length; i++) {
				const itemId = user.inventory.buffs[i].valueOf();
				const itemObject = await ItemData.findById(itemId);
				const itemsOfType = await ItemData.find({ name: itemObject.name, user: user.userId });
				const count = itemsOfType.length;
				items[itemObject.name] = `x${count} <${itemObject.icon.animated ? 'a' : ''}:${itemObject.icon.data || ''}> ${itemObject.name || ''}\n`;
			}

			if (Object.keys(items).length > 0) {
				fields.push({ name: 'Items', value: Object.values(items).join('') });
			}
			else {
				fields.push({ name: 'Items', value: 'You have no items in your inventory.' });
			}

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle(`${interaction.user.username}'s Inventory`)
					.setDescription(description)
					.setColor('Green')
					.addFields(chunk),
				);
			}

			await buttonPagination(interaction, embeds);
		}
		catch (err) {
			console.error(err);
		}
	},
};
