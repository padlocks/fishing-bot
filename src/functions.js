const chalk = require("chalk");
const { Fish } = require("./schemas/FishSchema")
const { User } = require("./schemas/UserSchema")
const { Rod } = require("./schemas/RodSchema")


/**
 * Logs a message with optional styling.
 *
 * @param {string} string - The message to log.
 * @param {'info' | 'err' | 'warn' | 'done' | undefined} style - The style of the log.
 */
const log = (string, style) => {
  const styles = {
    info: { prefix: chalk.blue("[INFO]"), logFunction: console.log },
    err: { prefix: chalk.red("[ERROR]"), logFunction: console.error },
    warn: { prefix: chalk.yellow("[WARNING]"), logFunction: console.warn },
    done: { prefix: chalk.green("[SUCCESS]"), logFunction: console.log },
  };

  const selectedStyle = styles[style] || { logFunction: console.log };
  selectedStyle.logFunction(`${selectedStyle.prefix || ""} ${string}`);
};

/**
 * Formats a timestamp.
 *
 * @param {number} time - The timestamp in milliseconds.
 * @param {import('discord.js').TimestampStylesString} style - The timestamp style.
 * @returns {string} - The formatted timestamp.
 */
const time = (time, style) => {
  return `<t:${Math.floor(time / 1000)}${style ? `:${style}` : ""}>`;
};

/**
 * Whenever a string is a valid snowflake (for Discord).

 * @param {string} id 
 * @returns {boolean}
 */
const isSnowflake = (id) => {
  return /^\d+$/.test(id);
};

const generateXP = (min=10, max=25) => {
  return Math.floor(Math.random() * (max - min) + min);
};

const generateCash = (min=10, max=100) => {
  return Math.floor(Math.random() * (max - min) + min);
};

function getRandomInteger(max) {
  return Math.floor(Math.random() * max);
}
function getWeightedChoice(choices, weights) {
  const sumOfWeights = weights.reduce((acc, x) => acc + x, 0);
  let randomInt = getRandomInteger(sumOfWeights) + 1;
  for (const [index, weight] of weights.entries()) {
    randomInt = randomInt - weight;
    if (randomInt <= 0) {
      return choices[index];
    }
  }
}

const fish = async (rod) => {
  let generation;
  let rodObject = await Rod.findOne({name: rod});
  let capabilities = rodObject.capabilities;
  switch (rod) {
    case "Old Rod": {
      generation = [capabilities, ["Common", "Uncommon", "Rare", "Ultra", "Giant", "Legendary", "Lucky"], [700, 250, 50, 20, 10, 2, 1]];
      break;
    }
    case "Lucky Rod": {
      generation = [capabilities, ["Common", "Uncommon", "Rare", "Ultra", "Giant", "Legendary", "Lucky"], [700, 50, 250, 20, 10, 2, 1]];
      break;
    }
    default: {
      generation = [capabilities, ["Common", "Uncommon", "Rare", "Ultra", "Giant", "Legendary", "Lucky"], [700, 250, 50, 10, 5, 2, 1]];
    }
  }
  return await generateFish(...generation);
}

const generateFish = async (capabilities, choices, weights) => {
  let draw = getWeightedChoice(choices, weights);

  if (draw === "Lucky") {
    let luckyRod = await Rod.findOne({name: "Lucky Rod"})
    return luckyRod
  }

  let f = await Fish.find({ rarity: { $in: draw } })

  let filteredChoices = f.filter(fish => {
    // Check if all capabilities match the fish's qualities
    return capabilities.every(capability => fish.qualities.includes(capability));
  });

  let random = Math.floor(Math.random() * filteredChoices.length);
  let choice = filteredChoices[random];
  return choice;
};

const sellFishByRarity = async (userId, targetRarity) => {
  let totalValue = 0;
  let newFish = [];
  let user = await User.findOne({ userId: userId });

  // Use map to asynchronously process each fish
  const updatedFish = await Promise.all(user.inventory.fish.map(async (f) => {
    let fish = await Fish.findById(f.valueOf());
    if (!fish.locked && targetRarity.toLowerCase() === "all" || fish.rarity.toLowerCase() === targetRarity.toLowerCase()) {
      totalValue += fish.value;
      return null; // Filter out the fish with the target rarity
    }
    return f; // Keep the fish with other rarities
  }));

  // Remove null values from the updatedFish array
  newFish = updatedFish.filter(f => f !== null);

  const newMoney = user.inventory.money + totalValue; // Calculate updated money

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId: user.userId },
      { $set: { 'inventory.fish': newFish, 'inventory.money': newMoney } },
      { new: true }
    );

    if (!updatedUser) {
      return 0; // Return 0 if the user is not found
    }

    return totalValue; // Return the total value of sold fish
  } catch (err) {
    return 0; // Return 0 in case of an error
  }
};

const getEquippedRod = async (userId) => {
  const user = await User.findOne({ userId: userId });
  const rodId = user.inventory.equippedRod.valueOf();
  const rod = await Rod.findById(rodId);
  return rod;
}


module.exports = {
  log,
  time,
  isSnowflake,
  generateXP,
  generateCash,
  generateFish,
  fish,
  sellFishByRarity,
  getEquippedRod,
};
