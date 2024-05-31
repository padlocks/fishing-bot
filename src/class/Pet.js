const { Habitat } = require('../schemas/HabitatSchema');
const { PetFish } = require('../schemas/PetSchema');

class Pet {
	constructor(data) {
		this.pet = new PetFish(data);
	}

	save() {
		return this.pet.save();
	}

	async getId() {
		return this.pet.id;
	}

	async getName() {
		return this.pet.name;
	}

	async getSpecies() {
		return this.pet.species;
	}

	async getAge() {
		return this.pet.age;
	}

	async getOwner() {
		return this.pet.owner;
	}

	async getHunger() {
		return this.pet.hunger;
	}

	async getMood() {
		return this.pet.mood;
	}

	async getStress() {
		return this.pet.stress;
	}

	async getHealth() {
		return this.pet.health;
	}

	async getXP() {
		return this.pet.xp;
	}

	async getTraits() {
		return this.pet.traits;
	}

	async getHabitat() {
		return await Habitat.findById(this.pet.aquarium);
	}

	async getLastFed() {
		return this.pet.lastFed;
	}

	async getLastPlayed() {
		return this.pet.lastPlayed;
	}

	async getLastBred() {
		return this.pet.lastBred;
	}

	async updateName(name) {
		this.pet.name = name;
		return this.save();
	}


	async updateHabitat(habitatId) {
		this.pet.habitat = habitatId;
		return this.save();
	}

	async updateHealth(amount) {
		// max 100, min 0
		this.pet.health = Math.max(Math.min(this.pet.health + amount, 100), 0);
		return this.save();
	}

	async feed() {
		const currentTime = Date.now();
		this.pet.lastFed = currentTime;
		// max 100, min 0
		this.pet.hunger = Math.max(Math.min(this.pet.hunger - 10, 100), 0);
		this.pet.xp += 10;
		return this.save();
	}

	async play() {
		const currentTime = Date.now();
		this.pet.lastPlayed = currentTime;
		this.pet.mood = Math.max(Math.min(this.pet.mood + 10, 100), 0);
		this.pet.stress = Math.max(Math.min(this.pet.stress - 10, 100), 0);
		this.pet.xp += 10;
		return this.save();
	}

	async breed() {
		const currentTime = Date.now();
		this.pet.lastBred = currentTime;
		this.pet.xp += 50;
		return this.save();
	}
}

module.exports = { Pet };