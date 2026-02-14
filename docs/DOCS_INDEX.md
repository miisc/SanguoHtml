# 📚 项目文档索引

> 🏠 **[返回主页](README.md)** | 📂 **[项目结构](PROJECT_STRUCTURE.md)** | 🎯 **[开发状态](DEVELOPMENT_STATUS.md)** ⭐
> 📁 **文档已重新组织**: 所有文档现已按类型归类到 `docs/` 目录下，详见 [docs/README.md](docs/README.md)
## 快速导航

### 🎮 核心文档
- **[README.md](README.md)** - 项目概述、快速开始、功能说明
- **[DEVELOPMENT_STATUS.md](docs/development/DEVELOPMENT_STATUS.md)** - 开发状态总览 ⭐ 推荐
- **[CHANGELOG.md](docs/development/CHANGELOG.md)** - 更新日志与版本历史 ⭐ 最新
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - 项目目录结构
- **[需求文档.md](docs/design/需求文档.md)** - 完整的游戏需求规格说明（1591行）

### 📝 开发日志
- **[DEVLOG.md](docs/development/DEVLOG.md)** - 完整开发历史记录
  - 2026-02-14: 军队道路移动系统实现
  - 2026-02-14: 实时系统改造完成
  - 阶段1完成记录

### 🚀 阶段更新文档
- **[PHASE2_UPDATE.md](docs/phases/PHASE2_UPDATE.md)** - 阶段2：核心系统与游戏机制
  - 城池建筑系统（6种建筑）
  - 武将任命系统
  - 资源系统完善
  - UI界面增强

- **[PHASE3_SUMMARY.md](docs/phases/PHASE3_SUMMARY.md)** - 阶段3：军事系统与AI
  - 军队招募系统
  - AI自主发展
  - 战斗系统框架

- **[PHASE3.5_UPDATE.md](docs/phases/PHASE3.5_UPDATE.md)** - 阶段3.5：军队移动与战斗
  - 军队移动系统
  - 攻城战系统
  - 野战系统
  - UI增强

### 🔧 功能系统文档
- **[ROAD_SYSTEM.md](docs/features/ROAD_SYSTEM.md)** - 道路系统功能说明
  - 道路数据结构
  - 道路等级系统
  - 初始道路网络
  - 视觉效果

- **[ARMY_ROAD_MOVEMENT.md](docs/features/ARMY_ROAD_MOVEMENT.md)** - 军队道路移动系统 ⭐ 最新
  - 道路移动限制
  - 路径查找算法（BFS）
  - 战略影响分析
  - 使用指南

- **[REALTIME_UPDATE.md](docs/features/REALTIME_UPDATE.md)** - 实时系统更新说明
  - 从回合制到实时制的改造
  - 时间流逝机制
  - 速度控制

### 🧪 测试报告
- **[PHASE3_TEST_REPORT.md](docs/tests/PHASE3_TEST_REPORT.md)** - 阶段3功能测试报告
- **[COMBAT_SYSTEM_TEST_REPORT.md](docs/tests/COMBAT_SYSTEM_TEST_REPORT.md)** - 战斗系统测试
- **[INTEGRITY_CHECK_REPORT.md](docs/tests/INTEGRITY_CHECK_REPORT.md)** - 完整性检查

### 🛠️ 开发工具
- **[GIT_PUSH_GUIDE.md](docs/guides/GIT_PUSH_GUIDE.md)** - Git提交和推送指南

---

## 📂 文档分类

### 按用途分类

#### 面向用户
- README.md - 给玩家和开发者的快速入门
- 需求文档.md - 了解游戏完整设计

#### 面向开发者
- DEVLOG.md - 完整开发历史
- PHASE*_UPDATE.md - 各阶段详细开发记录
- 功能系统文档 - 具体功能实现说明
- 测试报告 - 质量保证

#### 工具文档
- GIT_PUSH_GUIDE.md - 版本控制指南

### 按时间顺序
1. 需求文档.md - 项目启动前
2. DEVLOG.md - 阶段1完成（2026-02-14）
3. REALTIME_UPDATE.md - 实时系统改造（2026-02-14）
4. PHASE2_UPDATE.md - 阶段2完成
5. PHASE3_SUMMARY.md - 阶段3完成
6. PHASE3_TEST_REPORT.md - 阶段3测试
7. COMBAT_SYSTEM_TEST_REPORT.md - 战斗系统测试
8. PHASE3.5_UPDATE.md - 阶段3.5完成
9. ROAD_SYSTEM.md - 道路系统说明
10. **ARMY_ROAD_MOVEMENT.md - 军队道路移动（2026-02-14）** ⭐ 最新

---

## 📊 项目状态概览

> 🎯 **[查看完整开发状态](DEVELOPMENT_STATUS.md)** - 详细的功能清单、进度图表、版本历史

### 当前阶段
**阶段3.5+** - 军事系统完善（军队道路移动）

### 整体完成度
**约50%** - 基础框架和核心系统已完成

### 最新更新 (2026-02-14)
- ⭐ 军队道路移动系统
- ⭐ 道路网络路径查找（BFS算法）
- ⭐ 军队只能驻扎城市

### 完成情况速览
```
阶段1 ████████████████████ 100% (基础框架)
阶段2 ████████████████████ 100% (核心系统)
阶段3 █████████████████░░░  85% (军事与AI)
阶段4 ░░░░░░░░░░░░░░░░░░░░   0% (朝会内政)
阶段5 ░░░░░░░░░░░░░░░░░░░░   0% (装备商业)
阶段6 ░░░░░░░░░░░░░░░░░░░░   0% (视觉升级)
```

### 已完成核心功能
- ✅ 实时游戏系统（时间流逝、速度控制）
- ✅ 城池建筑系统（6种建筑）
- ✅ 武将任命系统
- ✅ 军队招募、移动、战斗
- ✅ 道路网络系统
- ✅ AI自主发展

### 待完成功能
- ❌ 朝会系统
- ❌ 官职爵位系统
- ❌ 科技研究系统
- ❌ 外交系统
- ❌ 装备系统
- ❌ 商业贸易系统
- ❌ 事件库系统
- ❌ 伪3D墨色山水风格

---

## 🔍 如何查找文档

### 🎮 想了解游戏玩法？
→ 阅读 **[README.md](README.md)** - 快速上手指南

### 🎯 想了解项目进展？
→ 阅读 **[DEVELOPMENT_STATUS.md](docs/development/DEVELOPMENT_STATUS.md)** - 详细的开发状态 ⭐ 推荐

### 📜 想了解完整设计？
→ 阅读 **[需求文档.md](docs/design/需求文档.md)** - 1591行完整规格说明

### 📅 想了解开发历程？
→ 阅读 **[DEVLOG.md](docs/development/DEVLOG.md)** 和 **PHASE*_UPDATE.md**

### 🔧 想了解特定功能？
→ 阅读对应的功能系统文档：
  - 道路系统 → [ROAD_SYSTEM.md](docs/features/ROAD_SYSTEM.md)
  - 军队移动 → [ARMY_ROAD_MOVEMENT.md](docs/features/ARMY_ROAD_MOVEMENT.md) ⭐ 最新
  - 实时系统 → [REALTIME_UPDATE.md](docs/features/REALTIME_UPDATE.md)

### 🧪 想了解测试情况？
→ 阅读 **测试报告** 部分的文档

### 🛠️ 想参与开发？
→ 建议阅读顺序：
  1. [README.md](README.md) - 项目概述
  2. [DEVELOPMENT_STATUS.md](docs/development/DEVELOPMENT_STATUS.md) - 当前状态
  3. [DEVLOG.md](docs/development/DEVLOG.md) - 开发历史
  4. [需求文档.md](docs/design/需求文档.md) - 完整设计
  5. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 代码结构

---

## 📝 文档编写规范

### 文件命名
- 概述性文档：`README.md`, `DEVLOG.md`
- 阶段文档：`PHASE{N}_*.md`
- 功能文档：`{FEATURE_NAME}.md`（大写下划线分隔）
- 测试文档：`*_TEST_REPORT.md`
- 指南文档：`*_GUIDE.md`

### 文档结构
1. 标题和日期
2. 功能概述
3. 详细说明
4. 代码示例（如适用）
5. 测试结果（如适用）
6. 后续计划

### Markdown格式
- 使用emoji增强可读性 ✨
- 使用表格展示数据 📊
- 使用代码块展示代码
- 使用列表展示步骤
- 使用引用块突出重要信息

---

**最后更新：2026-02-14**
