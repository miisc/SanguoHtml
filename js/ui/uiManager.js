/**
 * UI管理器
 * 负责管理所有UI交互和更新
 */

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

        document.getElementById('btn-next-turn').addEventListener('click', () => {
            this.nextTurn();
        });

        // 监听城池选中事件
        window.addEventListener('citySelected', (e) => {
            this.showCityInfo(e.detail.cityId);
        });

        window.addEventListener('cityDeselected', () => {
            this.hidePanel();
        });

        // 监听游戏状态变化
        this.gameState.addListener((event) => {
            if (event === 'turnChanged') {
                this.updateHeader();
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
     * 显示武将列表
     */
    showGeneralsList() {
        const playerFaction = this.gameState.getPlayerFaction();
        const state = this.gameState.getState();
        
        let content = '<h4>我方武将</h4>';
        
        for (const generalId of playerFaction.generals) {
            const general = state.generals[generalId];
            content += `
                <div class="info-item">
                    <strong>${general.name}</strong> (${general.courtesyName})<br>
                    <small>
                        武力: ${general.attributes.force} | 
                        智力: ${general.attributes.intelligence} | 
                        统率: ${general.attributes.command}<br>
                        魅力: ${general.attributes.charm} | 
                        忠诚: ${general.loyalty}
                    </small>
                </div>
            `;
        }
        
        this.showPanel('武将列表', content);
    }

    /**
     * 显示消息
     */
    showMessage(title, message) {
        this.showPanel(title, `<p>${message}</p>`);
    }

    /**
     * 下一回合
     */
    nextTurn() {
        this.showLoading();
        
        setTimeout(() => {
            this.gameState.nextTurn();
            this.hideLoading();
            this.showMessage('回合结束', `已进入第 ${this.gameState.getState().currentTurn} 回合`);
        }, 500);
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
