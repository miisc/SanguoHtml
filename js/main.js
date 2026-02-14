/**
 * 三国志策略游戏 - 主入口文件
 * Phase 1: 基础框架与简化地图
 */

import { gameState } from './data/gameState.js';
import { MapRenderer } from './render/mapRenderer.js';
import { UIManager } from './ui/uiManager.js';

class Game {
    constructor() {
        this.gameState = gameState;
        this.mapRenderer = null;
        this.uiManager = null;
        this.isRunning = false;
        this.lastFrameTime = Date.now();
    }

    /**
     * 初始化游戏
     */
    async init() {
        console.log('=== 三国志策略游戏启动 ===');
        
        // 显示加载界面
        document.getElementById('loading').classList.remove('hidden');
        
        try {
            // 初始化游戏状态
            this.gameState.initialize('shu');
            
            // 初始化UI管理器
            this.uiManager = new UIManager(this.gameState);
            
            // 暴露到 window 以便 HTML 中调用
            window.uiManager = this.uiManager;
            
            // 初始化地图渲染器
            const canvas = document.getElementById('game-map');
            this.mapRenderer = new MapRenderer(canvas, this.gameState);
            
            // 设置地图控制按钮
            this.setupMapControls();
            
            // 首次渲染
            this.mapRenderer.render();
            
            // 启动游戏循环
            this.start();
            
            // 隐藏加载界面
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
                console.log('游戏初始化完成');
            }, 500);
            
        } catch (error) {
            console.error('游戏初始化失败:', error);
            alert('游戏初始化失败，请刷新页面重试');
        }
    }

    /**
     * 设置地图控制按钮
     */
    setupMapControls() {
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.mapRenderer.zoomIn();
        });

        document.getElementById('zoom-out').addEventListener('click', () => {
            this.mapRenderer.zoomOut();
        });

        document.getElementById('reset-view').addEventListener('click', () => {
            this.mapRenderer.resetView();
        });
    }
    
    /**
     * 启动游戏循环
     */
    start() {
        this.isRunning = true;
        this.lastFrameTime = Date.now();
        this.gameLoop();
    }
    
    /**
     * 停止游戏循环
     */
    stop() {
        this.isRunning = false;
    }
    
    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // 更新游戏状态
        this.gameState.update(deltaTime);
        
        // 渲染地图（用于动画效果）
        this.mapRenderer.render();
        
        // 请求下一帧
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 当DOM加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});

// 全局错误处理
window.addEventListener('error', (e) => {
    console.error('发生错误:', e.error);
});
