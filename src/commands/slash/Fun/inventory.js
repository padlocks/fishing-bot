const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { FishData } = require('../../../schemas/FishSchema');
const buttonPagination = require('../../../buttonPagination');
const { getUser, getEquippedRod, getInventoryValue, xpToLevel, xpToNextLevel } = require('../../../util/User');
const { getFishCount } = require('../../../util/Fish');
const { log } = require('../../../util/Utils');

module.exports = {
	structure: new SlashCommandBuilder()
		.setName('inventory')
		.setDescription('Check your inventory!'),
	options: {
		cooldown: 15000,
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
							fishInventory[fish.rarity.toLowerCase()].push(`**${fishCount}** <${fish.icon.animated ? 'a' : ''}:${fish.icon.data}> ${fish.name} ${fish.locked ? '🔒' : ''}\n`);
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

			for (let i = 0; i < fields.length; i += chunkSize) {
				const chunk = fields.slice(i, i + chunkSize);

				const equippedRod = await getEquippedRod(user.userId);
				const inventoryValue = await getInventoryValue(user.userId);
				embeds.push(new EmbedBuilder()
					.setFooter({ text: `Page ${Math.floor(i / chunkSize) + 1} / ${Math.ceil(fields.length / chunkSize)} ` })
					.setTitle(`${interaction.user.username}'s Inventory`)
					.setDescription(`
						**Balance:** $${user.inventory.money.toLocaleString()}
						**Level ${await xpToLevel(user.xp)}**. ${await xpToNextLevel(user.xp)} to next level.
						**Currently using**: <${equippedRod.icon?.animated ? 'a' : ''}:${equippedRod.icon?.data || ''}> ${equippedRod?.name || 'None'}
						**Inventory value**: $${await inventoryValue.toLocaleString()}
					`)
					.setColor('Green')
					.addFields(chunk),
				);
			}

			await buttonPagination(interaction, embeds);
		}
		catch (err) {
			log(err, 'err');
		}
	},
};
