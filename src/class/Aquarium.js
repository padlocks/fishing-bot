const { default: mongoose } = require('mongoose');
const { Habitat } = require('../schemas/HabitatSchema');

class Aquarium {
	constructor(data) {
		this.aquarium = new Habitat(data);
	}

	save() {
		return this.aquarium.save();
	}

	async getId() {
		return this.aquarium._id;
	}

	async getName() {
		return this.aquarium.name;
	}

	async getWaterType() {
		return this.aquarium.waterType;
	}

	async getTemperature() {
		return this.aquarium.temperature;
	}

	async getCleanliness() {
		return this.aquarium.cleanliness;
	}

	async getInhabitants() {
		return this.aquarium.fish;
	}

	async getSize() {
		return this.aquarium.size;
	}

	async getOwner() {
		return this.aquarium.owner;
	}

	async getFish() {
		return this.aquarium.fish;
	}

	async addFish(fishId) {
		this.aquarium.fish.push(fishId);
		return this.save();
	}

	async removeFish(fishId) {
		this.aquarium.fish = this.aquarium.fish.filter(fish => fish._id.valueOf() !== fishId.valueOf());
		return this.save();
	}

	async moveFish(pet, newAquarium) {
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			const petId = await pet.getId();
			const petHabitat = new Aquarium(await pet.getHabitat());
			const habitatId = await newAquarium.getId();

			// ensure pet data is properly updated
			await pet.updateHabitat(habitatId, { session });

			// update aquarium data
			await petHabitat.removeFish(petId, { session });
			await newAquarium.addFish(petId, { session });

			await session.commitTransaction();
		}
		catch (error) {
			await session.abortTransaction();
			throw error;
		}
		finally {
			session.endSession();
		}
	}

	async upgrade(size) {
		this.aquarium.size = size;
		return this.save();
	}

	async clean() {
		this.aquarium.cleanliness += 10;
		return this.save();
	}

	async adjustTemperature(newTemperature) {
		this.aquarium.temperature = newTemperature;
		return this.save();
	}

	async compareBiome(biome) {
		const biomeWaterType = {
			'Ocean': 'Saltwater',
			'Coast': 'Saltwater',
			'River': 'Freshwater',
			'Lake': 'Freshwater',
			'Pond': 'Freshwater',
			'Swamp': 'Freshwater',
		};

		const biomeType = biomeWaterType[biome];
		if (!biomeType) return false;
		const waterType = await this.getWaterType();

		return biomeType !== waterType;
	}
}

module.exports = { Aquarium };