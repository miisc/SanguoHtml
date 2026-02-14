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
        this.processingCourtEvent = false; // 朝会事件处理标记
        
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
            this.showMilitaryPanel();
        });

        document.getElementById('btn-court').addEventListener('click', () => {
            this.triggerCourtMeeting();
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
        
        // 监听军队选中事件
        window.addEventListener('armySelected', (e) => {
            this.showArmyInfo(e.detail.armyId);
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
            
            // 城池被占领
            if (event === 'cityConquered' && data) {
                const city = state.cities[data.cityId];
                const newOwnerFaction = state.factions[data.newOwner];
                this.showMessage('城池占领', `${newOwnerFaction.name} 占领了 ${city.name}！损失${data.casualties}士兵`);
            }
            
            // 攻城失败
            if (event === 'siegeFailed' && data) {
                const city = state.cities[data.cityId];
                this.showMessage('攻城失败', `攻打 ${city.name} 失败，损失${data.casualties}士兵`);
            }
            
            // 战斗完成
            if (event === 'battleCompleted' && data) {
                this.showMessage('战斗结束', '野战结束！');
            }
            
            // 朝会事件处理完成
            if (event === 'courtEventResolved' && data) {
                this.updateHeader();
            }
        });
        
        // 监听朝会触发事件
        window.addEventListener('courtMeetingTriggered', (e) => {
            this.showCourtMeeting(e.detail.events);
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
     * 触发朝会
     */
    triggerCourtMeeting() {
        const events = this.gameState.triggerCourtMeeting();
        this.showCourtMeeting(events);
    }
    
    /**
     * 显示朝会面板
     */
    showCourtMeeting(events = null) {
        if (!events) {
            events = this.gameState.getPendingCourtEvents();
        }
        
        if (events.length === 0) {
            this.showMessage('朝会', '当前无事件需要处理。');
            return;
        }
        
        this.showPanel('朝廷会议', this.renderCourtEvents(events));
    }
    
    /**
     * 渲染朝会事件
     */
    renderCourtEvents(events) {
        let html = '<div class="court-meeting">';
        
        html += '<div style="text-align: center; color: #d4af37; margin-bottom: 20px;">';
        html += '<p style="font-size: 16px; font-weight: bold;">★ 朝廷会议 ★</p>';
        html += '<p style="font-size: 12px;color: #e8dcc4;">诸位爱卿，有事启奏，无事退朝。</p>';
        html += '</div>';
        
        // 显示事件数量
        html += `<div style="margin-bottom: 15px; padding: 10px; background: rgba(212, 175, 55, 0.1); border-left: 3px solid #d4af37;">`;
        html += `<strong>待处理事件：${events.length} 件</strong>`;
        html += '</div>';
        
        // 显示第一个事件
        const currentEvent = events[0];
        html += this.renderSingleCourtEvent(currentEvent, 0, events.length);
        
        html += '</div>';
        
        // 绑定按钮事件
        setTimeout(() => {
            document.querySelectorAll('.court-option-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // 防止重复触发
                    if (e.target.disabled || this.processingCourtEvent) {
                        return;
                    }
                    const eventId = e.target.dataset.eventId;
                    const optionIndex = parseInt(e.target.dataset.optionIndex);
                    this.handleCourtEventChoice(eventId, optionIndex);
                });
            });
        }, 100);
        
        return html;
    }
    
    /**
     * 渲染单个朝会事件
     */
    renderSingleCourtEvent(event, index, total) {
        const priorityLabels = {
            3: '<span style="color: #e74c3c;">★★★ 紧急</span>',
            2: '<span style="color: #f39c12;">★★ 重要</span>',
            1: '<span style="color: #3498db;">★ 一般</span>',
            0: '<span style="color: #95a5a6;">普通</span>'
        };
        
        let html = `<div class="court-event-item" style="margin-bottom: 20px;">`;
        
        // 事件编号和优先级
        html += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">`;
        html += `<span style="color: #d4af37; font-weight: bold;">第 ${index + 1}/${total} 件</span>`;
        html += `<span>${priorityLabels[event.priority] || ''}</span>`;
        html += '</div>';
        
        // 事件标题
        html += `<h3 style="color: #d4af37; margin: 10px 0; font-size: 18px;">${event.title}</h3>`;
        
        // 事件描述
        html += `<div style="background: rgba(58, 47, 31, 0.5); padding: 15px; border-radius: 5px; margin: 15px 0; border: 1px solid #8b7355;">`;
        html += `<p style="line-height: 1.6; white-space: pre-line;">${event.description}</p>`;
        html += '</div>';
        
        // 选项
        html += '<div style="margin-top: 20px;">';
        html += '<p style="color: #d4af37; font-weight: bold; margin-bottom: 10px;">—— 请主公决断 ——</p>';
        
        event.options.forEach((option, optionIndex) => {
            html += `<button class="court-option-btn" 
                data-event-id="${event.id}" 
                data-option-index="${optionIndex}"
                style="
                    display: block;
                    width: 100%;
                    margin: 8px 0;
                    padding: 12px;
                    background: rgba(212, 175, 55, 0.2);
                    border: 2px solid #d4af37;
                    border-radius: 5px;
                    color: #e8dcc4;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                ">
                ${option.text}
            </button>`;
        });
        
        html += '</div>';
        html += '</div>';
        
        return html;
    }
    
    /**
     * 处理朝会事件选择
     */
    handleCourtEventChoice(eventId, optionIndex) {
        // 防止重复处理
        if (this.processingCourtEvent) {
            return;
        }
        this.processingCourtEvent = true;
        
        // 立即禁用所有按钮
        document.querySelectorAll('.court-option-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
        
        const result = this.gameState.handleCourtEventChoice(eventId, optionIndex);
        
        if (result.success || result.success === undefined) {
            // 显示结果
            this.showMessage('处理结果', result.message || '已处理');
            
            // 检查是否还有更多事件
            setTimeout(() => {
                const remainingEvents = this.gameState.getPendingCourtEvents();
                if (remainingEvents.length > 0) {
                    this.showCourtMeeting(remainingEvents);
                } else {
                    this.hidePanel();
                }
                this.processingCourtEvent = false;
            }, 1500);
        } else {
            this.showMessage('处理失败', result.message);
            // 失败时也重新显示事件
            setTimeout(() => {
                const events = this.gameState.getPendingCourtEvents();
                if (events.length > 0) {
                    this.showCourtMeeting(events);
                }
                this.processingCourtEvent = false;
            }, 1500);
        }
        
        this.updateHeader();
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
     * 显示军事面板
     */
    showMilitaryPanel() {
        this.showPanel();
        this.panelTitle.textContent = '军事';
        
        const state = this.gameState.getState();
        const playerFaction = this.gameState.getPlayerFaction();
        
        let html = '<div class="military-panel">';
        
        // 显示所有军队
        html += '<h3>我的军队</h3>';
        html += '<div class="army-list">';
        
        const armies = Object.values(state.armies || {}).filter(a => a.faction === playerFaction.id);
        
        if (armies.length === 0) {
            html += '<p>暂无军队</p>';
        } else {
            for (const army of armies) {
                const general = state.generals[army.general];
                html += `
                    <div class="army-item">
                        <div><strong>${general.name}</strong> 的军队</div>
                        <div>兵力: ${army.troops}</div>
                        <div>士气: ${army.morale}</div>
                        <div>状态: ${army.mission === 'idle' ? '待命' : '行军中'}</div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        
        // 招募新军队
        html += '<h3>招募军队</h3>';
        html += '<div class="recruit-section">';
        
        // 显示玩家城池
        const playerCities = playerFaction.cities.map(cid => state.cities[cid]);
        
        if (playerCities.length === 0) {
            html += '<p>你没有城池</p>';
        } else {
            html += '<div class="recruit-form">';
            html += '<label>选择城池:</label>';
            html += '<select id="recruit-city">';
            for (const city of playerCities) {
                html += `<option value="${city.id}">${city.name}</option>`;
            }
            html += '</select>';
            
            html += '<label>选择武将:</label>';
            html += '<select id="recruit-general">';
            
            // 显示空闲武将
            const availableGenerals = playerFaction.generals
                .map(gid => state.generals[gid])
                .filter(g => {
                    // 检查是否已经带队
                    const hasArmy = armies.some(a => a.general === g.id);
                    return !hasArmy && g.position !== 'ruler' && g.position !== 'governor';
                });
            
            if (availableGenerals.length === 0) {
                html += '<option value="">无空闲武将</option>';
            } else {
                for (const general of availableGenerals) {
                    html += `<option value="${general.id}">${general.name} (统率:${general.attributes.command})</option>`;
                }
            }
            
            html += '</select>';
            
            html += '<label>士兵数量:</label>';
            html += '<input type="number" id="recruit-troops" value="100" min="10" max="10000" step="10">';
            
            const costPerTroop = 50;
            const estimatedCost = 100 * costPerTroop;
            html += `<div class="cost-info">每士兵消耗: 50金 + 20粮<br>预计成本: <span id="recruit-cost">${estimatedCost}金 + ${100 * 20}粮</span></div>`;
            
            html += '<button id="btn-recruit" class="action-btn">招募</button>';
            html += '</div>';
        }
        
        html += '</div>';
        html += '</div>';
        
        this.panelContent.innerHTML = html;
        
        // 绑定事件
        const troopsInput = document.getElementById('recruit-troops');
        if (troopsInput) {
            troopsInput.addEventListener('input', () => {
                const troops = parseInt(troopsInput.value) || 0;
                const cost = troops * 50;
                const food = troops * 20;
                document.getElementById('recruit-cost').textContent = `${cost}金 + ${food}粮`;
            });
        }
        
        const recruitBtn = document.getElementById('btn-recruit');
        if (recruitBtn) {
            recruitBtn.addEventListener('click', () => {
                this.recruitArmy();
            });
        }
    }
    
    /**
     * 招募军队
     */
    recruitArmy() {
        const cityId = document.getElementById('recruit-city').value;
        const generalId = document.getElementById('recruit-general').value;
        const troops = parseInt(document.getElementById('recruit-troops').value) || 0;
        
        if (!generalId) {
            this.showMessage('招募失败', '请选择武将');
            return;
        }
        
        if (troops < 10) {
            this.showMessage('招募失败', '至少招募10名士兵');
            return;
        }
        
        const result = this.gameState.recruitArmy(cityId, generalId, troops);
        
        if (result.success) {
            this.showMessage('招募成功', result.message);
            // 刷新军事面板
            this.showMilitaryPanel();
        } else {
            this.showMessage('招募失败', result.message);
        }
    }
    
    /**
     * 显示军队信息
     */
    showArmyInfo(armyId) {
        this.showPanel();
        this.panelTitle.textContent = '军队详情';
        
        const state = this.gameState.getState();
        const army = state.armies[armyId];
        
        if (!army) {
            this.panelContent.innerHTML = '<p>军队不存在</p>';
            return;
        }
        
        const general = state.generals[army.general];
        const faction = state.factions[army.faction];
        
        let html = '<div class="army-detail">';
        
        html += '<h3>军队信息</h3>';
        html += `<div class="info-item"><span class="info-label">统帅:</span> ${general.name}</div>`;
        html += `<div class="info-item"><span class="info-label">势力:</span> <span style="color:${faction.color}">${faction.name}</span></div>`;
        html += `<div class="info-item"><span class="info-label">兵力:</span> ${army.troops}</div>`;
        html += `<div class="info-item"><span class="info-label">士气:</span> ${army.morale}</div>`;
        html += `<div class="info-item"><span class="info-label">状态:</span> ${army.mission === 'idle' ? '待命' : army.mission === 'moving' ? '行军中' : '其他'}</div>`;
        html += `<div class="info-item"><span class="info-label">位置:</span> (${army.x.toFixed(1)}, ${army.y.toFixed(1)})</div>`;
        
        if (army.destination) {
            html += `<div class="info-item"><span class="info-label">目标:</span> (${army.destination.x.toFixed(1)}, ${army.destination.y.toFixed(1)})</div>`;
        }
        
        // 如果是玩家的军队，显示操作按钮
        const playerFaction = this.gameState.getPlayerFaction();
        if (army.faction === playerFaction.id) {
            html += '<h3>操作</h3>';
            html += '<div style="background: rgba(212, 175, 55, 0.2); padding: 10px; border-radius: 5px; margin: 10px 0; border: 2px solid #d4af37;">';
            html += '<p style="color: #d4af37; font-size: 14px; margin: 5px 0; font-weight: bold;">✓ 军队已选中</p>';
            html += '<p style="color: #e8dcc4; font-size: 12px; margin: 5px 0;">→ 点击地图任意位置</p>';
            html += '<p style="color: #e8dcc4; font-size: 12px; margin: 5px 0;">→ 军队将移动到该位置</p>';
            html += '</div>';
            
            // 解散军队按钮
            html += `<button class="action-btn" onclick="window.uiManager.disbandArmy('${armyId}')">解散军队</button>`;
        }
        
        html += '</div>';
        
        this.panelContent.innerHTML = html;
    }
    
    /**
     * 解散军队
     */
    disbandArmy(armyId) {
        const state = this.gameState.getState();
        const army = state.armies[armyId];
        
        if (!army) {
            this.showMessage('解散失败', '军队不存在');
            return;
        }
        
        const general = state.generals[army.general];
        
        if (confirm(`确定要解散 ${general.name} 带领的军队吗？`)) {
            delete state.armies[armyId];
            this.showMessage('军队解散', `${general.name} 的军队已解散`);
            this.hidePanel();
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
