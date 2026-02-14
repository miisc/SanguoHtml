/**
 * UI管理器
 * 负责管理所有UI交互和更新
 */

import { BUILDING_TYPES, getBuildingUpgradeCost, canBuildOrUpgrade } from '../data/buildings.js';

export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.infoPanel = document.getElementById('info-panel');
        this.panelTitle = document.getElementById('panel-title');
        this.panelContent = document.getElementById('panel-content');
        
        this.setupEventListeners();
        this.updateHeader();
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 关闭面板
        document.querySelector('.close-btn').addEventListener('click', () => {
            this.hidePanel();
        });

        // 底部按钮
        document.getElementById('btn-cities').addEventListener('click', () => {
            this.showCitiesList();
        });

        document.getElementById('btn-generals').addEventListener('click', () => {
            this.showGeneralsList();
        });

        document.getElementById('btn-military').addEventListener('click', () => {
            this.showMessage('军事系统', '军事功能开发中...');
        });

        document.getElementById('btn-internal').addEventListener('click', () => {
            this.showMessage('内政系统', '内政功能开发中...');
        });

        document.getElementById('btn-diplomacy').addEventListener('click', () => {
            this.showMessage('外交系统', '外交功能开发中...');
        });

        document.getElementById('btn-save').addEventListener('click', () => {
            this.saveGame();
        });

        document.getElementById('btn-load').addEventListener('click', () => {
            this.loadGame();
        });

        document.getElementById('btn-pause').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('btn-speed-1x').addEventListener('click', () => {
            this.setSpeed(1);
        });
        
        document.getElementById('btn-speed-2x').addEventListener('click', () => {
            this.setSpeed(2);
        });
        
        document.getElementById('btn-speed-4x').addEventListener('click', () => {
            this.setSpeed(4);
        });

        // 监听城池选中事件
        window.addEventListener('citySelected', (e) => {
            this.showCityInfo(e.detail.cityId);
        });

        window.addEventListener('cityDeselected', () => {
            this.hidePanel();
        });

        // 监听游戏状态变化
        this.gameState.addListener((event, state, data) => {
            if (event === 'timeChanged' || event === 'speedChanged') {
                this.updateHeader();
                this.updateSpeedButtons();
            }
            
            // 建筑完成提示
            if (event === 'buildingCompleted' && data) {
                const city = this.gameState.getCity(data.cityId);
                this.showMessage('建筑完成', `${city.name} 的 ${data.building.name} Lv.${data.building.level} 已建造完成！`);
            }
        });
    }

    /**
     * 更新顶部信息栏
     */
    updateHeader() {
        const state = this.gameState.getState();
        const playerFaction = this.gameState.getPlayerFaction();
        
        document.getElementById('current-date').textContent = 
            `公元${state.currentYear}年 ${state.currentSeason}`;
        
        document.getElementById('player-faction').textContent = 
            `势力：${playerFaction.name}`;
        
        document.getElementById('gold').textContent = 
            Math.floor(playerFaction.resources.gold);
        
        document.getElementById('food').textContent = 
            Math.floor(playerFaction.resources.food);
        
        document.getElementById('wood').textContent = 
            Math.floor(playerFaction.resources.wood);
    }
    
    /**
     * 更新速度按钮状态
     */
    updateSpeedButtons() {
        const currentSpeed = this.gameState.getGameSpeed();
        const pauseBtn = document.getElementById('btn-pause');
        
        // 更新暂停按钮
        if (currentSpeed === 0) {
            pauseBtn.textContent = '▶ 继续';
            pauseBtn.classList.add('active');
        } else {
            pauseBtn.textContent = '⏸ 暂停';
            pauseBtn.classList.remove('active');
        }
        
        // 更新速度按钮
        document.getElementById('btn-speed-1x').classList.toggle('active', currentSpeed === 1);
        document.getElementById('btn-speed-2x').classList.toggle('active', currentSpeed === 2);
        document.getElementById('btn-speed-4x').classList.toggle('active', currentSpeed === 4);
    }

    /**
     * 显示面板
     */
    showPanel(title, content) {
        this.panelTitle.textContent = title;
        this.panelContent.innerHTML = content;
        this.infoPanel.classList.remove('hidden');
    }

    /**
     * 隐藏面板
     */
    hidePanel() {
        this.infoPanel.classList.add('hidden');
    }

    /**
     * 显示城池信息
     */
    showCityInfo(cityId) {
        const city = this.gameState.getCity(cityId);
        const state = this.gameState.getState();
        
        let ownerName = '无主';
        if (city.owner && state.factions[city.owner]) {
            ownerName = state.factions[city.owner].name;
        }
        
        // 太守信息
        let governorInfo = '无';
        if (city.governor) {
            const governor = state.generals[city.governor];
            if (governor) {
                governorInfo = `${governor.name}(政治:${governor.attributes.politics})`;
            }
        }
        
        const content = `
            <div class="info-item">
                <span class="info-label">城池名称:</span>
                <span class="info-value">${city.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">所属势力:</span>
                <span class="info-value">${ownerName}</span>
            </div>
            <div class="info-item">
                <span class="info-label">太守:</span>
                <span class="info-value">${governorInfo}</span>
            </div>
            <div class="info-item">
                <span class="info-label">人口:</span>
                <span class="info-value">${city.population.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">守军:</span>
                <span class="info-value">${city.garrison.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">城墙等级:</span>
                <span class="info-value">${city.walls}</span>
            </div>
            <div class="info-item">
                <span class="info-label">发展度:</span>
                <span class="info-value">${city.development}</span>
            </div>
            <div class="info-item">
                <span class="info-label">每回合产出:</span>
                <span class="info-value">
                    💰 ${city.production.goldPerTurn} 
                    🌾 ${city.production.foodPerTurn}
                    🌲 ${city.production.woodPerTurn}
                </span>
            </div>
            <hr style="border-color: #8b7355; margin: 10px 0;">
            <h4 style="color: #d4af37; margin-bottom: 10px;">建筑</h4>
            ${this.renderCityBuildings(city)}
            ${city.owner === this.gameState.getPlayerFaction().id ? this.renderBuildingOptions(city) : ''}
        `;
        
        this.showPanel(`城池：${city.name}`, content);
    }

    /**
     * 显示城池列表
     */
    showCitiesList() {
        const playerFaction = this.gameState.getPlayerFaction();
        const state = this.gameState.getState();
        
        let content = '<h4>我方城池</h4>';
        
        for (const cityId of playerFaction.cities) {
            const city = state.cities[cityId];
            content += `
                <div class="info-item" style="cursor: pointer;" onclick="window.dispatchEvent(new CustomEvent('citySelected', {detail: {cityId: '${city.id}'}}))">
                    <strong>${city.name}</strong><br>
                    <small>人口: ${city.population.toLocaleString()} | 守军: ${city.garrison.toLocaleString()}</small>
                </div>
            `;
        }
        
        if (playerFaction.cities.length === 0) {
            content += '<p>暂无城池</p>';
        }
        
        this.showPanel('城池列表', content);
    }
    
    /**
     * 渲染城池建筑列表
     */
    renderCityBuildings(city) {
        if (city.buildings.length === 0) {
            return '<p style="color: #999;">暂无建筑</p>';
        }
        
        let html = '';
        for (const building of city.buildings) {
            const status = building.underConstruction 
                ? `<span style="color: #f39c12;">(建造中: ${building.constructionProgress}天)</span>`
                : '';
            
            html += `
                <div class="info-item">
                    <strong>${BUILDING_TYPES[building.type].icon} ${building.name} Lv.${building.level}</strong> ${status}<br>
                    <small>${BUILDING_TYPES[building.type].description}</small>
                </div>
            `;
        }
        
        return html;
    }
    
    /**
     * 渲染建造选项
     */
    renderBuildingOptions(city) {
        let html = '<hr style="border-color: #8b7355; margin: 10px 0;"><h4 style="color: #d4af37; margin-bottom: 10px;">建造/升级</h4>';
        
        const playerFaction = this.gameState.getPlayerFaction();
        
        for (const [buildingType, config] of Object.entries(BUILDING_TYPES)) {
            const existingBuilding = city.buildings.find(b => b.type === buildingType);
            const currentLevel = existingBuilding ? existingBuilding.level : 0;
            const check = canBuildOrUpgrade(city, buildingType, playerFaction.resources);
            const cost = check.cost || getBuildingUpgradeCost(buildingType, currentLevel);
            
            const isMaxLevel = currentLevel >= config.maxLevel;
            const isUnderConstruction = existingBuilding && existingBuilding.underConstruction;
            const canBuild = check.canBuild && !isUnderConstruction;
            
            const buttonDisabled = !canBuild || isMaxLevel ? 'disabled' : '';
            const buttonText = isMaxLevel ? '已满级' : (currentLevel > 0 ? `升级到Lv.${currentLevel + 1}` : '建造');
            
            html += `
                <div class="building-option" style="margin-bottom: 10px; padding: 10px; background-color: rgba(58, 47, 31, 0.5); border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <strong>${config.icon} ${config.name} ${currentLevel > 0 ? `Lv.${currentLevel}` : ''}</strong>
                        <button class="build-btn" data-city="${city.id}" data-building="${buildingType}" ${buttonDisabled}
                            style="padding: 5px 10px; font-size: 12px;">
                            ${buttonText}
                        </button>
                    </div>
                    <small>${config.description}</small><br>
                    <small style="color: #d4af37;">
                        💰${cost.gold} 🌲${cost.wood} 🌾${cost.food} ⏱${cost.time}天
                    </small>
                    ${!check.canBuild && !isMaxLevel && !isUnderConstruction ? `<br><small style="color: #e74c3c;">${check.reason}</small>` : ''}
                </div>
            `;
        }
        
        // 绑定建造按钮事件
        setTimeout(() => {
            document.querySelectorAll('.build-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const cityId = e.target.dataset.city;
                    const buildingType = e.target.dataset.building;
                    this.buildBuilding(cityId, buildingType);
                });
            });
        }, 100);
        
        return html;
    }
    
    /**
     * 建造建筑
     */
    buildBuilding(cityId, buildingType) {
        const result = this.gameState.buildOrUpgradeBuilding(cityId, buildingType);
        
        if (result.success) {
            this.showMessage('建造成功', `${result.message}，预计${result.buildTime}天完成`);
            this.updateHeader();
            // 刷新城池信息
            setTimeout(() => this.showCityInfo(cityId), 1000);
        } else {
            this.showMessage('建造失败', result.message);
        }
    }

    /**
     * 显示武将列表
     */
    showGeneralsList() {
        const playerFaction = this.gameState.getPlayerFaction();
        const state = this.gameState.getState();
        
        let content = '<h4>我方武将</h4>';
        
        for (const generalId of playerFaction.generals) {
            const general = state.generals[generalId];
            let positionText = '待命';
            if (general.position === 'ruler') {
                positionText = '君主';
            } else if (general.position === 'governor' && general.location) {
                const city = state.cities[general.location];
                positionText = `${city.name}太守`;
            }
            
            content += `
                <div class="info-item" style="cursor: pointer;" onclick="window.uiManager.showGeneralDetail('${generalId}')">
                    <strong>${general.name}</strong> (${general.courtesyName})<br>
                    <small>
                        职位: ${positionText}<br>
                        武力: ${general.attributes.force} | 
                        智力: ${general.attributes.intelligence} | 
                        统率: ${general.attributes.command}<br>
                        政治: ${general.attributes.politics} |
                        魅力: ${general.attributes.charm} | 
                        忠诚: ${general.loyalty}
                    </small>
                </div>
            `;
        }
        
        this.showPanel('武将列表', content);
        
        // 暴露到全局以供点击调用
        window.uiManager = this;
    }
    
    /**
     * 显示武将详情
     */
    showGeneralDetail(generalId) {
        const general = this.gameState.getGeneral(generalId);
        const playerFaction = this.gameState.getPlayerFaction();
        const state = this.gameState.getState();
        
        let positionText = '待命';
        let locationText = '-';
        
        if (general.position === 'ruler') {
            positionText = '君主';
        } else if (general.position === 'governor' && general.location) {
            const city = state.cities[general.location];
            positionText = '太守';
            locationText = city.name;
        }
        
        let content = `
            <div class="info-item">
                <span class="info-label">姓名:</span>
                <span class="info-value">${general.name} (${general.courtesyName})</span>
            </div>
            <div class="info-item">
                <span class="info-label">职位:</span>
                <span class="info-value">${positionText}</span>
            </div>
            <div class="info-item">
                <span class="info-label">地点:</span>
                <span class="info-value">${locationText}</span>
            </div>
            <div class="info-item">
                <span class="info-label">忠诚:</span>
                <span class="info-value">${general.loyalty}</span>
            </div>
            <hr style="border-color: #8b7355; margin: 10px 0;">
            <h4 style="color: #d4af37; margin-bottom: 10px;">属性</h4>
            <div class="info-item">
                <span class="info-label">武力:</span><span class="info-value">${general.attributes.force}</span>
            </div>
            <div class="info-item">
                <span class="info-label">智力:</span><span class="info-value">${general.attributes.intelligence}</span>
            </div>
            <div class="info-item">
                <span class="info-label">统率:</span><span class="info-value">${general.attributes.command}</span>
            </div>
            <div class="info-item">
                <span class="info-label">政治:</span><span class="info-value">${general.attributes.politics}</span>
            </div>
            <div class="info-item">
                <span class="info-label">魅力:</span><span class="info-value">${general.attributes.charm}</span>
            </div>
        `;
        
        // 如果不是君主，可以任命为太守
        if (general.position !== 'ruler') {
            content += '<hr style="border-color: #8b7355; margin: 10px 0;"><h4 style="color: #d4af37; margin-bottom: 10px;">任命</h4>';
            
            // 显示可任命的城池
            for (const cityId of playerFaction.cities) {
                const city = state.cities[cityId];
                const currentGovernor = city.governor ? state.generals[city.governor] : null;
                const isCurrentLocation = general.location === cityId;
                
                content += `
                    <div class="info-item" style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${city.name}</strong><br>
                            <small>太守: ${currentGovernor ? currentGovernor.name : '无'}</small>
                        </div>
                        <button class="appoint-btn" data-city="${cityId}" data-general="${generalId}" 
                            ${isCurrentLocation ? 'disabled' : ''}
                            style="padding: 5px 10px; font-size: 12px;">
                            ${isCurrentLocation ? '已任职' : '任命'}
                        </button>
                    </div>
                `;
            }
            
            // 绑定任命按钮事件
            setTimeout(() => {
                document.querySelectorAll('.appoint-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const cityId = e.target.dataset.city;
                        const genId = e.target.dataset.general;
                        this.appointGovernor(cityId, genId);
                    });
                });
            }, 100);
        }
        
        this.showPanel(`武将: ${general.name}`, content);
    }
    
    /**
     * 任命太守
     */
    appointGovernor(cityId, generalId) {
        const result = this.gameState.appointGovernor(cityId, generalId);
        
        if (result.success) {
            this.showMessage('任命成功', result.message);
            // 刷新武将详情
            setTimeout(() => this.showGeneralDetail(generalId), 1000);
        } else {
            this.showMessage('任命失败', result.message);
        }
    }

    /**
     * 显示消息
     */
    showMessage(title, message) {
        this.showPanel(title, `<p>${message}</p>`);
    }

    /**
     * 切换暂停/继续
     */
    togglePause() {
        const currentSpeed = this.gameState.getGameSpeed();
        if (currentSpeed === 0) {
            this.gameState.setGameSpeed(1); // 恢复为正常速度
        } else {
            this.gameState.setGameSpeed(0); // 暂停
        }
        this.updateSpeedButtons();
    }
    
    /**
     * 设置游戏速度
     */
    setSpeed(speed) {
        this.gameState.setGameSpeed(speed);
        this.updateSpeedButtons();
    }

    /**
     * 保存游戏
     */
    saveGame() {
        try {
            const state = this.gameState.getState();
            localStorage.setItem('sanguo_save', JSON.stringify(state));
            this.showMessage('保存成功', '游戏已保存到本地');
        } catch (e) {
            this.showMessage('保存失败', '保存游戏时出错：' + e.message);
        }
    }

    /**
     * 加载游戏
     */
    loadGame() {
        try {
            const savedState = localStorage.getItem('sanguo_save');
            if (savedState) {
                // 这里需要实现状态恢复逻辑
                this.showMessage('加载成功', '游戏已从本地加载（功能开发中）');
            } else {
                this.showMessage('加载失败', '未找到存档');
            }
        } catch (e) {
            this.showMessage('加载失败', '加载游戏时出错：' + e.message);
        }
    }

    /**
     * 显示加载提示
     */
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    /**
     * 隐藏加载提示
     */
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
}
