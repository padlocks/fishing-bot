const { FishData } = require('../schemas/FishSchema');
const { Habitat } = require('../schemas/HabitatSchema');
const { PetFish } = require('../schemas/PetSchema');
const { User } = require('../schemas/UserSchema');

class Pet {
	constructor(data) {
		this.pet = new PetFish(data);
	}

	save() {
		return this.pet.save();
	}

	async getId() {
		return this.pet._id;
	}

	async getFishData() {
		return await FishData.findById(this.pet.fish);
	}

	async getBiome() {
		const fish = await this.getFishData();
		return fish.biome;
	}

	async getName() {
		return this.pet.name;
	}

	async getSpecies() {
		return this.pet.species;
	}

	async getAdoptionDate() {
		return this.pet.adoptTime;
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

	async getLastUpdated() {
		return this.pet.lastUpdated;
	}

	async updateName(name) {
		this.pet.name = name;
		return this.save();
	}

	async updateStatus(aquarium) {
		const cleanliness = await aquarium.getCleanliness();
		const temperature = await aquarium.getTemperature();

		const now = Date.now();
		const elapsedTimeSinceAdoption = (now - await this.getAdoptionDate()) / 86_400_000;
		const elapsedTimeSinceFed = (now - await this.getLastFed()) / (60_000 * 120);
		const elapsedTimeSincePlayed = (now - await this.getLastPlayed()) / (60_000 * 60);
		const elapsedTimeSinceSeen = (now - await this.getLastUpdated()) / (60_000 * 120);

		const newAge = this.pet.age + Math.floor(elapsedTimeSinceAdoption);
		const newHunger = await this.calculateHunger(elapsedTimeSinceFed, cleanliness, temperature);
		const newMood = await this.calculateMood(elapsedTimeSincePlayed, cleanliness, temperature);
		const newStress = await this.calculateStress(elapsedTimeSinceSeen, cleanliness, temperature);

		this.pet.age = newAge;
		this.pet.hunger = Math.min(newHunger, 100);
		this.pet.mood = Math.max(newMood, 0);
		this.pet.stress = Math.max(newStress, 0);
		this.pet.lastUpdated = now;
		return this.save();
	}

	async calculateHunger(elapsedTimeSinceFed, cleanliness, temperature) {
		const baseHungerIncrease = Math.floor(elapsedTimeSinceFed);
		const cleanlinessFactor = 1 - (cleanliness / 100);
		const temperatureFactor = 1 - (Math.abs(temperature - 25) / 25);
		const hungerIncrease = baseHungerIncrease * cleanlinessFactor * temperatureFactor;
		return this.pet.hunger + hungerIncrease;
	}

	async calculateMood(elapsedTimeSincePlayed, cleanliness, temperature) {
		const baseMoodDecrease = Math.floor(elapsedTimeSincePlayed);
		const cleanlinessFactor = 1 - (cleanliness / 100);
		const temperatureFactor = 1 - (Math.abs(temperature - 25) / 25);
		const moodDecrease = baseMoodDecrease * cleanlinessFactor * temperatureFactor;
		return this.pet.mood - moodDecrease;
	}

	async calculateStress(elapsedTimeSinceSeen, cleanliness, temperature) {
		const baseStressDecrease = Math.floor(elapsedTimeSinceSeen);
		const cleanlinessFactor = 1 - (cleanliness / 100);
		const temperatureFactor = 1 - (Math.abs(temperature - 25) / 25);
		const stressDecrease = baseStressDecrease * cleanlinessFactor * temperatureFactor;
		return this.pet.stress - stressDecrease;
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
		this.pet.hunger = Math.max(Math.min(this.pet.hunger - 50, 100), 0);
		this.pet.xp += 50;
		return this.save();
	}

	async play() {
		const currentTime = Date.now();
		this.pet.lastPlayed = currentTime;
		this.pet.mood = Math.max(Math.min(this.pet.mood + 25, 100), 0);
		this.pet.stress = Math.max(Math.min(this.pet.stress - 25, 100), 0);
		this.pet.xp += 50;
		return this.save();
	}

	async disown() {
		this.pet.owner = '';
		return this.save();
	}

	async removeFromHabitat() {
		this.pet.aquarium = null;
		return this.save();
	}

	async sell(aquarium) {
		const user = await User.findOne({ userId: await this.getOwner() });
		user.inventory.money += await this.getXP();
		await user.save();

		await this.removeFromHabitat();
		await aquarium.removeFish(await this.getId());
		await this.disown();
		return;
	}

	async breed() {
		if (await this.getAge() < 18) return false;
		const currentTime = Date.now();
		this.pet.lastBred = currentTime;
		this.pet.xp += 250;
		return this.save();
	}
}

module.exports = { Pet };