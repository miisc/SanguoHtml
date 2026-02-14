/**
 * 游戏状态管理器
 * 负责管理全局游戏状态
 */

import { 
    createGameState, 
    createCity, 
    createGeneral, 
    createFaction,
    INITIAL_CITIES,
    INITIAL_GENERALS,
    FACTION_CONFIG,
    SEASONS
} from './structures.js';

import {
    BUILDING_TYPES,
    createBuilding,
    getBuildingUpgradeCost,
    canBuildOrUpgrade,
    calculateCityBuildingEffects
} from './buildings.js';

class GameStateManager {
    constructor() {
        this.state = null;
        this.listeners = [];
        this.lastUpdateTime = Date.now();
        this.gameSpeed = 1; // 1=正常, 2=2倍速, 4=4倍速, 0=暂停
        this.daysPassed = 0;
    }

    /**
     * 初始化游戏
     */
    initialize(playerFactionId = 'shu') {
        console.log('初始化游戏状态...');
        
        this.state = createGameState();
        this.state.playerFaction = playerFactionId;

        // 初始化势力
        for (const [factionId, config] of Object.entries(FACTION_CONFIG)) {
            const faction = createFaction(factionId, config.name, config.color, config.ruler);
            faction.isPlayer = (factionId === playerFactionId);
            this.state.factions[factionId] = faction;
        }

        // 初始化武将
        for (const generalData of INITIAL_GENERALS) {
            const general = createGeneral(generalData.id, generalData.name, generalData.faction);
            general.courtesyName = generalData.courtesyName;
            Object.assign(general.attributes, generalData.attributes);
            
            this.state.generals[general.id] = general;
            
            // 添加到对应势力
            if (this.state.factions[general.faction]) {
                if (!this.state.factions[general.faction].generals.includes(general.id)) {
                    this.state.factions[general.faction].generals.push(general.id);
                }
            }
        }

        // 初始化城池
        for (const cityData of INITIAL_CITIES) {
            const city = createCity(cityData.id, cityData.name, cityData.x, cityData.y, cityData.owner);
            this.state.cities[city.id] = city;
            
            // 添加到对应势力
            if (city.owner && this.state.factions[city.owner]) {
                this.state.factions[city.owner].cities.push(city.id);
            }
        }

        // 设置武将位置（君主在首都）
        if (this.state.factions.shu.cities.length > 0) {
            this.state.generals.liubei.location = this.state.factions.shu.cities[0];
            this.state.generals.liubei.position = "ruler";
        }
        if (this.state.factions.wei.cities.length > 0) {
            this.state.generals.caocao.location = this.state.factions.wei.cities[0];
            this.state.generals.caocao.position = "ruler";
        }
        if (this.state.factions.wu.cities.length > 0) {
            this.state.generals.sunquan.location = this.state.factions.wu.cities[0];
            this.state.generals.sunquan.position = "ruler";
        }

        console.log('游戏状态初始化完成', this.state);
        this.lastUpdateTime = Date.now();
        this.notifyListeners('initialized');
    }

    /**
     * 获取当前游戏状态
     */
    getState() {
        return this.state;
    }

    /**
     * 获取玩家势力
     */
    getPlayerFaction() {
        return this.state.factions[this.state.playerFaction];
    }

    /**
     * 获取城池
     */
    getCity(cityId) {
        return this.state.cities[cityId];
    }

    /**
     * 获取武将
     */
    getGeneral(generalId) {
        return this.state.generals[generalId];
    }

    /**
     * 获取势力
     */
    getFaction(factionId) {
        return this.state.factions[factionId];
    }

    /**
     * 更新游戏时间（实时系统）
     * @param {number} deltaTime - 经过的实际时间（毫秒）
     */
    update(deltaTime) {
        if (this.gameSpeed === 0) return; // 暂停状态
        
        // 实际游戏时间流逝（1秒现实时间 = 1天游戏时间 * 速度倍数）
        const gameDays = (deltaTime / 1000) * this.gameSpeed;
        this.daysPassed += gameDays;
        
        // 每过一天更新一次
        if (this.daysPassed >= 1) {
            const daysToAdvance = Math.floor(this.daysPassed);
            this.daysPassed -= daysToAdvance;
            
            this.advanceDays(daysToAdvance);
        }
    }
    
    /**
     * 推进指定天数
     */
    advanceDays(days) {
        for (let i = 0; i < days; i++) {
            this.state.currentTurn++;
            
            // 每30天（约一个月）推进一个季节
            if (this.state.currentTurn % 30 === 0) {
                const seasonIndex = SEASONS.indexOf(this.state.currentSeason);
                const nextSeasonIndex = (seasonIndex + 1) % SEASONS.length;
                this.state.currentSeason = SEASONS[nextSeasonIndex];
                
                // 如果回到春季，年份+1
                if (nextSeasonIndex === 0) {
                    this.state.currentYear++;
                }
            }
            
            // 更新建筑建造进度
            this.updateConstructions();
            
            // 每天更新资源（按天计算）
            this.updateDailyResources();
        }
        
        this.notifyListeners('timeChanged');
    }
    
    /**
     * 设置游戏速度
     */
    setGameSpeed(speed) {
        this.gameSpeed = speed;
        console.log(`游戏速度: ${speed === 0 ? '暂停' : speed + 'x'}`);
        this.notifyListeners('speedChanged');
    }
    
    /**
     * 获取游戏速度
     */
    getGameSpeed() {
        return this.gameSpeed;
    }

    /**
     * 每天更新资源
     */
    updateDailyResources() {
        for (const factionId in this.state.factions) {
            const faction = this.state.factions[factionId];
            
            // 计算城池产出（每回合产出/30天）+ 建筑加成
            for (const cityId of faction.cities) {
                const city = this.state.cities[cityId];
                
                // 基础产出
                let goldIncome = city.production.goldPerTurn / 30;
                let foodIncome = city.production.foodPerTurn / 30;
                let woodIncome = city.production.woodPerTurn / 30;
                
                // 建筑加成
                const buildingEffects = calculateCityBuildingEffects(city);
                goldIncome += buildingEffects.goldPerTurn / 30;
                foodIncome += buildingEffects.foodPerTurn / 30;
                woodIncome += buildingEffects.woodPerTurn / 30;
                
                faction.resources.gold += goldIncome;
                faction.resources.food += foodIncome;
                faction.resources.wood += woodIncome;
            }

            // 扣除维护费用（每回合费用/30天）
            const maintenanceCost = faction.generals.length * 10 / 30;
            faction.resources.gold -= maintenanceCost;
        }
    }

    /**
     * 更新地图视图
     */
    updateMapView(zoom, centerX, centerY, offsetX, offsetY) {
        this.state.mapView.zoom = zoom;
        this.state.mapView.centerX = centerX;
        this.state.mapView.centerY = centerY;
        this.state.mapView.offsetX = offsetX;
        this.state.mapView.offsetY = offsetY;
    }

    /**
     * 添加监听器
     */
    addListener(callback) {
        this.listeners.push(callback);
    }
    
    /**
     * 更新建筑建造进度
     */
    updateConstructions() {
        for (const cityId in this.state.cities) {
            const city = this.state.cities[cityId];
            
            for (const building of city.buildings) {
                if (building.underConstruction) {
                    building.constructionProgress++;
                    
                    const config = BUILDING_TYPES[building.type];
                    const cost = getBuildingUpgradeCost(building.type, building.level - 1);
                    
                    if (building.constructionProgress >= cost.time) {
                        building.underConstruction = false;
                        building.constructionProgress = 0;
                        console.log(`${city.name} 的 ${building.name} 建造完成！`);
                        this.notifyListeners('buildingCompleted', { cityId, building });
                    }
                }
            }
        }
    }
    
    /**
     * 建造或升级建筑
     */
    buildOrUpgradeBuilding(cityId, buildingType) {
        const city = this.getCity(cityId);
        if (!city) return { success: false, message: '城池不存在' };
        
        // 检查城池所有权
        const playerFaction = this.getPlayerFaction();
        if (city.owner !== playerFaction.id) {
            return { success: false, message: '这不是你的城池' };
        }
        
        // 检查是否可以建造
        const check = canBuildOrUpgrade(city, buildingType, playerFaction.resources);
        if (!check.canBuild) {
            return { success: false, message: check.reason };
        }
        
        // 扣除资源
        playerFaction.resources.gold -= check.cost.gold;
        playerFaction.resources.wood -= check.cost.wood;
        playerFaction.resources.food -= check.cost.food;
        
        // 查找现有建筑
        let building = city.buildings.find(b => b.type === buildingType);
        
        if (building) {
            // 升级
            building.level++;
            building.underConstruction = true;
            building.constructionProgress = 0;
            building.constructionStartTime = this.state.currentTurn;
        } else {
            // 新建
            building = createBuilding(buildingType, 1);
            building.underConstruction = true;
            building.constructionStartTime = this.state.currentTurn;
            city.buildings.push(building);
        }
        
        console.log(`开始建造 ${city.name} 的 ${building.name} Lv.${building.level}`);
        this.notifyListeners('buildingStarted', { cityId, building });
        
        return { 
            success: true, 
            message: `开始${building.level > 1 ? '升级' : '建造'} ${building.name}`,
            building,
            buildTime: check.cost.time
        };
    }
    
    /**
     * 任命武将为太守
     */
    appointGovernor(cityId, generalId) {
        const city = this.getCity(cityId);
        const general = this.getGeneral(generalId);
        
        if (!city || !general) {
            return { success: false, message: '城池或武将不存在' };
        }
        
        // 检查所有权
        const playerFaction = this.getPlayerFaction();
        if (city.owner !== playerFaction.id) {
            return { success: false, message: '这不是你的城池' };
        }
        
        if (general.faction !== playerFaction.id) {
            return { success: false, message: '这不是你的武将' };
        }
        
        // 移除旧太守
        if (city.governor) {
            const oldGovernor = this.getGeneral(city.governor);
            if (oldGovernor) {
                oldGovernor.position = 'none';
                oldGovernor.location = null;
            }
        }
        
        // 任命新太守
        city.governor = generalId;
        general.position = 'governor';
        general.location = cityId;
        
        console.log(`任命 ${general.name} 为 ${city.name} 太守`);
        this.notifyListeners('governorAppointed', { cityId, generalId });
        
        return { success: true, message: `${general.name} 已被任命为 ${city.name} 太守` };
    }

    /**
     * 通知所有监听器
     */
    notifyListeners(event, data = null) {
        for (const listener of this.listeners) {
            listener(event, this.state, data);
        }
    }
}

// 导出单例
export const gameState = new GameStateManager();
