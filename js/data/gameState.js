/**
 * 游戏状态管理器
 * 负责管理全局游戏状态
 */

import { 
    createGameState, 
    createCity, 
    createGeneral, 
    createFaction,
    createRoad,
    INITIAL_CITIES,
    INITIAL_GENERALS,
    INITIAL_ROADS,
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

import {
    createArmy,
    calculatePath,
    updateArmyPosition,
    checkArrival,
    simulateBattle,
    calculateArmyPower,
    findRoadPath,
    convertCityPathToCoordinates
} from './military.js';

import { AISystem } from '../ai/aiSystem.js';
import { CourtMeetingSystem } from './courtMeeting.js';

class GameStateManager {
    constructor() {
        this.state = null;
        this.listeners = [];
        this.lastUpdateTime = Date.now();
        this.gameSpeed = 1; // 1=正常, 2=2倍速, 4=4倍速, 0=暂停
        this.daysPassed = 0;
        this.aiSystem = null;
        this.courtMeetingSystem = null;
        this.armyIdCounter = 1;
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
        
        // 初始化道路
        this.state.roads = {};
        for (const roadData of INITIAL_ROADS) {
            const road = createRoad(roadData.id, roadData.from, roadData.to, roadData.level);
            this.state.roads[road.id] = road;
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
        
        // 初始化AI系统
        this.aiSystem = new AISystem(this);
        
        // 初始化朝会系统
        this.courtMeetingSystem = new CourtMeetingSystem(this);
        
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
        
        // 更新军队移动
        this.updateArmies(deltaTime);
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
            
            // 更新AI
            if (this.aiSystem) {
                this.aiSystem.update(this.state.currentTurn);
            }
            
            // 更新朝会系统
            if (this.courtMeetingSystem) {
                this.courtMeetingSystem.update(1);
            }
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
     * 招募军队
     */
    recruitArmy(cityId, generalId, troops) {
        const city = this.getCity(cityId);
        const general = this.getGeneral(generalId);
        const playerFaction = this.getPlayerFaction();
        
        if (!city || city.owner !== playerFaction.id) {
            return { success: false, message: '城池不存在或不属于你' };
        }
        
        if (!general || general.faction !== playerFaction.id) {
            return { success: false, message: '武将不存在或不属于你' };
        }
        
        // 检查武将是否已经在带队
        const existingArmy = Object.values(this.state.armies || {}).find(a => a.general === generalId);
        if (existingArmy) {
            return { success: false, message: '该武将已经在带领一支军队' };
        }
        
        // 计算成本
        const cost = {
            gold: troops * 50,
            food: troops * 20
        };
        
        if (playerFaction.resources.gold < cost.gold || playerFaction.resources.food < cost.food) {
            return { success: false, message: '资源不足' };
        }
        
        // 扣除资源
        playerFaction.resources.gold -= cost.gold;
        playerFaction.resources.food -= cost.food;
        
        // 创建军队
        const armyId = 'army' + this.armyIdCounter++;
        const army = createArmy(armyId, playerFaction.id, cityId, troops, generalId);
        
        // 设置军队位置为城池位置
        army.x = city.position.x;
        army.y = city.position.y;
        
        if (!this.state.armies) {
            this.state.armies = {};
        }
        this.state.armies[armyId] = army;
        
        console.log(`招募军队成功: ${general.name} 带领 ${troops} 士兵`);
        this.notifyListeners('armyRecruited', { armyId, army });
        
        return { success: true, message: `成功招募 ${troops} 士兵`, army };
    }
    
    /**
     * 更新所有军队
     */
    updateArmies(deltaTime) {
        if (!this.state.armies) return;
        
        for (const armyId in this.state.armies) {
            const army = this.state.armies[armyId];
            
            if (army.mission === 'moving' && army.destination) {
                // 更新军队位置
                updateArmyPosition(army, deltaTime);
                
                // 检查是否到达目的地
                const arrived = checkArrival(army);
                
                if (arrived) {
                    console.log(`军队 ${armyId} 到达目的地`);
                    army.mission = 'idle';
                    
                    // 更新军队的起始城市为目标城市
                    if (army.destination.cityId) {
                        army.origin = army.destination.cityId;
                        console.log(`军队现在驻扎在 ${this.state.cities[army.origin].name}`);
                    }
                    
                    // 检查是否有敌军或敌对城池
                    this.checkBattle(army);
                }
            }
        }
    }
    
    /**
     * 检查并处理战斗
     */
    checkBattle(army) {
        const state = this.state;
        
        // 检查目的地是否有敌对城池
        const targetCity = Object.values(state.cities).find(c => 
            c.owner !== army.faction && 
            Math.abs(c.position.x - army.x) < 0.5 && 
            Math.abs(c.position.y - army.y) < 0.5
        );
        
        if (targetCity) {
            console.log(`军队到达敌对城池: ${targetCity.name}，开始攻城`);
            this.siegeCity(army, targetCity);
            return;
        }
        
        // 检查是否有敌对军队
        const enemyArmies = Object.values(state.armies || {}).filter(a => 
            a.faction !== army.faction &&
            Math.abs(a.x - army.x) < 0.5 && 
            Math.abs(a.y - army.y) < 0.5
        );
        
        if (enemyArmies.length > 0) {
            console.log(`遭遇敌军，开始战斗`);
            this.fieldBattle(army, enemyArmies[0]);
        }
    }
    
    /**
     * 攻城战
     */
    siegeCity(attackArmy, targetCity) {
        const state = this.state;
        const attackGeneral = state.generals[attackArmy.general];
        const defender = targetCity.governor ? state.generals[targetCity.governor] : null;
        
        console.log(`攻城战: ${attackGeneral.name} 率军攻打 ${targetCity.name}`);
        
        // 计算城防（城墙等级影响）
        const wall = targetCity.buildings.find(b => b.type === 'wall');
        const wallBonus = wall ? wall.level * 20 : 0;
        
        // 计算守军力量（假设城池有一定的守军）
        const garrisonTroops = Math.max(50, targetCity.population * 0.1);
        const defenseBonus = wallBonus + (defender ? defender.attributes.command * 5 : 0);
        const defensePower = garrisonTroops * 8 + defenseBonus;
        
        // 计算攻击力
        const attackPower = calculateArmyPower(attackArmy, attackGeneral);
        
        console.log(`攻城力量: ${attackPower}, 防御力量: ${defensePower}`);
        
        // 攻城需要攻击力是防御力的1.5倍才能成功
        if (attackPower >= defensePower * 1.5) {
            // 攻城成功
            const casualties = Math.floor(attackArmy.troops * 0.3); // 攻城损失30%
            attackArmy.troops -= casualties;
            attackArmy.morale = Math.max(50, attackArmy.morale - 20);
            
            if (attackArmy.troops <= 0) {
                // 军队全灭
                console.log(`攻城成功但军队全灭`);
                delete state.armies[attackArmy.id];
                return;
            }
            
            // 占领城池
            const oldOwner = targetCity.owner;
            targetCity.owner = attackArmy.faction;
            
            // 更新势力城池列表
            if (oldOwner && state.factions[oldOwner]) {
                const index = state.factions[oldOwner].cities.indexOf(targetCity.id);
                if (index > -1) {
                    state.factions[oldOwner].cities.splice(index, 1);
                }
            }
            
            if (state.factions[attackArmy.faction]) {
                state.factions[attackArmy.faction].cities.push(targetCity.id);
            }
            
            // 清除原太守
            if (targetCity.governor) {
                const oldGovernor = state.generals[targetCity.governor];
                if (oldGovernor) {
                    oldGovernor.position = 'none';
                    oldGovernor.location = null;
                }
                targetCity.governor = null;
            }
            
            console.log(`${attackGeneral.name} 攻占了 ${targetCity.name}! 损失${casualties}士兵`);
            
            this.notifyListeners('cityConquered', { 
                cityId: targetCity.id, 
                newOwner: attackArmy.faction,
                oldOwner: oldOwner,
                casualties: casualties
            });
        } else {
            // 攻城失败
            const casualties = Math.floor(attackArmy.troops * 0.5); // 失败损失50%
            attackArmy.troops -= casualties;
            attackArmy.morale = Math.max(30, attackArmy.morale - 30);
            
            if (attackArmy.troops <= 0) {
                console.log(`攻城失败，军队全灭`);
                delete state.armies[attackArmy.id];
            } else {
                console.log(`攻城失败，损失${casualties}士兵，撤退`);
                // 撤退到附近位置
                attackArmy.x += (Math.random() - 0.5) * 2;
                attackArmy.y += (Math.random() - 0.5) * 2;
                attackArmy.mission = 'idle';
            }
            
            this.notifyListeners('siegeFailed', { 
                cityId: targetCity.id, 
                attackerFaction: attackArmy.faction,
                casualties: casualties
            });
        }
    }
    
    /**
     * 野战
     */
    fieldBattle(army1, army2) {
        const state = this.state;
        const general1 = state.generals[army1.general];
        const general2 = state.generals[army2.general];
        
        console.log(`野战: ${general1.name} vs ${general2.name}`);
        
        // 使用 simulateBattle 进行战斗
        const result = simulateBattle(army1, army2, general1, general2, 0);
        
        // 应用伤亡
        army1.troops -= result.attackerCasualties;
        army2.troops -= result.defenderCasualties;
        
        // 更新士气
        army1.morale = Math.max(30, army1.morale + result.attackerMoraleChange);
        army2.morale = Math.max(30, army2.morale + result.defenderMoraleChange);
        
        console.log(`野战结果: 胜者=${result.winner}, ${general1.name}剩余${army1.troops}人, ${general2.name}剩余${army2.troops}人`);
        
        // 检查是否有军队被消灭
        if (army1.troops <= 0) {
            console.log(`${general1.name} 的军队被消灭`);
            delete state.armies[army1.id];
        }
        
        if (army2.troops <= 0) {
            console.log(`${general2.name} 的军队被消灭`);
            delete state.armies[army2.id];
        }
        
        this.notifyListeners('battleCompleted', { 
            army1: army1.id, 
            army2: army2.id, 
            result: result 
        });
    }
    
    /**
     * 移动军队到目标城市（只能沿道路移动）
     * @param {string} armyId - 军队ID
     * @param {string} targetCityId - 目标城市ID
     */
    moveArmyToCity(armyId, targetCityId) {
        const army = this.state.armies[armyId];
        if (!army) {
            return { success: false, message: '军队不存在' };
        }
        
        const playerFaction = this.getPlayerFaction();
        if (army.faction !== playerFaction.id) {
            return { success: false, message: '这不是你的军队' };
        }
        
        const targetCity = this.getCity(targetCityId);
        if (!targetCity) {
            return { success: false, message: '目标城市不存在' };
        }
        
        // 找到军队当前所在的城市（或最近的城市）
        let currentCityId = army.origin;
        
        // 如果军队正在移动，找到它的目标城市
        if (army.destination && army.destination.cityId) {
            currentCityId = army.destination.cityId;
        } else if (army.path && army.path.length > 0) {
            // 如果有路径，使用路径中的最后一个城市
            const lastPoint = army.path[army.path.length - 1];
            if (lastPoint.cityId) {
                currentCityId = lastPoint.cityId;
            }
        } else {
            // 否则找到军队当前位置最近的城市
            let minDistance = Infinity;
            for (const cityId in this.state.cities) {
                const city = this.state.cities[cityId];
                const distance = Math.sqrt(
                    Math.pow(city.position.x - army.x, 2) + 
                    Math.pow(city.position.y - army.y, 2)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    currentCityId = cityId;
                }
            }
        }
        
        // 使用道路网络查找路径
        const cityPath = findRoadPath(
            currentCityId, 
            targetCityId, 
            this.state.roads, 
            this.state.cities
        );
        
        if (!cityPath) {
            return { 
                success: false, 
                message: `无法通过道路到达 ${targetCity.name}，请建造道路连接` 
            };
        }
        
        // 转换为坐标路径
        const coordinatePath = convertCityPathToCoordinates(cityPath, this.state.cities);
        
        if (coordinatePath.length === 0) {
            return { success: false, message: '路径计算失败' };
        }
        
        // 设置军队路径
        army.path = coordinatePath;
        army.destination = coordinatePath[coordinatePath.length - 1];
        army.mission = 'moving';
        
        console.log(`军队 ${armyId} 开始通过道路移动到 ${targetCity.name}，路径:`, cityPath.map(id => this.state.cities[id].name).join(' -> '));
        this.notifyListeners('armyMoved', { armyId, army, cityPath });
        
        return { 
            success: true, 
            message: `军队开始向 ${targetCity.name} 移动`,
            path: cityPath
        };
    }
    
    /**
     * 移动军队（旧接口，已废弃）
     * @deprecated 使用 moveArmyToCity 代替
     */
    moveArmy(armyId, targetX, targetY) {
        const army = this.state.armies[armyId];
        if (!army) {
            return { success: false, message: '军队不存在' };
        }
        
        const playerFaction = this.getPlayerFaction();
        if (army.faction !== playerFaction.id) {
            return { success: false, message: '这不是你的军队' };
        }
        
        // 计算路径
        const path = calculatePath({ x: army.x, y: army.y }, { x: targetX, y: targetY });
        army.path = path;
        army.destination = { x: targetX, y: targetY };
        army.mission = 'moving';
        
        console.log(`军队 ${armyId} 开始移动到 (${targetX}, ${targetY})`);
        this.notifyListeners('armyMoved', { armyId, army });
        
        return { success: true, message: '军队开始移动' };
    }
    
    /**
     * 获取玩家的城池列表
     */
    getPlayerCities() {
        const playerFaction = this.getPlayerFaction();
        return playerFaction.cities.map(cityId => this.getCity(cityId));
    }
    
    /**
     * 获取玩家的武将列表
     */
    getPlayerGenerals() {
        const playerFaction = this.getPlayerFaction();
        return playerFaction.generals.map(generalId => this.getGeneral(generalId));
    }
    
    /**
     * 触发朝会
     */
    triggerCourtMeeting() {
        if (this.courtMeetingSystem) {
            return this.courtMeetingSystem.triggerCourtMeeting();
        }
        return [];
    }
    
    /**
     * 处理朝会事件选择
     */
    handleCourtEventChoice(eventId, optionIndex) {
        if (this.courtMeetingSystem) {
            const result = this.courtMeetingSystem.handleEventChoice(eventId, optionIndex);
            // 更新UI
            this.notifyListeners('courtEventResolved', { eventId, result });
            return result;
        }
        return { success: false, message: '朝会系统未初始化' };
    }
    
    /**
     * 获取待处理的朝会事件
     */
    getPendingCourtEvents() {
        if (this.courtMeetingSystem) {
            return this.courtMeetingSystem.getPendingEvents();
        }
        return [];
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
