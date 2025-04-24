const { User } = require('./User');
const { Quest } = require('./Quest');

class QuestTracker {
    constructor(analyticsObject, interaction) {
        this.analyticsObject = analyticsObject;
        this.interaction = interaction;
        this.questData = {};
        this.originalCommand = interaction.commandName || null;
        this.completedQuests = [];
        this.startedQuests = [];
        
        if (interaction.message && interaction.message.interaction) {
            this.originalCommand = interaction.message.interaction.commandName || null;
        }
    }
    
    addQuestData(questData, merge = true) {
        if (!questData || typeof questData !== 'object') {
            throw new Error('Invalid quest data provided.');
        }
        
        const normalizedData = this.normalizeQuestDataKeys(questData);
        
        if (merge && Object.keys(this.questData).length > 0) {
            this.questData = this.deepMergeQuestData(this.questData, normalizedData);
        } else {
            this.questData = normalizedData;
        }
        
        return this;
    }
    
    normalizeQuestDataKeys(data, depth = 0) {
        if (depth > 10) {
            return data;
        }
        
        if (!data || typeof data !== 'object') {
            return data;
        }
        
        if (Array.isArray(data)) {
            return data.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return this.normalizeQuestDataKeys(item, depth + 1);
                }
                return item;
            });
        }
        
        const normalized = {};
        for (const key in data) {
            if (!data.hasOwnProperty(key)) continue;
            
            const lowerKey = key.toLowerCase();
            const value = data[key];
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                normalized[lowerKey] = this.normalizeQuestDataKeys(value, depth + 1);
            } else if (Array.isArray(value)) {
                normalized[lowerKey] = value;
            } else {
                normalized[lowerKey] = value;
            }
        }
        
        return normalized;
    }
    
    deepMergeQuestData(target, source) {
        if (!target || !source) return target || source;
        
        const result = { ...target };
        
        for (const key in source) {
            if (!source.hasOwnProperty(key)) continue;
            
            if (source[key] === null || source[key] === undefined) {
                continue;
            }
            
            if (key in result && 
                typeof result[key] === 'object' && result[key] !== null && !Array.isArray(result[key]) &&
                typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = this.deepMergeQuestData(result[key], source[key]);
            } 
            else if (Array.isArray(result[key]) && Array.isArray(source[key])) {
                result[key] = [...result[key], ...source[key]];
            } 
            else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    async processQuests(userId) {
        const user = new User(await User.get(userId));
        const quests = await user.getQuests();
        let questString = '';
        let totalQuestXp = 0;
        let totalQuestCash = 0;
        const questRewards = [];
        const completedQuestIds = new Set();
        let levelUp = false;
        
        for (const quest of quests) {
            if (quest.status === 'in_progress' && quest.progressType && quest.progressType.special && quest.progressType.special.length > 0) {
                let shouldIncrement = false;
                let matchingFlags = [];
                
                const commandRequirements = quest.progressType.special.filter(req => req.startsWith('/'));
                const flagRequirements = quest.progressType.special.filter(req => !req.startsWith('/'));
                
                if (flagRequirements.length > 0) {
                    for (const flag of flagRequirements) {
                        const flagLower = flag.toLowerCase();
                        const questDataKeys = Object.keys(this.questData).map(k => k.toLowerCase());
                        
                        if (this.questData[flagLower] === true) {
                            matchingFlags.push(flag);
                        }
                    }
                    
                    if (matchingFlags.length > 0) {
                        shouldIncrement = true;
                    }
                } else if (commandRequirements.length > 0) {
                    const currentCommand = "/" + this.interaction.commandName;
                    const originalCommand = this.originalCommand ? "/" + this.originalCommand : null;
                    
                    if (commandRequirements.some(cmd => cmd === currentCommand || cmd === originalCommand)) {
                        shouldIncrement = true;
                    }
                }
                
                if (shouldIncrement) {
                    if (quest.progress < quest.progressMax) {
                        const incrementAmount = this.questData.quantity || 1;
                        quest.progress += incrementAmount;
                        
                        if (quest.progress > quest.progressMax) {
                            quest.progress = quest.progressMax;
                        }

                        if (quest.progress >= quest.progressMax) {
                            if (!completedQuestIds.has(quest._id.toString())) {
                                completedQuestIds.add(quest._id.toString());
                                this.completedQuests.push(quest);
                            }
                        }

                        await quest.save();
                    } else {
                        if (!completedQuestIds.has(quest._id.toString())) {
                            completedQuestIds.add(quest._id.toString());
                            this.completedQuests.push(quest);
                        }
                    }
                }
            }
        }
        
        if (Object.keys(this.questData).length > 0) {
            const { fish = [], rod = null } = this.questData;
            
            if (fish && fish.length > 0) {
                for (const f of fish) {
                    const matchingQuests = await user.findQuests(
                        f.name ? f.name.toLowerCase() : 'any',
                        rod && rod.name ? rod.name.toLowerCase() : 'any',
                        Array.isArray(f.qualities) ? f.qualities.map(q => q ? q.toLowerCase() : 'any') : ['any']
                    );
                    
                    for (const q of matchingQuests) {
                        const quest = new Quest(q);
                        const questProgress = {
                            fish: false,
                            rarity: false,
                            rod: false,
                            qualities: false,
                            size: false,
                            weight: false,
                            special: false,
                        };
        
                        const progressType = await quest.getProgressType();
        
                        if (progressType.fish.includes('any') || (f.name && progressType.fish.includes(f.name.toLowerCase()))) 
                            questProgress.fish = true;
                        if (progressType.rarity.includes('any') || (f.rarity && progressType.rarity.includes(f.rarity.toLowerCase())))
                            questProgress.rarity = true;
                        if (progressType.rod === 'any' || (rod && rod.name && progressType.rod === rod.name.toLowerCase()))
                            questProgress.rod = true;
                        if (progressType.qualities.includes('any') || 
                            (Array.isArray(f.qualities) && progressType.qualities.some(q => 
                                f.qualities.map(quality => quality ? quality.toLowerCase() : '').includes(q))))
                            questProgress.qualities = true;
                        if (progressType.size === 'any' || (f.size && parseFloat(progressType.size).toFixed(3) <= f.size.toFixed(3)))
                            questProgress.size = true;
                        if (progressType.weight === 'any' || (f.weight && parseFloat(progressType.weight).toFixed(3) <= f.weight.toFixed(3)))
                            questProgress.weight = true;
                        if (progressType.special.length <= 0 || progressType.special.includes('any'))
                            questProgress.special = true;
        
                        const currentProgress = await quest.getProgress();
                        await quest.setProgress(currentProgress + (f.count || 1));
        
                        if (await quest.getProgress() >= await quest.getMaxProgress()) {
                            const questId = q._id.toString();
                            if (!completedQuestIds.has(questId)) {
                                completedQuestIds.add(questId);
                                this.completedQuests.push(quest);
                            }
                        }
                    }
                }
            }
        }
        
        if (this.completedQuests.length > 0) {
            for await (const q of this.completedQuests) {
                const quest = q instanceof Quest ? q : new Quest(q);
                questString += `**${await quest.getTitle()}** completed\n`;
                totalQuestXp += await quest.getXP();
                totalQuestCash += await quest.getCash();
                questRewards.push(...await quest.getRewards());

                await user.addXP(await quest.getXP());
                levelUp = await user.updateLevel() || levelUp;
                await user.addMoney(await quest.getCash());
                
                await quest.grantRewards();
                
                if (await quest.getContinuous()) {
                    const nextQuestDoc = await quest.getNextQuest();
                    if (nextQuestDoc) {
                        const nextQuestInstance = new Quest(nextQuestDoc);
                        const startedQuest = await user.startQuest(nextQuestInstance);
                        if (startedQuest) {
                            this.startedQuests.push(startedQuest);
                        }
                    }
                }
                
                await quest.end();
            }
        }
        
        return {
            completedQuests: this.completedQuests,
            startedQuests: this.startedQuests,
            questString: questString,
            totalQuestXp: totalQuestXp,
            totalQuestCash: totalQuestCash,
            questRewards: questRewards,
            levelUp: levelUp
        };
    }
    
    getCompletedQuests() {
        return this.completedQuests;
    }
    
    getStartedQuests() {
        return this.startedQuests;
    }
}

module.exports = QuestTracker;
