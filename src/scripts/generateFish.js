// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Fish } = require('../schemas/FishSchema');
const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const askUser = (fishes, index) => {
	if (index < fishes.length) {
		const fishData = fishes[index];
		const fish = new Fish(fishData);

		rl.question(`Name this fish: ${fishData.name}: `, (answer) => {
			fish.name = answer;

			rl.question('Add this fish to the database? (y/n): ', (response) => {
				if (response === 'y') {
					fish.save()
						.then(() => {
							console.log(`Fish "${fish.name}" created successfully`);
						})
						.catch((error) => {
							console.error(`Error creating fish "${fish.name}":`, error);
						})
						.finally(() => {
							// Call the function recursively for the next fish
							askUser(fishes, index + 1);
						});
				}
				else {
					console.log(`Fish "${fish.name}" skipped`);
					// Call the function recursively for the next fish
					askUser(fishes, index + 1);
				}
			});
		});
	}
	else {
		// Close readline interface when all fish are processed
		rl.close();
	}
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		// There are 7 unique rarities (Common, Uncommon, Rare, Ultra, Giant, Legendary, Lucky), 6 unique biomes (Ocean, River, Lake, Pond, Swamp, Coast) and 2 unique qualities (strong, weak). Generate enough fish to populate every combination possible.
		const rarities = ['Common', 'Uncommon', 'Rare', 'Ultra', 'Giant', 'Legendary', 'Lucky'];
		const biomes = ['Ocean', 'River', 'Lake', 'Pond', 'Swamp', 'Coast'];
		const qualities = ['strong', 'weak'];

		const fishes = [];

		for (const rarity of rarities) {
			for (const biome of biomes) {
				for (const quality of qualities) {
					const fish = {
						'name': `${rarity} ${biome} ${quality} Fish`,
						'rarity': rarity,
						'value': calculateFishValue(rarity, quality),
						'icon': generateFishIcon(),
						'qualities': [quality],
						'type': 'fish',
						'biome': biome,
					};

					switch (fish.name) {
					case 'Common Ocean strong Fish': {
						fish.name = 'Seabass';
						fish.description = 'Seabass is a type of fish commonly found in the ocean. It is known for its strong and flavorful taste. Seabass is often sought after by anglers and is considered a prized catch in many fishing communities.';
						break;
					}
					case 'Common Ocean weak Fish': {
						fish.name = 'Sardine';
						fish.description = 'Sardine is a type of fish commonly found in the ocean. It is known for its small size and silvery appearance. Sardines are often used in cooking and can be found in a variety of dishes.';
						break;
					}
					case 'Uncommon Ocean strong Fish': {
						fish.name = 'Tuna';
						fish.description = 'Tuna is a type of fish found in the ocean. It is known for its large size and powerful swimming ability. Tuna are popular game fish and are often sought after by anglers for their fighting spirit.';
						break;
					}
					case 'Uncommon Ocean weak Fish': {
						fish.name = 'Mackerel';
						fish.description = 'Mackerel is a type of fish found in the ocean. It is known for its oily flesh and strong flavor. While mackerel is a popular food fish, it can also be used as bait for other species of fish.';
						break;
					}
					case 'Rare Ocean strong Fish': {
						fish.name = 'Swordfish';
						fish.description = 'Swordfish is a type of fish found in the ocean. It is known for its large size and distinctive appearance. Like its name suggests, swordfish have a long, sword-like bill that they use to catch prey.';
						break;
					}
					case 'Rare Ocean weak Fish': {
						fish.name = 'Pufferfish';
						fish.description = 'Pufferfish is a type of fish found in the ocean. It is known for its unique appearance and ability to inflate its body. Although pufferfish are considered a delicacy in some cultures, they can be toxic if not prepared properly.';
						break;
					}
					case 'Ultra Ocean strong Fish': {
						fish.name = 'Azure Marlin';
						fish.description = 'Azure Marlin is a type of fish found in the ocean. Marlin are known for their large size and impressive fighting ability. They are popular game fish and are often sought after by anglers for their challenging nature.';
						break;
					}
					case 'Ultra Ocean weak Fish': {
						fish.name = 'Giant Shrimp';
						fish.description = 'Giant Shrimp is a type of crustacean found in the ocean. It is known for its large size and sweet flavor. Giant Shrimp are popular seafood items and are often used in a variety of dishes.';
						break;
					}
					case 'Giant Ocean strong Fish': {
						fish.name = 'Whale';
						fish.description = 'Whale is a type of marine mammal found in the ocean. It is known for its large size and impressive swimming ability. Whales are iconic creatures of the sea and are often associated with the beauty and majesty of the ocean.';
						break;
					}
					case 'Giant Ocean weak Fish': {
						fish.name = 'Shark';
						fish.description = 'Shark is a type of fish found in the ocean. It is known for its sharp teeth and powerful swimming ability. Sharks are apex predators of the sea and play a crucial role in maintaining the balance of marine ecosystems.';
						break;
					}
					case 'Legendary Ocean strong Fish': {
						fish.name = 'Kraken';
						fish.description = 'Kraken is a legendary sea monster said to dwell off the coast of Norway and Greenland. It is known for its massive size and fearsome appearance. The Kraken is said to be capable of dragging entire ships beneath the waves.';
						break;
					}
					case 'Legendary Ocean weak Fish': {
						fish.name = 'Narwhal';
						fish.description = 'Narwhal is a type of whale found in the Arctic Ocean. It is known for its long, spiral tusk that can grow up to 10 feet in length. Narwhals are elusive creatures of the sea and are often associated with the beauty and mystery of the Arctic.';
						break;
					}
					case 'Lucky Ocean strong Fish': {
						fish.name = 'King Mackarel';
						fish.description = 'King Mackarel is a type of fish found in the ocean. It is known for its large size and powerful swimming ability. King Mackarel are popular game fish and are often sought after by anglers for their fighting spirit.';
						break;
					}
					case 'Lucky Ocean weak Fish': {
						fish.name = 'Magikarp';
						break;
					}
					case 'Common River strong Fish': {
						fish.name = 'Salmon';
						break;
					}
					case 'Common River weak Fish': {
						fish.name = 'Carp';
						break;
					}
					case 'Uncommon River strong Fish': {
						fish.name = 'Catfish';
						break;
					}
					case 'Uncommon River weak Fish': {
						fish.name = 'Rainbow Trout';
						break;
					}
					case 'Rare River strong Fish': {
						fish.name = 'Sturgeon';
						break;
					}
					case 'Rare River weak Fish': {
						fish.name = 'Shad';
						break;
					}
					case 'Ultra River strong Fish': {
						fish.name = 'Golden Trout';
						break;
					}
					case 'Ultra River weak Fish': {
						fish.name = 'Golden Carp';
						break;
					}
					case 'Giant River strong Fish': {
						fish.name = 'Queen Salmon';
						break;
					}
					case 'Giant River weak Fish': {
						fish.name = 'King Salmon';
						break;
					}
					case 'Legendary River strong Fish': {
						fish.name = 'Golden Sturgeon';
						break;
					}
					case 'Legendary River weak Fish': {
						fish.name = 'Golden Salmon';
						break;
					}
					case 'Lucky River strong Fish': {
						fish.name = 'Noxclate Fish';
						break;
					}
					case 'Lucky River weak Fish': {
						fish.name = 'Shipwreck Treasure';
						break;
					}
					case 'Common Lake strong Fish': {
						fish.name = 'Bass';
						break;
					}
					case 'Common Lake weak Fish': {
						fish.name = 'Bluegill';
						break;
					}
					case 'Uncommon Lake strong Fish': {
						fish.name = 'Walleye';
						break;
					}
					case 'Uncommon Lake weak Fish': {
						fish.name = 'Perch';
						break;
					}
					case 'Rare Lake strong Fish': {
						fish.name = 'Pike';
						break;
					}
					case 'Rare Lake weak Fish': {
						fish.name = 'Loach';
						break;
					}
					case 'Ultra Lake strong Fish': {
						fish.name = 'Steelhead';
						break;
					}
					case 'Ultra Lake weak Fish': {
						fish.name = 'Golden Bass';
						break;
					}
					case 'Giant Lake strong Fish': {
						fish.name = 'Loch Ness Monster';
						break;
					}
					case 'Giant Lake weak Fish': {
						fish.name = 'Strange Fish';
						break;
					}
					case 'Legendary Lake strong Fish': {
						fish.name = 'Golden Pike';
						break;
					}
					case 'Legendary Lake weak Fish': {
						fish.name = 'Golden Loach';
						break;
					}
					case 'Lucky Lake strong Fish': {
						fish.name = 'Lost Ring';
						break;
					}
					case 'Lucky Lake weak Fish': {
						fish.name = 'Lost Necklace';
						break;
					}
					case 'Common Pond strong Fish': {
						fish.name = 'Guppy';
						break;
					}
					case 'Common Pond weak Fish': {
						fish.name = 'Frog';
						break;
					}
					case 'Uncommon Pond strong Fish': {
						fish.name = 'Betta';
						break;
					}
					case 'Uncommon Pond weak Fish': {
						fish.name = 'Koi';
						break;
					}
					case 'Rare Pond strong Fish': {
						fish.name = 'Chub';
						break;
					}
					case 'Rare Pond weak Fish': {
						fish.name = 'Giant Frog';
						break;
					}
					case 'Ultra Pond strong Fish': {
						fish.name = 'Golden Guppy';
						break;
					}
					case 'Ultra Pond weak Fish': {
						fish.name = 'Golden Frog';
						break;
					}
					case 'Giant Pond strong Fish': {
						fish.name = 'Lost Paycheck';
						break;
					}
					case 'Giant Pond weak Fish': {
						fish.name = 'Zombie Fish';
						break;
					}
					case 'Legendary Pond strong Fish': {
						fish.name = 'Golden Chub';
						break;
					}
					case 'Legendary Pond weak Fish': {
						fish.name = 'Platinum Frog';
						break;
					}
					case 'Lucky Pond strong Fish': {
						fish.name = 'Lost Wallet';
						break;
					}
					case 'Lucky Pond weak Fish': {
						fish.name = 'Lost Phone';
						break;
					}
					case 'Common Swamp strong Fish': {
						fish.name = 'Swamp Eel';
						break;
					}
					case 'Common Swamp weak Fish': {
						fish.name = 'Mud Fish';
						break;
					}
					case 'Uncommon Swamp strong Fish': {
						fish.name = 'Water Snake';
						break;
					}
					case 'Uncommon Swamp weak Fish': {
						fish.name = 'Bullfrog';
						break;
					}
					case 'Rare Swamp strong Fish': {
						fish.name = 'Viperfish';
						break;
					}
					case 'Rare Swamp weak Fish': {
						fish.name = 'Bogfish';
						break;
					}
					case 'Ultra Swamp strong Fish': {
						fish.name = 'Golden Eel';
						break;
					}
					case 'Ultra Swamp weak Fish': {
						fish.name = 'Golden Mudfish';
						break;
					}
					case 'Giant Swamp strong Fish': {
						fish.name = 'Crocodile';
						break;
					}
					case 'Giant Swamp weak Fish': {
						fish.name = 'Alligator';
						break;
					}
					case 'Legendary Swamp strong Fish': {
						fish.name = 'Golden Viperfish';
						break;
					}
					case 'Legendary Swamp weak Fish': {
						fish.name = 'Golden Bogfish';
						break;
					}
					case 'Lucky Swamp strong Fish': {
						fish.name = 'Lost Boot';
						break;
					}
					case 'Lucky Swamp weak Fish': {
						fish.name = 'Lost Hat';
						break;
					}
					case 'Common Coast strong Fish': {
						fish.name = 'Crab';
						break;
					}
					case 'Common Coast weak Fish': {
						fish.name = 'Clam';
						break;
					}
					case 'Uncommon Coast strong Fish': {
						fish.name = 'Lobster';
						break;
					}
					case 'Uncommon Coast weak Fish': {
						fish.name = 'Oyster';
						break;
					}
					case 'Rare Coast strong Fish': {
						fish.name = 'Octopus';
						break;
					}
					case 'Rare Coast weak Fish': {
						fish.name = 'Starfish';
						break;
					}
					case 'Ultra Coast strong Fish': {
						fish.name = 'Golden Crab';
						break;
					}
					case 'Ultra Coast weak Fish': {
						fish.name = 'Golden Clam';
						break;
					}
					case 'Giant Coast strong Fish': {
						fish.name = 'Jellyfish';
						break;
					}
					case 'Giant Coast weak Fish': {
						fish.name = 'Sea Serpent';
						break;
					}
					case 'Legendary Coast strong Fish': {
						fish.name = 'Golden Octopus';
						break;
					}
					case 'Legendary Coast weak Fish': {
						fish.name = 'Golden Starfish';
						break;
					}
					case 'Lucky Coast strong Fish': {
						fish.name = 'Lost Boot';
						break;
					}
					case 'Lucky Coast weak Fish': {
						fish.name = 'Lost Hat';
						break;
					}
					default: {
						break;
					}
					}

					fishes.push(fish);
				}
			}
		}

		// For each fish, ask user to confirm if they want to add it to the database
		// askUser(fishes, 0);

		fishes.forEach((fishData) => {
			const fish = new Fish(fishData);
			fish.save()
				.then(() => {
					console.log(`Fish "${fish.name}" created successfully`);
				})
				.catch((error) => {
					console.error(`Error creating fish "${fish.name}":`, error);
				});
		});
		generateSampleFish();

	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

function calculateFishValue(rarity) {
	// Based on rarity, randomly calculate the value of the fish
	const baseValue = 5;
	let value = baseValue;
	let startRange = 2;
	let endRange = 10;

	switch (rarity) {
	case 'Common':
		startRange = 2;
		endRange = 10;
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
		break;
	case 'Uncommon':
		startRange = 20;
		endRange = 50;
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
		break;
	case 'Rare':
		startRange = 50;
		endRange = 200;
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
		break;
	case 'Ultra':
		startRange = 500;
		endRange = 750;
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
		break;
	case 'Giant':
		startRange = 1000;
		endRange = 2500;
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
		break;
	case 'Legendary':
		startRange = 3000;
		endRange = 5500;
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
		break;
	case 'Lucky':
		startRange = 10000;
		endRange = 20000;
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
		break;
	default:
		value = Math.floor(Math.random() * ((endRange - startRange) / 5 + 1)) * 5 + startRange;
	}
	return value;
}

function generateFishIcon() {
	// You can implement your own logic to generate fish icons
	// For simplicity, let's return a placeholder icon
	return {
		'animated': false,
		'data': 'rawfish:1209352519726276648',
	};
}

function generateSampleFish() {
	const sampleFish = [
		{
			'name': 'Oarfish',
			'rarity': 'Ultra',
			'value': 500,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
		},
		{
			'name': 'Tuna',
			'rarity': 'Uncommon',
			'value': 50,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Cod',
			'rarity': 'Common',
			'value': 5,
			'icon': {
				'animated': false,
				'data': 'cod:1209352557630062633',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Sunfish',
			'rarity': 'Rare',
			'value': 200,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Rainbow Trout',
			'rarity': 'Uncommon',
			'value': 55,
			'icon': {
				'animated': false,
				'data': 'salmon:1209358095873085480',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Bluegill',
			'rarity': 'Common',
			'value': 3,
			'icon': {
				'animated': false,
				'data': 'salmon:1209358095873085480',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Catfish',
			'rarity': 'Uncommon',
			'value': 25,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Clownfish',
			'rarity': 'Uncommon',
			'value': 35,
			'icon': {
				'animated': false,
				'data': 'clownfish:1209352536037785611',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Carp',
			'rarity': 'Common',
			'value': 4,
			'__v': 0,
			'icon': {
				'animated': false,
				'data': 'cod:1209352557630062633',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Golden Trout',
			'rarity': 'Ultra',
			'value': 375,
			'icon': {
				'animated': false,
				'data': 'goldfish:1209358094598021140',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Tiger Shark',
			'rarity': 'Giant',
			'value': 1700,
			'icon': {
				'animated': false,
				'data': 'sharkyshark:1209358097009610842',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Magikarp',
			'rarity': 'Legendary',
			'value': 3000,
			'icon': {
				'animated': true,
				'data': 'magikarp:1209358098976874538',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Swordfish',
			'rarity': 'Rare',
			'value': 200,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Pufferfish',
			'rarity': 'Rare',
			'value': 250,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Salmon',
			'rarity': 'Uncommon',
			'value': 40,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Bass',
			'rarity': 'Uncommon',
			'value': 45,
			'icon': {
				'animated': false,
				'data':'salmon:120',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Snapping Turtle',
			'rarity': 'Rare',
			'value': 300,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'pond',
		},
		{
			'name': 'Guppy',
			'rarity': 'Common',
			'value': 2,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'pond',
		},
		{
			'name': 'Betta',
			'rarity': 'Uncommon',
			'value': 30,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'pond',
		},
		{
			'name': 'Frog',
			'rarity': 'Common',
			'value': 10,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'pond',
		},
		{
			'name': 'Koi',
			'rarity': 'Rare',
			'value': 275,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'pond',
		},
		{
			'name': 'Loach',
			'rarity': 'Common',
			'value': 6,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'pond',
		},
		{
			'name': 'Piranha',
			'rarity': 'Rare',
			'value': 250,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Electric Eel',
			'rarity': 'Rare',
			'value': 275,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Giant Squid',
			'rarity': 'Giant',
			'value': 2000,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Whale',
			'rarity': 'Giant',
			'value': 2500,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Dolphin',
			'rarity': 'Giant',
			'value': 3000,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Narwhal',
			'rarity': 'Legendary',
			'value': 3000,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Seahorse',
			'rarity': 'Common',
			'value': 8,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Pike',
			'rarity': 'Uncommon',
			'value': 60,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Sturgeon',
			'rarity': 'Rare',
			'value': 200,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Walleye',
			'rarity': 'Uncommon',
			'value': 55,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Perch',
			'rarity': 'Common',
			'value': 5,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'lake',
		},
		{
			'name': 'Steelhead',
			'rarity': 'Uncommon',
			'value': 50,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Shad',
			'rarity': 'Rare',
			'value': 225,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Chub',
			'rarity': 'Common',
			'value': 7,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'river',
		},
		{
			'name': 'Mahi Mahi',
			'rarity': 'Rare',
			'value': 250,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Azure Marlin',
			'rarity': 'Ultra',
			'value': 400,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Jellyfish',
			'rarity': 'Rare',
			'value': 275,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Baracuda',
			'rarity': 'Uncommon',
			'value': 60,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Sailfish',
			'rarity': 'Rare',
			'value': 275,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'ocean',
		},
		{
			'name': 'Clam',
			'rarity': 'Common',
			'value': 5,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Lobster',
			'rarity': 'Uncommon',
			'value': 40,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Crab',
			'rarity': 'Common',
			'value': 8,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Giant Shrimp',
			'rarity': 'Ultra',
			'value': 400,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Octopus',
			'rarity': 'Rare',
			'value': 250,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Squid',
			'rarity': 'Uncommon',
			'value': 50,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Sea Urchin',
			'rarity': 'Rare',
			'value': 275,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Unusual Starfish',
			'rarity': 'Legendary',
			'value': 3000,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Sand Dab',
			'rarity': 'Uncommon',
			'value': 30,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Kelp',
			'rarity': 'Common',
			'value': 1,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'coast',
		},
		{
			'name': 'Mudfish',
			'rarity': 'Common',
			'value': 5,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Bullfrog',
			'rarity': 'Common',
			'value': 10,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Water Snake',
			'rarity': 'Uncommon',
			'value': 35,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Leech',
			'rarity': 'Common',
			'value': 5,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Gar',
			'rarity': 'Rare',
			'value': 250,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Marsh Snail',
			'rarity': 'Uncommon',
			'value': 30,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Swamp Eel',
			'rarity': 'Rare',
			'value': 225,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Mudskipper',
			'rarity': 'Common',
			'value': 15,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Crocodile',
			'rarity': 'Ultra',
			'value': 500,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Giant Salamander',
			'rarity': 'Giant',
			'value': 1000,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'weak',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
		{
			'name': 'Loch Ness Monster',
			'rarity': 'Legendary',
			'value': 3000,
			'icon': {
				'animated': false,
				'data': 'rawfish:1209352519726276648',
			},
			'qualities': [
				'strong',
			],
			'type': 'fish',
			'biome': 'swamp',
		},
	];

	sampleFish.forEach((fishData) => {
		const fish = new Fish(fishData);
		// check if fish name already exists
		const fishExists = Fish.findOne({ name: fish.name });
		if (fishExists) {
			console.log(`Fish "${fishData.name}" already exists`);
			return;
		}
		else {
			fish.save()
				.then(() => {
					console.log(`Fish "${fishData.name}" created successfully`);
				})
				.catch((error) => {
					console.error(`Error creating fish "${fishData.name}":`, error);
				});
		}
	});
}