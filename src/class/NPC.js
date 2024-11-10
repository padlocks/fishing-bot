const { NPC: NPCSchema } = require('../schemas/NPCSchema');
const { Quest: QuestSchema } = require('../schemas/QuestSchema');
const { Quest } = require('./Quest');

class NPC {
	constructor(data) {
		this.npc = new NPCSchema(data);
	}

	save() {
		return NPCSchema.findOneAndUpdate({ _id: this.npc._id }, this.npc, { upsert: true });
	}

	async getId() {
		return this.npc._id;
	}

	async getName() {
		return this.npc.name;
	}

	async getDescription() {
		return this.npc.description;
	}

	async getBiome() {
		return this.npc.biome;
	}

	async getAvailableTimes() {
		return this.npc.availableTimes;
	}

	async getEventTrigger() {
		return this.npc.eventTrigger;
	}

	async getDialogue() {
		return this.npc.dialogue;
	}

	async getQuestsAvailable() {
		return this.npc.questTitlesAvailable;
	}

	async getRandomQuest() {
		const quests = await QuestSchema.find({ title: { $in: this.npc.questTitlesAvailable } });
		if (quests.length === 0) return null;
		return new Quest(quests[Math.floor(Math.random() * quests.length)]);
	}

	static async getRandomNPC(biome, weather, timeOfDay, season) {
		const query = {
			biome: biome,
			availableTimes: {
				$elemMatch: {
					weather: { $in: [weather, 'any'] },
					timeOfDay: { $in: [timeOfDay, 'any'] },
					season: { $in: [season, 'any'] },
				},
			},
		};

		const npcs = await NPCSchema.find(query);
		if (npcs.length === 0) return null;
		return new NPC(npcs[Math.floor(Math.random() * npcs.length)]);
	}
}

module.exports = { NPC };