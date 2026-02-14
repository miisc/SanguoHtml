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

class GameStateManager {
    constructor() {
        this.state = null;
        this.listeners = [];
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
     * 下一回合
     */
    nextTurn() {
        this.state.currentTurn++;
        
        // 推进季节
        const seasonIndex = SEASONS.indexOf(this.state.currentSeason);
        const nextSeasonIndex = (seasonIndex + 1) % SEASONS.length;
        this.state.currentSeason = SEASONS[nextSeasonIndex];
        
        // 如果回到春季，年份+1
        if (nextSeasonIndex === 0) {
            this.state.currentYear++;
        }

        // 更新资源
        this.updateResources();

        console.log(`回合 ${this.state.currentTurn}: ${this.state.currentYear}年 ${this.state.currentSeason}`);
        this.notifyListeners('turnChanged');
    }

    /**
     * 更新资源
     */
    updateResources() {
        for (const factionId in this.state.factions) {
            const faction = this.state.factions[factionId];
            
            // 计算城池产出
            for (const cityId of faction.cities) {
                const city = this.state.cities[cityId];
                faction.resources.gold += city.production.goldPerTurn;
                faction.resources.food += city.production.foodPerTurn;
                faction.resources.wood += city.production.woodPerTurn;
            }

            // 扣除维护费用
            const maintenanceCost = faction.generals.length * 10;
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
     * 通知所有监听器
     */
    notifyListeners(event) {
        for (const listener of this.listeners) {
            listener(event, this.state);
        }
    }
}

// 导出单例
export const gameState = new GameStateManager();
