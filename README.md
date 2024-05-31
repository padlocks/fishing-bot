# FishingRPG

A Discord bot built with discord.js version 14 and written in JavaScript. This handler can load up to 4 different types of commands: Prefix, Slash, User context, and Message context. It can also handle components, including Buttons, Modals, Select menus (any type), and autocomplete.

Did you like my project? Click on the star button (⭐️) right above your screen, thank you!

## Features
- Comprehensive fishing
- Ponds, limit the amount of fish in a channel.
- Economy, shop, money
- Gacha system
- Code redemption
- Unique biomes with unique fish
- Inventory system
- Leaderboard system
- Pet / fish care / aquarium system
- Booster / buff system
- Dailies
- Encyclopedia-esque command
- Profiles
- Quests
- Statistics
- Crafting

## Requirements
### Packages:
- **chalk** v2.4.2
- **discord.js** v^14.13.0
- **dotenv** v^latest
- **mongoose** v^latest

> [!WARNING]
> Installing any version from the package `chalk` that is over **v2.4.2** will throw an error that you must enable ES6 modules, while this handler uses CommonJS modules.

### Platforms:
- **Node.js** v16.9.0 or newer

## Setup
1. Install Visual Studio Code.
2. Download this project as a **.zip** file: [Click here](https://github.com/TFAGaming/DiscordJS-V14-Bot-Template/archive/refs/heads/main.zip)
3. Extract the .zip file into a normal folder.
4. Open VSCode, click on **Open Folder**, and select the new created folder.
5. Go to `src/` and rename `example.config.js` to `config.js` and fill all the required values. You can use ENV instead of `config.js` to keep your bot token and ID, and your MongoDB URI in a secured place by renaming the file `.env.example` to `.env` and filling all required values.

> [!CAUTION]
> Sharing your Discord bot's token with anyone is a very risky move since you'll allow them to use your bot. This is also a dangerous move for the MongoDB database; we don't recommend using any public URIs or sharing your database connection URL.

6. Initialize a new npm package:

```
npm init -y
```

7. Install all [required packages](#packages):

```
npm install chalk@2.4.2 discord.js@latest dotenv mongoose
```

8. To start your bot, run `node .` or `npm run start`.
9. Enjoy. :D

## FAQs
### 1. I'm getting this error: "Unable to load application commands to Discord API"
- The bot token and/or bot ID are invalid.
- The bot token and bot ID are not from the same Discord bot.
- Too many application commands.
    - 100 Global Chat input (AKA: Slash) commands.
    - 5 Global User context commands.
    - 5 Global Message context commands.
- Invalid application command structure.
    - Missing description, type, or any required properties for a command.
    - The command cannot be modified.
- The Discord API has an issue ([Verify Discord status](https://discordstatus.com/)).

[Learn more...](https://discord.com/developers/docs/interactions/application-commands#registering-a-command)

### 2. I'm unable to view any application commands, no errors in console?
This is a common problem for developers, to fix this issue, restart the Discord app or go in a different text channel.

### 3. Is MongoDB required?
Yes, this bot is highly reliant on data. If you need to install the database, visit [MongoDB website](https://www.mongodb.com/).

## License
[**GPL-3.0**](./LICENSE), General Public License v3