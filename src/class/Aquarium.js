const { Habitat } = require('../schemas/HabitatSchema');

class Aquarium {
	constructor(data) {
		this.aquarium = new Habitat(data);
	}

	save() {
		return this.aquarium.save();
	}

	async getId() {
		return this.aquarium.id;
	}

	async addFish(fishId) {
		this.aquarium.fish.push(fishId);
		return this.save();
	}

	async removeFish(fishId) {
		this.aquarium.fish = this.aquarium.fish.filter(fish => !fish.equals(fishId));
		return this.save();
	}

	clean() {
		this.aquarium.cleanliness = 100;
		return this.save();
	}

	adjustTemperature(newTemperature) {
		this.aquarium.temperature = newTemperature;
		return this.save();
	}
}

module.exports = { Aquarium };