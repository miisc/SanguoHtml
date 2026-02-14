/**
 * 建筑系统数据结构和配置
 */

/**
 * 建筑类型定义
 */
export const BUILDING_TYPES = {
    farm: {
        id: 'farm',
        name: '农田',
        description: '增加粮食产出',
        maxLevel: 5,
        cost: {
            gold: 200,
            wood: 100,
            food: 0
        },
        buildTime: 3, // 天数
        effects: {
            foodPerTurn: 20 // 每级增加
        },
        icon: '🌾'
    },
    market: {
        id: 'market',
        name: '市场',
        description: '增加金钱收入',
        maxLevel: 5,
        cost: {
            gold: 300,
            wood: 150,
            food: 50
        },
        buildTime: 4,
        effects: {
            goldPerTurn: 15
        },
        icon: '🏪'
    },
    barracks: {
        id: 'barracks',
        name: '兵营',
        description: '训练士兵，增加守军',
        maxLevel: 5,
        cost: {
            gold: 400,
            wood: 200,
            food: 100
        },
        buildTime: 5,
        effects: {
            garrison: 100,
            recruitSpeed: 10
        },
        icon: '⚔️'
    },
    wall: {
        id: 'wall',
        name: '城墙',
        description: '提升城池防御',
        maxLevel: 10,
        cost: {
            gold: 500,
            wood: 300,
            food: 0
        },
        buildTime: 7,
        effects: {
            defense: 5
        },
        icon: '🏰'
    },
    workshop: {
        id: 'workshop',
        name: '工坊',
        description: '增加木材产出，可制造装备',
        maxLevel: 5,
        cost: {
            gold: 350,
            wood: 100,
            food: 50
        },
        buildTime: 4,
        effects: {
            woodPerTurn: 15,
            craftingSpeed: 10
        },
        icon: '🔨'
    },
    academy: {
        id: 'academy',
        name: '学院',
        description: '提升科技研究速度',
        maxLevel: 3,
        cost: {
            gold: 600,
            wood: 200,
            food: 100
        },
        buildTime: 10,
        effects: {
            researchSpeed: 20
        },
        icon: '📚'
    }
};

/**
 * 创建建筑实例
 */
export function createBuilding(buildingType, level = 1) {
    const config = BUILDING_TYPES[buildingType];
    if (!config) return null;
    
    return {
        type: buildingType,
        level: level,
        name: config.name,
        underConstruction: false,
        constructionProgress: 0,
        constructionStartTime: null
    };
}

/**
 * 计算建筑升级成本
 */
export function getBuildingUpgradeCost(buildingType, currentLevel) {
    const config = BUILDING_TYPES[buildingType];
    if (!config) return null;
    
    const multiplier = 1 + (currentLevel * 0.5); // 每级增加50%成本
    
    return {
        gold: Math.floor(config.cost.gold * multiplier),
        wood: Math.floor(config.cost.wood * multiplier),
        food: Math.floor(config.cost.food * multiplier),
        time: Math.floor(config.buildTime * multiplier)
    };
}

/**
 * 计算建筑效果
 */
export function getBuildingEffects(buildingType, level) {
    const config = BUILDING_TYPES[buildingType];
    if (!config) return {};
    
    const effects = {};
    for (const [key, value] of Object.entries(config.effects)) {
        effects[key] = value * level;
    }
    
    return effects;
}

/**
 * 检查是否可以建造/升级建筑
 */
export function canBuildOrUpgrade(city, buildingType, resources) {
    const config = BUILDING_TYPES[buildingType];
    if (!config) return { canBuild: false, reason: '未知建筑类型' };
    
    // 检查是否已存在
    const existingBuilding = city.buildings.find(b => b.type === buildingType);
    
    if (existingBuilding) {
        // 升级
        if (existingBuilding.level >= config.maxLevel) {
            return { canBuild: false, reason: '已达到最高等级' };
        }
        if (existingBuilding.underConstruction) {
            return { canBuild: false, reason: '建筑建造中' };
        }
    }
    
    // 检查资源
    const currentLevel = existingBuilding ? existingBuilding.level : 0;
    const cost = getBuildingUpgradeCost(buildingType, currentLevel);
    
    if (resources.gold < cost.gold) {
        return { canBuild: false, reason: `金钱不足，需要${cost.gold}` };
    }
    if (resources.wood < cost.wood) {
        return { canBuild: false, reason: `木材不足，需要${cost.wood}` };
    }
    if (resources.food < cost.food) {
        return { canBuild: false, reason: `粮食不足，需要${cost.food}` };
    }
    
    return { canBuild: true, cost };
}

/**
 * 计算城池所有建筑的总效果
 */
export function calculateCityBuildingEffects(city) {
    const totalEffects = {
        goldPerTurn: 0,
        foodPerTurn: 0,
        woodPerTurn: 0,
        garrison: 0,
        defense: 0,
        recruitSpeed: 0,
        craftingSpeed: 0,
        researchSpeed: 0
    };
    
    for (const building of city.buildings) {
        if (building.underConstruction) continue;
        
        const effects = getBuildingEffects(building.type, building.level);
        for (const [key, value] of Object.entries(effects)) {
            if (totalEffects.hasOwnProperty(key)) {
                totalEffects[key] += value;
            }
        }
    }
    
    return totalEffects;
}
