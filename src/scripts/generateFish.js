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
						fish.description = 'Magikarp is a type of fish found in the ocean. It is known for its small size and weak swimming ability. Magikarp are often considered a nuisance by anglers, but they can evolve into a powerful and majestic creature.';
						break;
					}
					case 'Common River strong Fish': {
						fish.name = 'Salmon';
						fish.description = 'Salmon is a type of fish found in rivers and streams. It is known for its distinctive pink flesh and rich flavor. Salmon are popular food fish and are often sought after by anglers for their fighting spirit.';
						break;
					}
					case 'Common River weak Fish': {
						fish.name = 'Carp';
						fish.description = 'Carp is a type of fish found in rivers and lakes. It is known for its large size and hardy nature. Although carp are often considered a nuisance by anglers, they can be a challenging and rewarding catch.';
						break;
					}
					case 'Uncommon River strong Fish': {
						fish.name = 'Catfish';
						fish.description = 'Catfish is a type of fish found in rivers and lakes. It is known for its whisker-like barbels and bottom-feeding behavior. Catfish are popular food fish and are often sought after by anglers for their unique taste.';
						break;
					}
					case 'Uncommon River weak Fish': {
						fish.name = 'Rainbow Trout';
						fish.description = 'Rainbow Trout is a type of fish found in rivers and streams. It is known for its colorful appearance and delicate flavor. Rainbow Trout can be found in a variety of habitats and are popular game fish.';
						break;
					}
					case 'Rare River strong Fish': {
						fish.name = 'Sturgeon';
						fish.description = 'Sturgeon is a type of fish found in rivers and lakes. It is known for its large size and prehistoric appearance. Sturgeon will often migrate between freshwater and saltwater habitats.';
						break;
					}
					case 'Rare River weak Fish': {
						fish.name = 'Shad';
						fish.description = 'Shad is a type of fish found in rivers and lakes. It is known for its silvery appearance and strong flavor. Shad play an important role in the ecosystem as a food source for other species of fish.';
						break;
					}
					case 'Ultra River strong Fish': {
						fish.name = 'Golden Trout';
						fish.description = 'Golden Trout is a type of fish found in rivers and streams. It is known for its vibrant golden color and delicate flavor. Golden Trout are popular game fish and are often sought after by anglers for their beauty.';
						break;
					}
					case 'Ultra River weak Fish': {
						fish.name = 'Golden Carp';
						fish.description = 'Golden Carp is a type of fish found in rivers and lakes. It is known for its golden scales and peaceful nature. Golden Carp are often kept as ornamental fish in ponds and aquariums.';
						break;
					}
					case 'Giant River strong Fish': {
						fish.name = 'Queen Salmon';
						fish.description = 'Queen Salmon is a type of fish found in rivers and streams. It is known for its large size and powerful swimming ability. Queen Salmon lay their eggs in freshwater and migrate to the ocean to feed.';
						break;
					}
					case 'Giant River weak Fish': {
						fish.name = 'King Salmon';
						fish.description = 'King Salmon is a type of fish found in rivers and streams. It is known for its large size and distinctive flavor. King Salmon are popular food fish and are often sought after by anglers for their rich taste.';
						break;
					}
					case 'Legendary River strong Fish': {
						fish.name = 'Golden Sturgeon';
						fish.description = 'Golden Sturgeon is a legendary fish said to dwell in the depths of rivers and lakes. It is known for its massive size and golden scales. Golden Sturgeon are said to bring good luck to those who catch them.';
						break;
					}
					case 'Legendary River weak Fish': {
						fish.name = 'Golden Salmon';
						fish.description = 'Golden Salmon is a legendary fish said to dwell in the depths of rivers and streams. It is known for its vibrant golden color and delicate flavor. Golden Salmon are said to bring prosperity and abundance to those who catch them.';
						break;
					}
					case 'Lucky River strong Fish': {
						fish.name = 'Noxclate Fish';
						fish.description = 'Noxclate Fish is a rare and mysterious creature said to dwell in the dark depths of rivers and lakes. It is known for its elusive nature and otherworldly appearance. Noxclate Fish are said to bring good fortune to those who encounter them.';
						break;
					}
					case 'Lucky River weak Fish': {
						fish.name = 'Lunafin Fish';
						fish.description = 'Lunafin Fish is a rare and magical creature said to dwell in the moonlit waters of rivers and streams. It is known for its shimmering scales and ethereal beauty. Lunafin Fish are said to bring luck and prosperity to those who catch them.';
						break;
					}
					case 'Common Lake strong Fish': {
						fish.name = 'Bass';
						fish.description = 'Bass is a type of fish found in lakes and rivers. It is known for its large size and powerful swimming ability. Bass fishing is a popular sport in many parts of the world.';
						break;
					}
					case 'Common Lake weak Fish': {
						fish.name = 'Bluegill';
						fish.description = 'Bluegill is a type of fish found in lakes and ponds. It is known for its small size and colorful appearance. Bluegill are popularly caught by anglers and are often used as bait for larger fish.';
						break;
					}
					case 'Uncommon Lake strong Fish': {
						fish.name = 'Walleye';
						fish.description = 'Walleye is a type of fish found in lakes and rivers. It is known for its large size and distinctive appearance. Walleye are popular game fish and are often sought after by anglers for their delicate flavor.';
						break;
					}
					case 'Uncommon Lake weak Fish': {
						fish.name = 'Perch';
						fish.description = 'Perch is a type of fish found in lakes and rivers. It is known for its small size and striped appearance. Perch are popular food fish and are often caught by anglers for their mild flavor.';
						break;
					}
					case 'Rare Lake strong Fish': {
						fish.name = 'Pike';
						fish.description = 'Pike is a type of fish found in lakes and rivers. It is known for its large size and aggressive nature. Pike are apex predators of the water and are often sought after by anglers for their challenging nature.';
						break;
					}
					case 'Rare Lake weak Fish': {
						fish.name = 'Loach';
						fish.description = 'Loach is a type of fish found in lakes and rivers. It is known for its small size and bottom-feeding behavior. Loach are often used as bait for other species of fish.';
						break;
					}
					case 'Ultra Lake strong Fish': {
						fish.name = 'Steelhead';
						fish.description = 'Steelhead is a type of fish found in lakes and rivers. It is known for its large size and powerful swimming ability. Steelhead are zealous fighters and are popular game fish among anglers.';
						break;
					}
					case 'Ultra Lake weak Fish': {
						fish.name = 'Golden Bass';
						fish.description = 'Golden Bass is a type of fish found in lakes and rivers. It is known for its golden scales and peaceful nature. Golden Bass are often kept as ornamental fish in ponds and aquariums.';
						break;
					}
					case 'Giant Lake strong Fish': {
						fish.name = 'Loch Ness Monster';
						fish.description = 'Loch Ness Monster is a legendary creature said to dwell in the depths of Loch Ness in Scotland. It is known for its long neck and humped back. The Loch Ness Monster is a popular figure in Scottish folklore and has captured the imagination of people around the world.';
						break;
					}
					case 'Giant Lake weak Fish': {
						fish.name = 'Ogopogo';
						fish.description = 'Ogopogo is a legendary creature said to dwell in the depths of Okanagan Lake in British Columbia, Canada. It is known for its long neck and serpentine body. Ogopogo is a popular figure in Canadian folklore and has become a symbol of the region.';
						break;
					}
					case 'Legendary Lake strong Fish': {
						fish.name = 'Golden Pike';
						fish.description = 'Golden Pike is a legendary fish said to dwell in the depths of lakes and rivers. It is known for its massive size and golden scales. Golden Pike possess mystical powers and are said to bring good fortune to those who catch them.';
						break;
					}
					case 'Legendary Lake weak Fish': {
						fish.name = 'Golden Loach';
						fish.description = 'Golden Loach is a legendary fish said to dwell in the depths of lakes and rivers. It is known for its shimmering scales and elusive nature. Golden Loach are said to bring prosperity and abundance to those who catch them.';
						break;
					}
					case 'Lucky Lake strong Fish': {
						fish.name = 'Lost Ring';
						fish.description = 'Lost Ring is a rare and valuable item said to be hidden in the depths of lakes and rivers. It is known for its intricate design and sparkling gemstones.';
						break;
					}
					case 'Lucky Lake weak Fish': {
						fish.name = 'Lost Necklace';
						fish.description = 'Lost Necklace is a rare and precious item said to be hidden in the depths of lakes and rivers. It is known for its elegant design and shimmering gemstones.';
						break;
					}
					case 'Common Pond strong Fish': {
						fish.name = 'Guppy';
						fish.description = 'Guppy is a type of fish commonly found in ponds and aquariums. It is known for its small size and colorful appearance. Guppies are popular ornamental fish and are often kept in home aquariums.';
						break;
					}
					case 'Common Pond weak Fish': {
						fish.name = 'Frog';
						fish.description = 'Frog is a type of amphibian commonly found in ponds and wetlands. It is known for its long legs and distinctive croaking sound. Frogs play an important role in the ecosystem as both predator and prey.';
						break;
					}
					case 'Uncommon Pond strong Fish': {
						fish.name = 'Betta';
						fish.description = 'Betta is a type of fish commonly found in ponds and aquariums. It is known for its vibrant colors and aggressive nature. Betta fish are popular ornamental fish and are often kept in home aquariums.';
						break;
					}
					case 'Uncommon Pond weak Fish': {
						fish.name = 'Koi';
						fish.description = 'Koi is a type of fish commonly found in ponds and water gardens. It is known for its large size and colorful appearance. Koi are popular ornamental fish and are often kept in decorative ponds.';
						break;
					}
					case 'Rare Pond strong Fish': {
						fish.name = 'Chub';
						fish.description = 'Chub is a type of fish commonly found in ponds and lakes. It is known for its large size and powerful swimming ability. Chub are popular game fish and sport a distinctive appearance.';
						break;
					}
					case 'Rare Pond weak Fish': {
						fish.name = 'Giant Frog';
						fish.description = 'Giant Frog is a type of amphibian commonly found in ponds and wetlands. It is known for its massive size and deep croaking sound. Giant Frogs are often associated with myths and legends.';
						break;
					}
					case 'Ultra Pond strong Fish': {
						fish.name = 'Golden Guppy';
						fish.description = 'Golden Guppy is a rare and valuable fish found in ponds and aquariums. It is known for its shimmering scales and peaceful nature. Golden Guppy are often kept as ornamental fish in home aquariums.';
						break;
					}
					case 'Ultra Pond weak Fish': {
						fish.name = 'Golden Frog';
						fish.description = 'Golden Frog is a rare and mystical creature found in ponds and wetlands. It is known for its golden color and magical properties. Golden Frogs are said to bring good luck and prosperity to those who encounter them.';
						break;
					}
					case 'Giant Pond strong Fish': {
						fish.name = 'Jumbo Koi';
						fish.description = 'Jumbo Koi is a massive and majestic fish found in ponds and water gardens. It is known for its enormous size and vibrant colors. Jumbo Koi are prized for their beauty and are often kept in decorative ponds.';
						break;
					}
					case 'Giant Pond weak Fish': {
						fish.name = 'Zombie Fish';
						fish.description = 'Zombie Fish is a rare and mysterious creature found in the depths of ponds and lakes. It is known for its undead appearance and eerie behavior. Zombie Fish are said to bring bad luck and misfortune to those who encounter them.';
						break;
					}
					case 'Legendary Pond strong Fish': {
						fish.name = 'Golden Chub';
						fish.description = 'Golden Chub is a legendary fish said to dwell in the depths of ponds and lakes. It is known for its massive size and golden scales. Golden Chub are said to bring good fortune and prosperity to those who catch them.';
						break;
					}
					case 'Legendary Pond weak Fish': {
						fish.name = 'Platinum Frog';
						fish.description = 'Platinum Frog is a legendary creature said to dwell in the depths of ponds and wetlands. It is known for its shimmering platinum color and mystical properties. Platinum Frog are said to bring youth and vitality to those who encounter them.';
						break;
					}
					case 'Lucky Pond strong Fish': {
						fish.name = 'Lost Wallet';
						fish.description = 'Lost Wallet is a rare and valuable item said to be hidden in the depths of ponds and lakes. It is known for its leather exterior and hidden treasures.';
						break;
					}
					case 'Lucky Pond weak Fish': {
						fish.name = 'Lost Phone';
						fish.description = 'Lost Phone is a rare and precious item said to be hidden in the depths of ponds and lakes. It is known for its sleek design and advanced technology.';
						break;
					}
					case 'Common Swamp strong Fish': {
						fish.name = 'Swamp Eel';
						fish.description = 'Swamp Eel is a type of fish found in swamps and wetlands. It is known for its long, snake-like body and slippery skin. Swamp Eel are often used in cooking and can be found in a variety of dishes.';
						break;
					}
					case 'Common Swamp weak Fish': {
						fish.name = 'Mud Fish';
						fish.description = 'Mud Fish is a type of fish found in swamps and wetlands. It is known for its small size and muddy appearance. Mud Fish are often found in shallow waters and feed on insects and small crustaceans.';
						break;
					}
					case 'Uncommon Swamp strong Fish': {
						fish.name = 'Water Snake';
						fish.description = 'Water Snake is a type of fish found in swamps and wetlands. It is known for its long, slender body and sharp teeth. Water Snake are often feared by anglers and are considered a nuisance in many fishing communities.';
						break;
					}
					case 'Uncommon Swamp weak Fish': {
						fish.name = 'Bullfrog';
						fish.description = 'Bullfrog is a type of amphibian found in swamps and wetlands. It is known for its large size and deep croaking sound. Bullfrog are often associated with myths and legends.';
						break;
					}
					case 'Rare Swamp strong Fish': {
						fish.name = 'Viperfish';
						fish.description = 'Viperfish is a type of fish found in swamps and wetlands. It is known for its sharp teeth and bioluminescent appearance. Viperfish are often found in deep waters and are rarely seen by humans.';
						break;
					}
					case 'Rare Swamp weak Fish': {
						fish.name = 'Bogfish';
						fish.description = 'Bogfish is a type of fish found in swamps and wetlands. It is known for its slimy skin and foul odor. Bogfish are often considered a nuisance by anglers and are rarely eaten.';
						break;
					}
					case 'Ultra Swamp strong Fish': {
						fish.name = 'Golden Eel';
						fish.description = 'Golden Eel is a rare and valuable fish found in swamps and wetlands. It is known for its shimmering scales and peaceful nature. Golden Eel are often kept as ornamental fish in home aquariums.';
						break;
					}
					case 'Ultra Swamp weak Fish': {
						fish.name = 'Golden Mudfish';
						fish.description = 'Golden Mudfish is a rare and mystical creature found in swamps and wetlands. It is known for its golden color and magical properties. Golden Mudfish are said to bring good luck and prosperity to those who encounter them.';
						break;
					}
					case 'Giant Swamp strong Fish': {
						fish.name = 'Crocodile';
						fish.description = 'Crocodile is a type of reptile found in swamps and wetlands. It is known for its large size and powerful jaws. Crocodiles are apex predators of the water and are often feared by humans.';
						break;
					}
					case 'Giant Swamp weak Fish': {
						fish.name = 'Alligator';
						fish.description = 'Alligator is a type of reptile found in swamps and wetlands. It is known for its large size and armored body. Alligators will often bask in the sun to regulate their body temperature.';
						break;
					}
					case 'Legendary Swamp strong Fish': {
						fish.name = 'Golden Viperfish';
						fish.description = 'Golden Viperfish is a legendary fish said to dwell in the depths of swamps and wetlands. It is known for its massive size and golden scales. Golden Viperfish are said to bring good fortune and prosperity to those who catch them.';
						break;
					}
					case 'Legendary Swamp weak Fish': {
						fish.name = 'Golden Bogfish';
						fish.description = 'Golden Bogfish is a legendary fish said to dwell in the depths of swamps and wetlands. It is known for its shimmering scales and elusive nature. Golden Bogfish are said to bring youth and vitality to those who encounter them.';
						break;
					}
					case 'Lucky Swamp strong Fish': {
						fish.name = 'Lost Boot';
						fish.description = 'Lost Boot is a rare item hidden in the depths of swamps and wetlands.';
						fish.value = 0;
						break;
					}
					case 'Lucky Swamp weak Fish': {
						fish.name = 'Lost Hat';
						fish.description = 'Lost Hat is a rare item hidden in the depths of swamps and wetlands.';
						fish.value = 0;
						break;
					}
					case 'Common Coast strong Fish': {
						fish.name = 'Crab';
						fish.description = 'Crab is a type of crustacean found in coastal waters. It is known for its hard shell and delicious meat. Crabs are popular seafood items and are often used in a variety of dishes.';
						break;
					}
					case 'Common Coast weak Fish': {
						fish.name = 'Clam';
						fish.description = 'Clam is a type of mollusk found in coastal waters. It is known for its hard shell and tender meat. Clams are popular seafood items and are often used in soups and stews.';
						break;
					}
					case 'Uncommon Coast strong Fish': {
						fish.name = 'Lobster';
						fish.description = 'Lobster is a type of crustacean found in coastal waters. It is known for its large size and sweet flavor. Lobsters are popular seafood items and are often served as a delicacy.';
						break;
					}
					case 'Uncommon Coast weak Fish': {
						fish.name = 'Oyster';
						fish.description = 'Oyster is a type of mollusk found in coastal waters. It is known for its hard shell and briny flavor. Oysters are popular seafood items and are often served raw or cooked.';
						break;
					}
					case 'Rare Coast strong Fish': {
						fish.name = 'Octopus';
						fish.description = 'Octopus is a type of cephalopod found in coastal waters. It is known for its eight arms and intelligent behavior. Octopus are skilled hunters and can change color to blend in with their surroundings.';
						break;
					}
					case 'Rare Coast weak Fish': {
						fish.name = 'Starfish';
						fish.description = 'Starfish is a type of echinoderm found in coastal waters. It is known for its five arms and distinctive shape. Starfish play an important role in the ecosystem as scavengers and predators.';
						break;
					}
					case 'Ultra Coast strong Fish': {
						fish.name = 'Golden Crab';
						fish.description = 'Golden Crab is a rare and valuable crustacean found in coastal waters. It is known for its golden shell and delicate meat. Golden Crab are often considered a delicacy and are highly prized by seafood enthusiasts.';
						break;
					}
					case 'Ultra Coast weak Fish': {
						fish.name = 'Golden Clam';
						fish.description = 'Golden Clam is a rare and precious mollusk found in coastal waters. It is known for its golden shell and lustrous pearls. Golden Clam are often sought after by collectors and are said to bring good luck and prosperity.';
						break;
					}
					case 'Giant Coast strong Fish': {
						fish.name = 'Jellyfish';
						fish.description = 'Jellyfish is a type of gelatinous creature found in coastal waters. It is known for its translucent body and stinging tentacles. Jellyfish are often found in large swarms and can be dangerous to humans.';
						break;
					}
					case 'Giant Coast weak Fish': {
						fish.name = 'Sea Serpent';
						fish.description = 'Sea Serpent is a legendary creature said to dwell in the depths of coastal waters. It is known for its long, serpentine body and fearsome appearance. Sea Serpent are often associated with myths and legends.';
						break;
					}
					case 'Legendary Coast strong Fish': {
						fish.name = 'Golden Octopus';
						fish.description = 'Golden Octopus is a legendary creature said to dwell in the depths of coastal waters. It is known for its massive size and golden color. Golden Octopus are said to possess mystical powers and are said to bring good fortune to those who encounter them.';
						break;
					}
					case 'Legendary Coast weak Fish': {
						fish.name = 'Golden Starfish';
						fish.description = 'Golden Starfish is a legendary creature said to dwell in the depths of coastal waters. It is known for its shimmering golden color and magical properties. Golden Starfish are said to bring luck and prosperity to those who encounter them.';
						break;
					}
					case 'Lucky Coast strong Fish': {
						fish.name = 'Lost Boot';
						fish.description = 'Lost Boot is a rare item hidden in the depths of coastal waters.';
						fish.value = 0;
						break;
					}
					case 'Lucky Coast weak Fish': {
						fish.name = 'Lost Hat';
						fish.description = 'Lost Hat is a rare item hidden in the depths of coastal waters.';
						fish.value = 0;
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