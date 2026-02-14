# 📋 更新日志 (CHANGELOG)

记录项目的重要更新和版本变化

---

## [0.4.0] - 2026-02-14 ⭐ 最新

### 新增功能
- ✨ **朝会系统** - 完整的朝廷会议和政务处理系统
- ✨ **8种事件类型** - 经济报告、大臣建言、政策建议、人事推荐、灾害报告、宝物献上等
- ✨ **自动触发机制** - 每30天自动召开朝会
- ✨ **手动触发** - 通过"朝会"按钮随时召开
- ✨ **事件优先级** - 紧急/重要/一般/普通四级分类
- ✨ **交互式决策** - 玩家选择影响游戏状态

### 事件类型详解
- 📊 **经济报告** - 每次必出现，展示国库和资源状况
- 💬 **大臣建言** - 随机给出减税、军备、农业等建议
- 📜 **政策建议** - 轻徭薄赋、屯田等长期政策
- 👥 **人事推荐** - 为空缺城池推荐太守人选
- ⚠️ **灾害报告** - 洪涝、旱灾、蝗灾等自然灾害（20%概率）
- 🎁 **宝物献上** - 获得七星刀、玉玺等宝物（10%概率）

### 技术实现
- 新增 `js/data/courtMeeting.js` - 朝会系统核心逻辑
- 新增 `CourtMeetingSystem` 类 - 事件生成和管理
- 新增 `createCourtEvent()` 函数 - 事件创建
- 扩展 `GameStateManager` - 集成朝会系统
  - `getPlayerCities()` - 获取玩家城池
  - `getPlayerGenerals()` - 获取玩家武将
  - `triggerCourtMeeting()` - 触发朝会
  - `handleCourtEventChoice()` - 处理决策
- 扩展 `UIManager` - 朝会界面
  - `showCourtMeeting()` - 显示朝会面板
  - `renderCourtEvents()` - 渲染事件
  - `handleCourtEventChoice()` - 处理玩家选择
- 新增朝会样式 - 金色主题、渐变按钮、动画效果
- 新增"朝会"按钮 - 底部控制栏特殊金色按钮

### UI/UX改进
- 🎨 朝会面板古典中国风设计
- ✨ 事件卡片淡入动画
- 🔘 选项按钮悬浮效果
- 🌟 朝会按钮金色渐变发光效果
- 📱 事件优先级彩色标识

### 文档更新
- 📚 新增 [COURT_MEETING_SYSTEM.md](../features/COURT_MEETING_SYSTEM.md) - 朝会系统完整文档
- 📝 更新 [README.md](../../README.md) - 添加朝会系统介绍

### 游戏平衡
- ⚖️ 大臣建议消耗资源合理化
- ⚖️ 灾害影响调整为合理范围
- ⚖️ 宝物价值平衡设定
- ⚖️ 政策效果长期影响明确

---

## [0.3.5] - 2026-02-14

### 新增功能
- ✨ **军队道路移动系统** - 军队只能沿道路移动并驻扎在城市
- ✨ **道路网络路径查找** - 使用BFS算法自动寻找最短路径
- ✨ **移动路径提示** - 显示军队将经过的城市列表

### 技术实现
- 新增 `findRoadPath()` 函数 - 道路网络路径查找
- 新增 `convertCityPathToCoordinates()` 函数 - 路径坐标转换
- 新增 `moveArmyToCity()` 方法 - 城市间军队移动
- 修改 `handleClick()` - 限制只能点击城市作为目标
- 修改 `updateArmies()` - 到达后更新驻扎位置

### 文档更新
- 📚 新增 [ARMY_ROAD_MOVEMENT.md](../features/ARMY_ROAD_MOVEMENT.md) - 军队道路移动系统说明
- 📚 新增 [DOCS_INDEX.md](../../DOCS_INDEX.md) - 文档索引
- 📚 新增 [PROJECT_STRUCTURE.md](../../PROJECT_STRUCTURE.md) - 项目结构
- 📚 新增 [DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md) - 开发状态总览
- 📝 更新 [DEVLOG.md](DEVLOG.md) - 添加最新开发记录
- 📝 更新 [README.md](../../README.md) - 更新项目状态和文档链接

### 战略影响
- 🎯 道路控制成为重要战略要素
- 🎯 关键城市（如襄阳、江陵）战略价值提升
- 🎯 军队机动性受道路网络限制

---

## [0.3.2] - 2026-02-14

### 新增功能
- ✨ 军队移动系统 - 点击选择军队，点击地图移动
- ✨ 攻城战系统 - 自动触发攻城，战力计算
- ✨ 野战系统 - 军队相遇自动战斗
- ✨ 军队详情面板 - 显示军队信息和操作

### 技术实现
- 新增 `selectedArmy` 军队选择
- 新增 `checkBattle()` 战斗触发
- 新增 `siegeCity()` 攻城逻辑
- 新增 `fieldBattle()` 野战逻辑
- 新增 `showArmyInfo()` 军队详情面板

### 文档更新
- 📚 新增 [PHASE3.5_UPDATE.md](../phases/PHASE3.5_UPDATE.md)
- 📚 新增 [COMBAT_SYSTEM_TEST_REPORT.md](../tests/COMBAT_SYSTEM_TEST_REPORT.md)
- 🧪 创建 test_combat.html 自动化测试

---

## [0.3.0] - 2024

### 新增功能
- ✨ 军队招募系统
- ✨ 军队实时移动计算
- ✨ 战斗力计算系统
- ✨ 战斗模拟系统
- ✨ AI自主发展系统

### 技术实现
- 新增 js/data/military.js - 军事系统
- 新增 js/ai/aiSystem.js - AI系统
- 修改 gameState.js - 添加军队管理
- 修改 mapRenderer.js - 渲染军队图标

### 文档更新
- 📚 新增 [PHASE3_SUMMARY.md](../phases/PHASE3_SUMMARY.md)
- 📚 新增 [PHASE3_TEST_REPORT.md](../tests/PHASE3_TEST_REPORT.md)

---

## [0.2.0] - 2024

### 新增功能
- ✨ 城池建筑系统（6种建筑）
- ✨ 建筑等级系统（1-10级）
- ✨ 武将任命系统（太守）
- ✨ 资源系统（金钱、粮食、木材）
- ✨ 建造进度跟踪

### 技术实现
- 新增 js/data/buildings.js - 建筑系统
- 修改 gameState.js - 建筑建造逻辑
- 修改 uiManager.js - 建筑UI界面

### 文档更新
- 📚 新增 [PHASE2_UPDATE.md](../phases/PHASE2_UPDATE.md)

---

## [0.1.0] - 2024

### 新增功能
- ✨ 项目基础架构
- ✨ 核心数据结构
- ✨ 2D地图渲染系统
- ✨ 地图交互（拖动、缩放、点击）
- ✨ 实时系统（时间流逝、速度控制）
- ✨ 基础UI框架
- ✨ 保存/加载功能

### 技术实现
- 创建项目结构
- 实现 js/main.js - 游戏主循环
- 实现 js/data/structures.js - 数据结构
- 实现 js/data/gameState.js - 状态管理
- 实现 js/render/mapRenderer.js - 地图渲染
- 实现 js/ui/uiManager.js - UI管理
- 实现 css/style.css - 样式系统

### 文档更新
- 📚 创建 [README.md](../../README.md)
- 📚 创建 [需求文档.md](../design/需求文档.md)
- 📚 创建 [DEVLOG.md](DEVLOG.md)
- 📚 创建 [REALTIME_UPDATE.md](../features/REALTIME_UPDATE.md)
- 📚 创建 [ROAD_SYSTEM.md](../features/ROAD_SYSTEM.md)

---

## 版本号说明

格式：`主版本.次版本.修订版`

- **主版本** (0.x.x): 完成一个完整阶段（如阶段1→阶段2）
- **次版本** (x.X.x): 增加重要功能或系统
- **修订版** (x.x.X): 小功能改进、bug修复

### 当前版本
**v0.3.5** - 军队道路移动系统

### 开发路线图
- v0.3.x - 阶段3完善（军事系统）
- v0.4.0 - 阶段4（朝会与内政）
- v0.5.0 - 阶段5（装备与商业）
- v0.6.0 - 阶段6（视觉升级）
- v1.0.0 - 正式版本

---

## 图例说明

- ✨ 新增功能
- 🔧 功能改进
- 🐛 Bug修复
- 📚 文档更新
- 🧪 测试相关
- 🎨 样式更新
- ⚡ 性能优化
- 🔒 安全更新
- ⭐ 重要更新
- 🎯 战略影响

---

**相关文档**:
- 📚 [文档索引](../../DOCS_INDEX.md)
- 🎯 [开发状态](DEVELOPMENT_STATUS.md)
- 📝 [开发日志](DEVLOG.md)
- 🏠 [回到主页](../../README.md)

---

**最后更新**: 2026-02-14
