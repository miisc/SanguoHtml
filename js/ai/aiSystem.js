/**
 * AI系统 - 控制非玩家势力
 */

import { BUILDING_TYPES } from '../data/buildings.js';

export class AISystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.decisionInterval = 10; // 每10天做一次决策
        this.lastDecisionDay = 0;
    }
    
    /**
     * 更新AI（在每天调用）
     */
    update(currentDay) {
        // 每隔一段时间做一次决策
        if (currentDay - this.lastDecisionDay < this.decisionInterval) {
            return;
        }
        
        this.lastDecisionDay = currentDay;
        
        const state = this.gameState.getState();
        
        // 遍历所有AI势力
        for (const factionId in state.factions) {
            const faction = state.factions[factionId];
            
            if (faction.isPlayer) continue;
            
            this.makeDecision(faction);
        }
    }
    
    /**
     * AI决策
     */
    makeDecision(faction) {
        // 1. 城池发展决策
        this.manageCities(faction);
        
        // 2. 军事决策（简化版）
        this.manageMilitary(faction);
    }
    
    /**
     * 管理城池发展
     */
    manageCities(faction) {
        const state = this.gameState.getState();
        
        for (const cityId of faction.cities) {
            const city = state.cities[cityId];
            
            // 检查是否有建筑正在建造
            const hasConstruction = city.buildings.some(b => b.underConstruction);
            if (hasConstruction) continue;
            
            // 决定建造什么
            const buildingToBuild = this.decideBuildingToBuild(city, faction);
            
            if (buildingToBuild) {
                const result = this.gameState.buildOrUpgradeBuilding(cityId, buildingToBuild);
                if (result.success) {
                    console.log(`AI ${faction.name}: ${city.name} 开始建造 ${result.building.name}`);
                }
            }
        }
    }
    
    /**
     * 决定建造哪个建筑
     */
    decideBuildingToBuild(city, faction) {
        // 优先级：农田 > 市场 > 兵营 > 城墙 > 工坊 > 学院
        const priorities = ['farm', 'market', 'barracks', 'wall', 'workshop', 'academy'];
        
        for (const buildingType of priorities) {
            const existing = city.buildings.find(b => b.type === buildingType);
            const maxLevel = BUILDING_TYPES[buildingType].maxLevel;
            
            // 如果还没建或者可以升级
            if (!existing || existing.level < maxLevel) {
                // 简单检查资源
                const currentLevel = existing ? existing.level : 0;
                const cost = this.estimateBuildingCost(buildingType, currentLevel);
                
                if (faction.resources.gold >= cost.gold &&
                    faction.resources.wood >= cost.wood &&
                    faction.resources.food >= cost.food) {
                    return buildingType;
                }
            }
        }
        
        return null;
    }
    
    /**
     * 估算建筑成本
     */
    estimateBuildingCost(buildingType, currentLevel) {
        const config = BUILDING_TYPES[buildingType];
        const multiplier = 1 + (currentLevel * 0.5);
        
        return {
            gold: Math.floor(config.cost.gold * multiplier),
            wood: Math.floor(config.cost.wood * multiplier),
            food: Math.floor(config.cost.food * multiplier)
        };
    }
    
    /**
     * 管理军事
     */
    manageMilitary(faction) {
        const state = this.gameState.getState();
        
        // 检查是否有空闲军队
        const armies = Object.values(state.armies || {}).filter(a => a.faction === faction.id);
        const idleArmies = armies.filter(a => a.mission === 'idle');
        
        // 如果有足够资源且军队较少，考虑招募
        if (armies.length < faction.cities.length && faction.resources.gold > 1000) {
            this.considerRecruiting(faction);
        }
        
        // 如果有空闲军队，考虑进攻
        if (idleArmies.length > 0 && Math.random() < 0.3) {
            this.considerAttacking(faction, idleArmies[0]);
        }
    }
    
    /**
     * 考虑招募军队
     */
    considerRecruiting(faction) {
        // 简化版：暂不实现自动招募
        // 可以在后续版本中添加
    }
    
    /**
     * 考虑发动进攻
     */
    considerAttacking(faction, army) {
        const state = this.gameState.getState();
        
        // 查找邻近的敌对城池
        const targetCity = this.findNearbyEnemyCity(faction);
        
        if (targetCity && army) {
            // 简化版：暂不实现AI进攻
            // 可以在后续版本中添加
            console.log(`AI ${faction.name} 考虑进攻 ${targetCity.name}（暂未实现）`);
        }
    }
    
    /**
     * 查找邻近的敌对城池
     */
    findNearbyEnemyCity(faction) {
        const state = this.gameState.getState();
        
        // 简单查找第一个非己方城池
        for (const cityId in state.cities) {
            const city = state.cities[cityId];
            if (city.owner && city.owner !== faction.id) {
                return city;
            }
        }
        
        return null;
    }
}
