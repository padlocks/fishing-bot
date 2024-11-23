// Import the necessary modules
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const { Quest } = require('../schemas/QuestSchema');
const { Rod } = require('../schemas/RodSchema');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || config.handler.mongodb.uri, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to MongoDB');
		// Generate and publish sample quests
		generateSampleQuests();
	})
	.catch((error) => {
		console.error('Error connecting to MongoDB:', error);
	});

// Function to generate sample quests
async function generateSampleQuests() {
	// Define an array of sample quest data
	const sampleQuests = [
		{
			title: 'Catch 15 Trout',
			description: 'Catch 15 trout from the river.',
			reward: [],
			cash: 500,
			xp: 450,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['rainbow trout', 'golden trout'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Catch 15 Carp',
			description: 'Catch 15 carp from the river.',
			reward: [],
			cash: 350,
			xp: 500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['carp'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Find the Lucky Magikarp',
			description: 'Embark on a journey to find and catch the lucky magikarp.',
			reward: [],
			cash: 1000,
			xp: 2000,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['magikarp'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Help the Village!',
			description: 'Assist the local village by catching 30 fish for them.',
			reward: [],
			cash: 3000,
			xp: 300,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 30,
			daily: false,
			repeatable: true,
			type: 'quest',
		},
		{
			title: 'Lucky Fisher',
			description: 'Catch 25 lucky fish.',
			reward: [await Rod.findOne({ name: 'Lucky Rod' })],
			cash: 3000,
			xp: 3000,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['lucky'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 25,
			daily: false,
			repeatable: true,
			type: 'quest',
		},

		// Daily quests
		{
			title: 'Catch 100 Fish',
			description: 'Catch 100 fish a day.',
			reward: [],
			cash: 500,
			xp: 500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 100,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 250 Fish',
			description: 'Catch 250 fish a day.',
			reward: [],
			cash: 500,
			xp: 500,
			requirements: {
				level: 20,
				previous: ['Catch 100 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 250,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 500 Fish',
			description: 'Catch 500 fish a day.',
			reward: [],
			cash: 1000,
			xp: 1000,
			requirements: {
				level: 30,
				previous: ['Catch 250 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 500,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 750 Fish',
			description: 'Catch 750 fish a day.',
			reward: [],
			cash: 2000,
			xp: 2000,
			requirements: {
				level: 40,
				previous: ['Catch 500 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 750,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Professional Fisher',
			description: 'Catch 1000 fish to prove your dedication to the art of fishing.',
			reward: [],
			cash: 4000,
			xp: 4000,
			requirements: {
				level: 50,
				previous: ['Catch 750 Fish'],
			},
			progressType: {
				fish: ['any'],
				rarity: ['any'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1000,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 1 Legendary Fish',
			description: 'Catch 1 legendary fish.',
			reward: [],
			cash: 3000,
			xp: 1500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['legendary'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 1,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 5 Ultra Fish',
			description: 'Catch 5 Ultra fish.',
			reward: [],
			cash: 2000,
			xp: 1500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['ultra'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 5,
			daily: true,
			type: 'quest',
		},
		{
			title: 'Catch 15 Rare Fish',
			description: 'Catch 15 Rare fish.',
			reward: [],
			cash: 1000,
			xp: 1500,
			requirements: {
				level: 0,
				previous: [],
			},
			progressType: {
				fish: ['any'],
				rarity: ['rare'],
				rod: 'any',
				qualities: ['any'],
			},
			progressMax: 15,
			daily: true,
			type: 'quest',
		},

		// Advanced quests
		{
			"title": "Storm Chaser",
			"description": "During a fierce storm, rare fish are rumored to appear. Prove your skills by catching the elusive \"Flashfin Salmon\" in the rain.",
			"reward": [],
			"cash": 5000,
			"xp": 1000,
			"requirements": {
				"level": 10,
				"previous": [],
				"weather": "rainy",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["Flashfin Salmon"],
				"rarity": ["Ultra"],
				"rod": "any",
				"qualities": ["any"],
			},
			"progressMax": 1,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"type": "quest"
		},
		/*
		+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Source Material      | Title               | Description                                                                                                                                                                                                | Completion Conditions  | Reward                                                                                           | Notes                                                 |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Game reference (MHW) | Capture the Ancient | A certain researcher is searching for a fish thought to be long since extinct.                                                                                                                             | Catch petricanth x1    | Exorbitant amount of money or rare fishing rod part.                                             | - Not repeatable                                      |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Any season, weather, time of day                    |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Swamp biome                                         |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Always available after lvl 40                       |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Special condition: MUST CATCH AFTER ACCEPTING QUEST |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Original             | Hard DAYS Work      | You've been offered a contract: catch 100 King Salmon for the upcoming summer festival!                                                                                                                    | Catch king salmon x100 | Fresh sashimi (just make this a booster that increases odds of catching king salmon rarity fish) | - Repeatable once a day, but MUST be summer           |
|                      |                     | Who knows? You might even be offered a bite of the sashimi they're preparing.                                                                                                                              |                        |                                                                                                  | - Always available, no lvl requirements               |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Special condition: can turn in fish from inventory  |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Original             | My First Rod I      | Hey, there! Haven't seen you around these docks before. Why don't I show you the ropes and get you started with a trusty rod? Go ahead and /fish for a bit. When you've caught ten, come talk to me again. | Catch any fish x10     | Basic rod piece x1                                                                               | - Not repeatable                                      |
|                      |                     |                                                                                                                                                                                                            |                        | Shrimp x10                                                                                       | - Any season, weather, time of day                    |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Ocean biome                                         |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Always available (tutorial quest)                   |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Original             | My First Rod II     | Wow, you got the hang of things real quick! Why don't you try to /equip some bait? The shrimp I gave you should attract a few more types of fish!                                                          | Catch any fish x10     | Basic handle x1                                                                                  | - Not repeatable                                      |
|                      |                     |                                                                                                                                                                                                            |                        | Tutorial box x1                                                                                  | - Any season, weather, time of day                    |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Ocean biome                                         |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Available after completing My First Rod I           |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Original             | My First Rod III    | You're doing great! Go ahead and /open the box I gave you!                                                                                                                                                 | Open tutorial box      | Basic reel x1 (from box)                                                                         | - Not repeatable                                      |
|                      |                     |                                                                                                                                                                                                            |                        | $750                                                                                             | - Any season, weather, time of day                    |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Ocean biome                                         |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Available after completing My First Rod II          |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Original             | My First Rod IV     | You can get some more neat things to open from the shop. Why don't you go visit the /shop and purchase a Fishing Crate?                                                                                    | Buy fishing crate x1   | Basic hook x1                                                                                    | - Not repeatable                                      |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Any season, weather, time of day                    |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Ocean biome                                         |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Available after completing My First Rod III         |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
| Original             | My First Rod V      | All right! You have everything you need to make your own rod now! What? 'It's not built for you?' Of course, it's not! A good fisherman should know how to /craft their own rod!                           | Craft basic rod x1     | $2000                                                                                            | - Not repeatable                                      |
|                      |                     |                                                                                                                                                                                                            |                        | 1000 XP                                                                                          | - Any season, weather, time of day                    |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Ocean biome                                         |
|                      |                     |                                                                                                                                                                                                            |                        |                                                                                                  | - Available after completing My First Rod IV          |
+----------------------+---------------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------------------+--------------------------------------------------------------------------------------------------+-------------------------------------------------------+
*/
		{
			"title": "Capture the Ancient",
			"description": "A certain researcher is searching for a fish thought to be long since extinct.",
			"reward": [],
			"cash": 10000,
			"xp": 5000,
			"requirements": {
				"level": 40,
				"previous": [],
				"weather": "any",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["Petricanth"],
				"rarity": ["Legendary"],
				"rod": "any",
				"qualities": ["any"],
				"special": [],
			},
			"progressMax": 1,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"type": "quest"
		},
		{
			"title": "Hard DAYS Work",
			"description": "You've been offered a contract: catch 100 King Salmon for the upcoming summer festival!",
			"reward": [],
			"cash": 5000,
			"xp": 1000,
			"requirements": {
				"level": 0,
				"previous": [],
				"weather": "summer",
				"timeOfDay": "any",
				"specialConditions": ["once a day"],
			},
			"progressType": {
				"fish": ["King Salmon"],
				"rarity": ["any"],
				"rod": "any",
				"qualities": ["any"],
				"special": [],
			},
			"progressMax": 100,
			"daily": false,
			"repeatable": true,
			"fishable": false,
			"type": "quest"
		},
		{
			"title": "My First Rod I",
			"description": "Hey, there! Haven't seen you around these docks before. Why don't I show you the ropes and get you started with a trusty rod? Go ahead and /fish for a bit. When you've caught ten, come talk to me again.",
			"reward": [],
			"cash": 100,
			"xp": 50,
			"requirements": {
				"level": 0,
				"previous": [],
				"weather": "any",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["any"],
				"rarity": ["any"],
				"rod": "any",
				"qualities": ["any"],
				"special": [],
			},
			"progressMax": 10,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"continuous": true,
			"type": "quest",
			"questType": "tutorial",
		},
		{
			"title": "My First Rod II",
			"description": "Wow, you got the hang of things real quick! Why don't you try to /equip some bait? The shrimp I gave you should attract a few more types of fish!",
			"reward": [],
			"cash": 100,
			"xp": 50,
			"requirements": {
				"level": 0,
				"previous": ["My First Rod I"],
				"weather": "any",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["any"],
				"rarity": ["any"],
				"rod": "any",
				"qualities": ["any"],
				"special": ["/equip"],
			},
			"progressMax": 10,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"continuous": true,
			"type": "quest",
			"questType": "tutorial",
		},
		{
			"title": "My First Rod III",
			"description": "You're doing great! Go ahead and /open the box I gave you!",
			"reward": [],
			"cash": 750,
			"xp": 50,
			"requirements": {
				"level": 0,
				"previous": ["My First Rod II"],
				"weather": "any",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["any"],
				"rarity": ["any"],
				"rod": "any",
				"qualities": ["any"],
				"special": ["/open"],
			},
			"progressMax": 1,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"continuous": true,
			"type": "quest",
			"questType": "tutorial",
		},
		{
			"title": "My First Rod IV",
			"description": "You can get some more neat things to open from the shop. Why don't you go visit the /shop and purchase a Fishing Crate?",
			"reward": [],
			"cash": 750,
			"xp": 50,
			"requirements": {
				"level": 0,
				"previous": ["My First Rod III"],
				"weather": "any",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["any"],
				"rarity": ["any"],
				"rod": "any",
				"qualities": ["any"],
				"special": ["/shop"],
			},
			"progressMax": 1,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"continuous": true,
			"type": "quest",
			"questType": "tutorial",
		},
		{
			"title": "My First Rod V",
			"description": "All right! You have everything you need to make your own rod now! What? 'It's not built for you?' Of course, it's not! A good fisherman should know how to /craft their own rod!",
			"reward": [],
			"cash": 2000,
			"xp": 1000,
			"requirements": {
				"level": 0,
				"previous": ["My First Rod IV"],
				"weather": "any",
				"timeOfDay": "any",
			},
			"progressType": {
				"fish": ["any"],
				"rarity": ["any"],
				"rod": "any",
				"qualities": ["any"],
				"special": ["/craft"],
			},
			"progressMax": 1,
			"daily": false,
			"repeatable": false,
			"fishable": false,
			"continuous": false,
			"type": "quest",
			"questType": "tutorial",
		},

	];

	// Loop through the sample quests and create new quest documents
	sampleQuests.forEach((questData) => {
		const quest = new Quest(questData);
		quest.save()
			.then(() => {
				console.log(`Quest "${quest.title}" created successfully`);
			})
			.catch((error) => {
				console.error(`Error creating quest "${quest.title}":`, error);
			});
	});
}
