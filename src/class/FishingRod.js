const { CustomRodData } = require('../schemas/CustomRodSchema');
const { Item, ItemData } = require('../schemas/ItemSchema');
const { Queue } = require('./Queue');

class FishingRod {
	constructor(data) {
		this.rod = new CustomRodData(data);
	}

	async save() {
		const queue = new Queue(1);
	
		return await queue.add(() => this.rod.save);
	}

	async getId() {
		return this.rod._id;
	}

	async getRod() {
		return this.rod;
	}

	async getParts() {
		return {
			rod: await ItemData.findById(this.rod.rod),
			reel: await ItemData.findById(this.rod.reel),
			hook: await ItemData.findById(this.rod.hook),
			handle: await ItemData.findById(this.rod.handle),
		};
	}

	async combineQualities(parts) {
		const combinedQualities = new Set();
		let totalNumbers = 0;
		let totalCounts = 0;
		let totalDurability = 0;
	
		parts.forEach(part => {
			part.qualities.forEach(quality => {
				if (/^\d+$/.test(quality)) {
					totalNumbers += parseInt(quality, 10);
				} else if (quality.includes('count')) {
					const countValue = parseInt(quality.split(' ')[0], 10);
					totalCounts += countValue;
				} else if (quality.includes('durability')) {
					const durabilityValue = parseInt(quality.split(' ')[0], 10);
					totalDurability += durabilityValue;
				} else {
					combinedQualities.add(quality);
				}
			});
		});
	
		if (totalNumbers > 0) {
			combinedQualities.add(totalNumbers.toString());
		}
		if (totalCounts > 0) {
			combinedQualities.add(`${totalCounts} count`);
		}
		if (totalDurability > 0) {
			combinedQualities.add(`${totalDurability} durability`);
		}
	
		return Array.from(combinedQualities);
	}

	async generateStats() {
		const rodParts = await this.getParts();

		// Calculate stats based on rod parts
		const capabilities = await this.combineQualities(Object.values(rodParts));

		const obtained = Date.now();
		let durability = 0;
		let maxDurability = 0;
		const requirements = {
			level: 0,
		};
		let repairs = 0;
		let maxRepairs = 3;
		let repairCost = 0;
		capabilities.forEach(quality => {
			if (quality.includes('durability')) {
				durability = parseInt(quality.split(' ')[0], 10);
				maxDurability = durability;
			}
			else if (quality.includes('count')) {
				const countValue = parseInt(quality.split(' ')[0], 10);
				requirements.level = countValue * 10;
				repairCost = countValue * 10000;
			}
		});

		this.rod.capabilities = capabilities;
		this.rod.requirements = requirements;
		this.rod.obtained = obtained;
		this.rod.durability = durability;
		this.rod.maxDurability = maxDurability;
		this.rod.repairs = repairs;
		this.rod.maxRepairs = maxRepairs;
		this.rod.repairCost = repairCost;
		return await this.save();
	}
}

module.exports = { FishingRod };