const { readdirSync } = require('fs');
const { Utils } = require('../class/Utils');

/**
 *
 * @param {ExtendedClient} client
 */
module.exports = (client) => {
	for (const dir of readdirSync('./src/events/')) {
		for (const file of readdirSync('./src/events/' + dir).filter((f) => f.endsWith('.js'))) {
			const module = require('../events/' + dir + '/' + file);

			if (!module) continue;

			if (!module.event || !module.run) {
				Utils.log('Unable to load the event ' + file + ' due to missing \'name\' or/and \'run\' properties.', 'warn');

				continue;
			}

			Utils.log('Loaded new event: ' + file, 'info');

			if (module.once) {
				client.once(module.event, (...args) => module.run(client, ...args));
			}
			else {
				client.on(module.event, (...args) => module.run(client, ...args));
			}
		}
	}
};