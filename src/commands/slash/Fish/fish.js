const { SlashCommandBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ComponentType } = require('discord.js');
const { Fish } = require('../../../class/Fish');
const { Pond } = require('../../../schemas/PondSchema');
const { Item } = require('../../../schemas/ItemSchema');
const { User } = require('../../../class/User');
const config = require('../../../config');
const { Interaction } = require('../../../class/Interaction');
const { Utils } = require('../../../class/Utils');
const { WeatherPattern } = require('../../../class/WeatherPattern');
const { NPC } = require('../../../class/NPC');
const { Season } = require('../../../class/Season');
const ExpandableMessage = require('../../../class/ExpandableMessage');

const updateUserWithFish = async (analyticsObject, interaction, userId) => {
    const user = new User(await User.get(userId));
    const pond = await Pond.findOne({ id: interaction.channel.id });
    if (pond && pond.count <= 0) {
        return { fish: [], xp: 0, rodState: '', success: false, message: 'The pond is empty!' };
    }
    let rod = await user.getEquippedRod();
    const bait = await user.getEquippedBait();
    const biome = await user.getCurrentBiome();
    const fishArray = await Fish.reel(rod._id, bait, biome, interaction.guild.id, user);
    let xp = 0;
    let levelUp = false;

    for (let i = 0; i < fishArray.length; i++) {
        xp += await user.generateBoostedXP();
    }

    if (bait) {
        xp = Math.floor(xp * bait.multiplier);
    }

    if (user) {
        const stats = await user.getStats();
        stats.latestFish = [];
        if (bait) {
            bait.count -= fishArray.reduce((acc, f) => acc + (f.count || 1), 0);
            if (bait.count < 0) bait.count = 0;
            if (bait.count == 0) {
                await user.setEquippedBait(null);
                await user.removeBait(bait._id);
            }
        }

        for (let i = 0; i < fishArray.length; i++) {
            const f = fishArray[i];
            if (!f.count) f.count = 1;

            let message = '';
            switch (rod.state) {
            case 'broken':
                message = `Your rod is ${rod.state}! You can't catch any more fish until you repair it.`;
                break;
            case 'destroyed':
                message = `Your rod is ${rod.state}! You can't use it anymore.`;
                break;
            default:
                message = '';
                break;
            }

            if (rod.state === 'broken' || rod.state === 'destroyed') {
                return { fish: [], xp: 0, rodState: rod.state, success: false, message: message };
            } else {
                rod = await user.decreaseRodDurability(f.count || 1);
            }

            rod.fishCaught += f.count || 1;
            stats.fishCaught += f.count || 1;
            stats.latestFish.push(f);
            stats.soldLatestFish = false;
            stats.fishStats.set(f.name.toLowerCase(), (stats.fishStats.get(f.name.toLowerCase()) || 0) + (f.count || 1));
            await user.setStats(stats);
            await user.addXP(xp);
            levelUp = await user.updateLevel();

            if (pond) {
                pond.count -= f.count || 1;
                if (pond.count <= 0) {
                    pond.count = 0;
                } else if (pond.count <= 250 && !pond.warning) {
                    pond.warning = true;
                    await pond.save();

                    const replyEmbed = new EmbedBuilder()
                        .setTitle('Pond')
                        .addFields({ name: 'Pond Status', value: `The pond is running low! There are only ${pond.count} fish left!` });
                    
                    new ExpandableMessage(analyticsObject, interaction)
                        .setSendType(ExpandableMessage.SendType.FOLLOW_UP)
                        .addEmbed(replyEmbed)
                        .send();
                }
                pond.lastFished = Date.now();
                await pond.save();
            }

            await f.save();
        }

        await rod.save();
        if (bait) await bait.save();
        return { fish: fishArray, xp: xp, rodState: rod.state, bait: bait, levelUp: levelUp, success: true, message: '' };
    }
};

const followUpMessage = async (analyticsObject, interaction, user, fishArray, xp, rodState, bait, levelUp, success, message) => {
    const fields = [];
    let fishString = '';
    let fishAgainDisabled = false;
    const userObj = new User(await User.get(user.id));

    let catchId;
    if (success) {
        fishArray.forEach(f => {
            if (!catchId) catchId = f.catchId;
            fishString += `<${f.icon?.animated ? 'a' : ''}:${f.icon?.data}> ${f.count} **${f.rarity}** ${f.name} \n-# <:blankblock:1304335977275457567> ${f.size}cm, ${f.weight}kg\n`;
        });

        fishString += `+ ${xp} XP\n`;
        fields.push({ name: `${user.globalName} Caught:`, value: fishString });

        if (rodState === 'broken') {
            fishAgainDisabled = true;
            fields.push({ name: 'Uh oh!', value: 'Your fishing rod has broken!' });
        } else if (rodState === 'destroyed') {
            fishAgainDisabled = true;
            fields.push({ name: 'Uh oh!', value: 'Your fishing rod has been destroyed! Looks like you need to buy a new one..' });
        }

        if (bait?.count == 0) {
            fields.push({ name: 'Uh oh!', value: 'You ran out of bait!' });
        }

        const random = Math.floor(Math.random() * 75);
        if (random === 1) {
            fields.push({ name: 'Enjoying FishingRPG?', value: 'If you enjoy the bot, please consider leaving a review on top.gg! Go to https://top.gg/bot/1209026334970482698#reviews to leave a review!' });
        }
    } else {
        fields.push({ name: 'Uh oh!', value: `${message}` });
        fishAgainDisabled = true;
    }

    let components = [
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('fish-again')
                    .setLabel('Fish again!')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(fishAgainDisabled),
                new ButtonBuilder()
                    .setCustomId(`sell-one-fish:${catchId || 0}`)
                    .setLabel('Sell')
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(fishArray.length === 0),
            ),
    ];

    if (rodState === 'broken') {
        components = [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('repair-rod')
                        .setLabel('Repair Rod')
                        .setStyle(ButtonStyle.Primary),
                ),
        ];
    }

    const replyEmbed = new EmbedBuilder()
        .setTitle('Fished!')
        .addFields(fields);

    const equippedRod = await userObj.getEquippedRod();

    return new ExpandableMessage(analyticsObject, interaction)
        .setSendType(ExpandableMessage.SendType.FOLLOW_UP)
        .addEmbed(replyEmbed)
        .addComponents(components)
        .addQuestData({ fish: fishArray, rod: equippedRod })
        .send();
}

module.exports = {
    customId: 'fish-again',
    structure: new SlashCommandBuilder()
        .setName('fish')
        .setDescription('Fish!'),
    options: {
        cooldown: 5000,
    },
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async run(client, interaction, analyticsObject, user = null) {
        if (user === null) user = interaction.user;

        await interaction.deferReply();

        const object = await updateUserWithFish(analyticsObject, interaction, user.id);
        const newFish = object.fish;
        const xp = object.xp;
        const rodState = object.rodState;
        const bait = object.bait;
        const levelUp = object.levelUp;
        const success = object.success;
        const message = object.message;

        if (process.env.ANALYTICS || config.client.analytics) {
            await analyticsObject.setStatus(success ? 'completed' : 'failed');
            await analyticsObject.setStatusMessage(message || 'Fished.');
        }

        const followUp = await followUpMessage(analyticsObject, interaction, user, newFish, xp, rodState, bait, levelUp, success, message);

        const collector = followUp.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30_000,
        });

        collector.on('collect', async collectionInteraction => {
            if (collectionInteraction.user.id !== user.id) return;
            if (collectionInteraction.customId === 'fish-again') {
                if (process.env.ANALYTICS || config.client.analytics) {
                    await Interaction.generateCommandObject(collectionInteraction, analyticsObject);
                }
                await this.run(client, collectionInteraction, analyticsObject, user);
            }
        });

        collector.on('end', async () => {
            await followUp.edit({
                components: [],
            });
        });
    },
};
