import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { ICommand, Command } from '@/app/models/CommandModel';
import { User } from '@/app/models/UserModel';
import { FishData } from '@/app/models/FishModel';
import { unstable_noStore as noStore } from 'next/cache';
import { Interaction } from '../models/InteractionModel';

async function sortCommandsByRecency(commands: ICommand[]): Promise<ICommand[]> {
	noStore();
	return commands.sort((a: ICommand, b: ICommand) => {
		return new Date(b.time).getTime() - new Date(a.time).getTime();
	});
}

export async function getUserTrend() {
	noStore();
	await dbConnect();

	// Get user data for this month
	const thisMonthStart = new Date();
	thisMonthStart.setDate(1);
	thisMonthStart.setHours(0, 0, 0, 0);

	const thisMonthEnd = new Date();
	thisMonthEnd.setMonth(thisMonthEnd.getMonth() + 1);
	thisMonthEnd.setDate(0);
	thisMonthEnd.setHours(23, 59, 59, 999);

	const thisMonthUsers = await User.find({
		createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
	});

	// Get user data for last month
	const lastMonthStart = new Date();
	lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
	lastMonthStart.setDate(1);
	lastMonthStart.setHours(0, 0, 0, 0);

	const lastMonthEnd = new Date();
	lastMonthEnd.setDate(0);
	lastMonthEnd.setHours(23, 59, 59, 999);

	const lastMonthUsers = await User.find({
		createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
	});

	// Calculate the percent change
	const thisMonthCount = thisMonthUsers.length;
	const lastMonthCount = lastMonthUsers.length;
	const percentChange = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;

	// Calculate the average growth rate per day
	const daysInLastMonth = lastMonthEnd.getDate();
	const averageGrowthRate = (thisMonthCount - lastMonthCount) / daysInLastMonth;

	// Calculate the projected growth for the entire month
	const projectedGrowth = averageGrowthRate * daysInLastMonth;

	// Calculate the projected percentage change
	const projectedPercentChange = (projectedGrowth / lastMonthCount) * 100;

	return Math.round(projectedPercentChange);
}

export async function getFishTrend() {
	noStore();
	await dbConnect();

	// Get fish data for this month
	const thisMonthStart = new Date();
	thisMonthStart.setDate(1);
	thisMonthStart.setHours(0, 0, 0, 0);

	const thisMonthEnd = new Date();
	thisMonthEnd.setMonth(thisMonthEnd.getMonth() + 1);
	thisMonthEnd.setDate(0);
	thisMonthEnd.setHours(23, 59, 59, 999);

	const thisMonthFishData = await FishData.find({
		obtained: { $gte: thisMonthStart, $lte: thisMonthEnd },
	});

	// Get fish data for last month
	const lastMonthStart = new Date();
	lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
	lastMonthStart.setDate(1);
	lastMonthStart.setHours(0, 0, 0, 0);

	const lastMonthEnd = new Date();
	lastMonthEnd.setDate(0);
	lastMonthEnd.setHours(23, 59, 59, 999);

	const lastMonthFishData = await FishData.find({
		obtained: { $gte: lastMonthStart, $lte: lastMonthEnd },
	});

	// Calculate the percent change
	const thisMonthCount = thisMonthFishData.reduce((a, b) => a + b.count, 0);
	const lastMonthCount = lastMonthFishData.reduce((a, b) => a + b.count, 0);
	const percentChange = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;

	// Calculate the average growth rate per day
	const daysInLastMonth = lastMonthEnd.getDate();
	const averageGrowthRate = (thisMonthCount - lastMonthCount) / daysInLastMonth;

	// Calculate the projected growth for the entire month
	const projectedGrowth = averageGrowthRate * daysInLastMonth;

	// Calculate the projected percentage change
	const projectedPercentChange = (projectedGrowth / lastMonthCount) * 100;

	return Math.round(projectedPercentChange);
}

export async function getCommandTrend() {
	noStore();
	await dbConnect();

	// Get commands for this month
	const thisMonthStart = new Date();
	thisMonthStart.setDate(1);
	thisMonthStart.setHours(0, 0, 0, 0);

	const thisMonthEnd = new Date();
	thisMonthEnd.setMonth(thisMonthEnd.getMonth() + 1);
	thisMonthEnd.setDate(0);
	thisMonthEnd.setHours(23, 59, 59, 999);

	const thisMonthCommands = await Command.find({
		time: { $gte: thisMonthStart, $lte: thisMonthEnd },
	});

	// Get commands for last month
	const lastMonthStart = new Date();
	lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
	lastMonthStart.setDate(1);
	lastMonthStart.setHours(0, 0, 0, 0);

	const lastMonthEnd = new Date();
	lastMonthEnd.setDate(0);
	lastMonthEnd.setHours(23, 59, 59, 999);

	const lastMonthCommands = await Command.find({
		time: { $gte: lastMonthStart, $lte: lastMonthEnd },
	});

	// Calculate the percent change
	const thisMonthCount = thisMonthCommands.length;
	const lastMonthCount = lastMonthCommands.length;
	const percentChange = ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;

	// Calculate the average growth rate per day
	const daysInLastMonth = lastMonthEnd.getDate();
	const averageGrowthRate = (thisMonthCount - lastMonthCount) / daysInLastMonth;

	// Calculate the projected growth for the entire month
	const projectedGrowth = averageGrowthRate * daysInLastMonth;

	// Calculate the projected percentage change
	const projectedPercentChange = (projectedGrowth / lastMonthCount) * 100;

	return Math.round(projectedPercentChange);
}

export async function checkIfUserIsAdmin(userId: string) {
	noStore();
	await dbConnect();
	const user = await User.findOne({ userId });
	return user?.isAdmin;
}

export async function getUserById(userId: string) {
	noStore();
	await dbConnect();
	return await User.findOne({ userId });
}

export async function fetchLatestCommands() {
    noStore();
	
    return new Promise((resolve, reject) => {
        let commands: ICommand[] = [];

        // Initial fetch of commands
        const findCommands = async () => {
            const result = await Command.find({});
            commands = result.map((doc: any) => JSON.parse(JSON.stringify(doc)));
            resolve((await sortCommandsByRecency(commands)).slice(0, 10)); // Return the latest 10 commands
        };

        findCommands().catch(reject);
    });
}

export async function fetchCommands() {
	noStore();
	await dbConnect();

	/* find all the data in our database */
	const result = await Command.find({});

	/* Ensures all objectIds and nested objectIds are serialized as JSON data */
	let commands = result.map((doc: any) => {
		const command = JSON.parse(JSON.stringify(doc));
		return command;
	});

	// Sort commands by most recent time field
	commands = await sortCommandsByRecency(commands);

	return commands;
}

export async function fetchCommandsLength() {
	noStore();
	await dbConnect();
	return await Command.countDocuments({});
}

export async function fetchUserCount() {
	noStore();
	await dbConnect();
	return await User.countDocuments({});
}

export async function fetchTotalFishCaught() {
	noStore();
	await dbConnect();
	let fishData = await FishData.find({});
	fishData = fishData.map((doc: any) => {
		const fish = JSON.parse(JSON.stringify(doc));
		return fish.count;
	});
	return fishData.reduce((a: number, b: number) => a + b, 0);
}

export async function fetchFilteredCommands(query: string, currentPage: number) {
	noStore();
	await dbConnect();
	const limit = 10;
	const skip = (currentPage - 1) * limit;
	const regex = new RegExp(query, 'i');
	const commands = await Command.find({
		$or: [{ user: regex }, { command: regex }],
	})
		.sort({ time: -1 })
		.skip(skip)
		.limit(limit);
	return commands;
}

export async function fetchCommandsPages(query: string) {
	noStore();
	await dbConnect();
	const limit = 10;
	const count = await Command.countDocuments({
		$or: [{ user: new RegExp(query, 'i') }, { command: new RegExp(query, 'i') }],
	});
	return Math.ceil(count / limit);
}

export async function fetchFilteredUsers(query: string, currentPage: number) {
	noStore();
	await dbConnect();
	const limit = 10;
	const skip = (currentPage - 1) * limit;
	const regex = new RegExp(query, 'i');
	const users = await User.find({
		userId: regex,
	})
		.sort({ xp: -1 })
		.skip(skip)
		.limit(limit);
	return users;
}

export async function fetchUsersPages(query: string) {
	noStore();
	await dbConnect();
	const limit = 10;
	const count = await User.countDocuments({
		userId: new RegExp(query, 'i'),
	});
	return Math.ceil(count / limit);
}

export async function fetchCommandById(id: string) {
	noStore();
	await dbConnect();
	const command = await Command.findById(id);
	return command;
}

export async function fetchInteractionById(id: string) {
	noStore();
	await dbConnect();
	const interaction = await Interaction.findById(id);
	return interaction;
}