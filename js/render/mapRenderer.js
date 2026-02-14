/**
 * 地图渲染器
 * 负责渲染简化版2D地图
 */

import { TERRAIN_TYPES } from '../data/structures.js';

export class MapRenderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        
        // 地图配置
        this.zoom = 1.0;
        this.minZoom = 0.5;
        this.maxZoom = 2.0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // 拖拽状态
        this.isDragging = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // 选中的城池
        this.selectedCity = null;
        
        // 选中的军队
        this.selectedArmy = null;
        
        this.setupCanvas();
        this.setupEventListeners();
    }

    /**
     * 设置Canvas尺寸
     */
    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            
            // 居中地图
            const state = this.gameState.getState();
            const mapWidth = state.mapData.width * state.mapData.gridSize;
            const mapHeight = state.mapData.height * state.mapData.gridSize;
            
            this.offsetX = (this.canvas.width - mapWidth * this.zoom) / 2;
            this.offsetY = (this.canvas.height - mapHeight * this.zoom) / 2;
            
            this.render();
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 鼠标拖拽
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastX;
                const dy = e.clientY - this.lastY;
                
                this.offsetX += dx;
                this.offsetY += dy;
                
                this.lastX = e.clientX;
                this.lastY = e.clientY;
                
                this.render();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        // 鼠标点击
        this.canvas.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.handleClick(e);
            }
        });

        // 鼠标滚轮缩放
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom + delta));
            
            // 以鼠标位置为中心缩放
            const mouseX = e.clientX - this.canvas.offsetLeft;
            const mouseY = e.clientY - this.canvas.offsetTop;
            
            const scale = newZoom / this.zoom;
            this.offsetX = mouseX - (mouseX - this.offsetX) * scale;
            this.offsetY = mouseY - (mouseY - this.offsetY) * scale;
            
            this.zoom = newZoom;
            this.render();
        });
    }

    /**
     * 处理点击事件
     */
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const state = this.gameState.getState();
        const gridSize = state.mapData.gridSize * this.zoom;
        const playerFaction = this.gameState.getPlayerFaction();
        
        // 检查是否点击了城池（优先处理城池点击）
        let clickedCityId = null;
        for (const cityId in state.cities) {
            const city = state.cities[cityId];
            const cityX = this.offsetX + city.position.x * gridSize;
            const cityY = this.offsetY + city.position.y * gridSize;
            
            const distance = Math.sqrt(Math.pow(x - cityX, 2) + Math.pow(y - cityY, 2));
            
            if (distance < 10 * this.zoom) {
                clickedCityId = cityId;
                break;
            }
        }
        
        // 如果已选中军队，点击城市移动军队
        if (this.selectedArmy && clickedCityId) {
            const army = state.armies[this.selectedArmy];
            if (army && army.faction === playerFaction.id) {
                // 移动军队到目标城市
                const result = this.gameState.moveArmyToCity(this.selectedArmy, clickedCityId);
                if (result.success) {
                    const targetCity = state.cities[clickedCityId];
                    console.log(`军队开始向 ${targetCity.name} 移动`);
                    // 显示提示信息
                    if (result.path) {
                        const pathNames = result.path.map(id => state.cities[id].name).join(' → ');
                        alert(`军队将沿以下路径移动：\n${pathNames}`);
                    }
                } else {
                    alert(result.message);
                }
                
                this.selectedArmy = null;
                this.render();
                return;
            }
        }
        
        // 如果点击了城池，选中城池
        if (clickedCityId) {
            this.selectedCity = clickedCityId;
            this.selectedArmy = null;
            this.render();
            
            // 触发城池选中事件
            window.dispatchEvent(new CustomEvent('citySelected', { detail: { cityId: clickedCityId } }));
            return;
        }
        
        // 检查是否点击了军队
        if (state.armies) {
            for (const armyId in state.armies) {
                const army = state.armies[armyId];
                const armyX = this.offsetX + army.x * gridSize;
                const armyY = this.offsetY + army.y * gridSize;
                
                const distance = Math.sqrt(Math.pow(x - armyX, 2) + Math.pow(y - armyY, 2));
                
                if (distance < 8 * this.zoom) {
                    // 只能选择玩家的军队
                    if (army.faction === playerFaction.id) {
                        this.selectedArmy = armyId;
                        this.selectedCity = null;
                        this.render();
                        
                        // 触发军队选中事件
                        window.dispatchEvent(new CustomEvent('armySelected', { detail: { armyId } }));
                        return;
                    }
                }
            }
        }
        
        // 检查是否点击了城池
        for (const cityId in state.cities) {
            const city = state.cities[cityId];
            const cityX = this.offsetX + city.position.x * gridSize;
            const cityY = this.offsetY + city.position.y * gridSize;
            
            const distance = Math.sqrt(Math.pow(x - cityX, 2) + Math.pow(y - cityY, 2));
            
            if (distance < 10 * this.zoom) {
                this.selectedCity = cityId;
                this.selectedArmy = null;
                this.render();
                
                // 触发城池选中事件
                window.dispatchEvent(new CustomEvent('citySelected', { detail: { cityId } }));
                return;
            }
        }
        
        // 点击空白处取消选择
        this.selectedCity = null;
        this.selectedArmy = null;
        this.render();
        window.dispatchEvent(new CustomEvent('cityDeselected'));
    }

    /**
     * 缩放控制
     */
    zoomIn() {
        this.zoom = Math.min(this.maxZoom, this.zoom + 0.2);
        this.render();
    }

    zoomOut() {
        this.zoom = Math.max(this.minZoom, this.zoom - 0.2);
        this.render();
    }

    resetView() {
        this.zoom = 1.0;
        const state = this.gameState.getState();
        const mapWidth = state.mapData.width * state.mapData.gridSize;
        const mapHeight = state.mapData.height * state.mapData.gridSize;
        
        this.offsetX = (this.canvas.width - mapWidth) / 2;
        this.offsetY = (this.canvas.height - mapHeight) / 2;
        
        this.render();
    }

    /**
     * 渲染地图
     */
    render() {
        const state = this.gameState.getState();
        
        // 清空画布
        this.ctx.fillStyle = '#1a1510';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.renderGrid(state);
        
        // 绘制道路（在城池之前）
        this.renderRoads(state);
        
        // 绘制城池
        this.renderCities(state);
        
        // 绘制军队
        this.renderArmies(state);
        
        // 绘制势力边界（简化版）
        this.renderTerritories(state);
    }

    /**
     * 绘制网格
     */
    renderGrid(state) {
        const gridSize = state.mapData.gridSize * this.zoom;
        
        this.ctx.strokeStyle = 'rgba(139, 115, 85, 0.2)';
        this.ctx.lineWidth = 1;
        
        // 垂直线
        for (let x = 0; x <= state.mapData.width; x++) {
            const screenX = this.offsetX + x * gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, this.offsetY);
            this.ctx.lineTo(screenX, this.offsetY + state.mapData.height * gridSize);
            this.ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= state.mapData.height; y++) {
            const screenY = this.offsetY + y * gridSize;
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX, screenY);
            this.ctx.lineTo(this.offsetX + state.mapData.width * gridSize, screenY);
            this.ctx.stroke();
        }
    }

    /**
     * 绘制道路
     */
    renderRoads(state) {
        if (!state.roads) return;
        
        const gridSize = state.mapData.gridSize * this.zoom;
        
        for (const roadId in state.roads) {
            const road = state.roads[roadId];
            const fromCity = state.cities[road.from];
            const toCity = state.cities[road.to];
            
            if (!fromCity || !toCity) continue;
            
            const fromX = this.offsetX + fromCity.position.x * gridSize;
            const fromY = this.offsetY + fromCity.position.y * gridSize;
            const toX = this.offsetX + toCity.position.x * gridSize;
            const toY = this.offsetY + toCity.position.y * gridSize;
            
            // 根据道路等级设置样式
            let lineWidth = 2;
            let color = '#8b7355';
            let dashPattern = [];
            
            switch (road.level) {
                case 3: // 官道
                    lineWidth = 4 * this.zoom;
                    color = '#d4af37';
                    break;
                case 2: // 驿道
                    lineWidth = 3 * this.zoom;
                    color = '#b8956a';
                    break;
                case 1: // 小路
                default:
                    lineWidth = 2 * this.zoom;
                    color = '#8b7355';
                    dashPattern = [5, 5];
                    break;
            }
            
            // 绘制道路
            this.ctx.beginPath();
            this.ctx.moveTo(fromX, fromY);
            this.ctx.lineTo(toX, toY);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = lineWidth;
            this.ctx.setLineDash(dashPattern);
            this.ctx.globalAlpha = 0.6;
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.globalAlpha = 1.0;
        }
    }

    /**
     * 绘制城池
     */
    renderCities(state) {
        const gridSize = state.mapData.gridSize * this.zoom;
        
        for (const cityId in state.cities) {
            const city = state.cities[cityId];
            const x = this.offsetX + city.position.x * gridSize;
            const y = this.offsetY + city.position.y * gridSize;
            
            // 获取势力颜色
            let color = '#888888';
            if (city.owner && state.factions[city.owner]) {
                color = state.factions[city.owner].color;
            }
            
            // 绘制城池圆圈
            this.ctx.beginPath();
            this.ctx.arc(x, y, 8 * this.zoom, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#e8dcc4';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // 如果被选中，绘制高亮
            if (this.selectedCity === cityId) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, 12 * this.zoom, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#d4af37';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            }
            
            // 绘制城池名称
            this.ctx.fillStyle = '#e8dcc4';
            this.ctx.font = `${12 * this.zoom}px Microsoft YaHei`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(city.name, x, y - 15 * this.zoom);
        }
    }

    /**
     * 绘制军队
     */
    renderArmies(state) {
        if (!state.armies) return;
        
        const gridSize = state.mapData.gridSize * this.zoom;
        
        for (const armyId in state.armies) {
            const army = state.armies[armyId];
            const x = this.offsetX + army.x * gridSize;
            const y = this.offsetY + army.y * gridSize;
            
            // 获取势力颜色
            let color = '#888888';
            if (state.factions[army.faction]) {
                color = state.factions[army.faction].color;
            }
            
            // 绘制军队旗帜（三角形）
            this.ctx.beginPath();
            this.ctx.moveTo(x, y - 6 * this.zoom);
            this.ctx.lineTo(x - 5 * this.zoom, y + 4 * this.zoom);
            this.ctx.lineTo(x + 5 * this.zoom, y + 4 * this.zoom);
            this.ctx.closePath();
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#e8dcc4';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // 如果被选中，绘制高亮和闪烁效果
            if (this.selectedArmy === armyId) {
                // 外圈高亮
                this.ctx.beginPath();
                this.ctx.arc(x, y, 12 * this.zoom, 0, Math.PI * 2);
                this.ctx.strokeStyle = '#d4af37';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
                
                // 闪烁的光环
                const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 16 * this.zoom, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(212, 175, 55, ${pulse * 0.5})`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                // 顶部显示文字提示
                this.ctx.fillStyle = '#d4af37';
                this.ctx.font = `bold ${11 * this.zoom}px Microsoft YaHei`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText('点击目标位置移动', x, y - 25 * this.zoom);
            }
            
            // 绘制武将名字
            const general = state.generals[army.general];
            if (general) {
                this.ctx.fillStyle = '#e8dcc4';
                this.ctx.font = `${10 * this.zoom}px Microsoft YaHei`;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(general.name, x, y + 15 * this.zoom);
            }
            
            // 如果在移动，绘制路径
            if (army.mission === 'moving' && army.destination) {
                const destX = this.offsetX + army.destination.x * gridSize;
                const destY = this.offsetY + army.destination.y * gridSize;
                
                this.ctx.beginPath();
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(destX, destY);
                this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
    }

    /**
     * 绘制势力领土（简化版）
     */
    renderTerritories(state) {
        // 暂时不实现复杂的领土边界，只用城池颜色表示
        // 后续可以添加Voronoi图等算法绘制边界
    }
}
