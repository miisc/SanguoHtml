# 项目目录结构

```
Sanguo_html/
│
├── 📋 文档文件 (Documentation)
│   ├── README.md                          # 项目主文档
│   ├── DOCS_INDEX.md                      # 文档索引 ⭐
│   ├── PROJECT_STRUCTURE.md               # 本文件
│   │
│   └── 📁 docs/                           # 文档目录
│       ├── 📁 design/                     # 设计文档
│       │   └── 需求文档.md                # 完整需求规格（1591行）
│       │
│       ├── 📁 development/                # 开发文档
│       │   ├── DEVLOG.md                  # 完整开发日志
│       │   ├── CHANGELOG.md               # 版本更新日志
│       │   └── DEVELOPMENT_STATUS.md      # 开发状态总览
│       │
│       ├── 📁 phases/                     # 阶段文档
│       │   ├── PHASE2_UPDATE.md           # 阶段2记录
│       │   ├── PHASE3_SUMMARY.md          # 阶段3总结
│       │   └── PHASE3.5_UPDATE.md         # 阶段3.5更新
│       │
│       ├── 📁 features/                   # 功能文档
│       │   ├── REALTIME_UPDATE.md         # 实时系统
│       │   ├── ROAD_SYSTEM.md             # 道路系统
│       │   └── ARMY_ROAD_MOVEMENT.md      # 军队移动 ⭐
│       │
│       ├── 📁 tests/                      # 测试报告
│       │   ├── PHASE3_TEST_REPORT.md      # 阶段3测试
│       │   ├── COMBAT_SYSTEM_TEST_REPORT.md
│       │   └── INTEGRITY_CHECK_REPORT.md
│       │
│       └── 📁 guides/                     # 工具指南
│           └── GIT_PUSH_GUIDE.md          # Git使用
│
├── 🎮 游戏文件 (Game Files)
│   ├── index.html                         # 主HTML文件
│   ├── test.html                          # 测试页面
│   └── test_combat.html                   # 战斗测试页面
│
├── 🎨 样式文件 (Styles)
│   └── css/
│       └── style.css                      # 主样式文件
│
├── 💻 JavaScript代码 (Source Code)
│   └── js/
│       ├── main.js                        # 游戏主入口
│       │
│       ├── 📁 data/ (数据层)
│       │   ├── gameState.js               # 游戏状态管理⭐
│       │   ├── structures.js              # 数据结构定义
│       │   ├── buildings.js               # 建筑系统
│       │   └── military.js                # 军事系统⭐
│       │
│       ├── 📁 render/ (渲染层)
│       │   └── mapRenderer.js             # 地图渲染器⭐
│       │
│       ├── 📁 ui/ (UI层)
│       │   └── uiManager.js               # UI管理器
│       │
│       └── 📁 ai/ (AI层)
│           └── aiSystem.js                # AI系统
│
└── ⚙️ 配置文件 (Configuration)
    ├── .git/                              # Git版本控制
    ├── .gitignore                         # Git忽略配置
    └── Sanguo_html.code-workspace         # VS Code工作区

```

## 📊 文件统计

### 代码文件
| 类型 | 文件数 | 代码行数（估算） |
|------|--------|------------------|
| HTML | 3 | ~400 |
| CSS | 1 | ~450 |
| JavaScript | 7 | ~2500 |
| **总计** | **11** | **~3350** |

### 文档文件
| 类型 | 文件数 | 总行数（估算） |
|------|--------|----------------|
| 主文档 | 3 | ~500 |
| 设计文档 | 1 | ~1600 |
| 开发文档 | 3 | ~2000 |
| 阶段文档 | 3 | ~600 |
| 功能文档 | 3 | ~600 |
| 测试报告 | 3 | ~500 |
| 工具文档 | 1 | ~100 |
| **总计** | **17** | **~5900** |

## 🗂️ 目录说明
```
docs/
├── design/          # 需求文档、设计规格
├── development/     # 开发日志、版本历史、状态跟踪
├── phases/          # 各开发阶段的详细记录
├── features/        # 具体功能的实现说明
├── tests/           # 测试报告和质量保证
└── guides/          # 开发工具和流程指南
```

**保留在根目录的文档**:
- `README.md` - 项目入口，必须在根目录
- `DOCS_INDEX.md` - 文档导航，方便快速查找
- `PROJECT_STRUCTURE.md` - 项目结构说明，本文件织
4. **测试文档**：质量保证记录
5. **工具文档**：开发辅助文档

### 代码组织原则
1. **数据层**：游戏逻辑和数据管理
2. **渲染层**：视觉呈现
3. **UI层**：用户交互重组文档结构 - 创建 `docs/` 目录
- ⭐ 2026-02-14: 
4. **AI层**：电脑对手

### 命名规范
- **文档**：大写字母+下划线（`README.md`, `PHASE2_UPDATE.md`）
- **代码**：驼峰命名（`gameState.js`, `mapRenderer.js`）
- **目录**：小写字母（`js/`, `css/`, `data/`）

## 🔄 最近更新
- ⭐ 2026-02-14: 新增 `DOCS_INDEX.md` - 文档索引
- ⭐ 2026-02-14: 新增 `ARMY_ROAD_MOVEMENT.md` - 军队道路移动系统
- ⭐ 2026-02-14: 更新 `gameState.js` - 军队移动到城市
- ⭐ 2026-02-14: 更新 `military.js` - 道路路径查找
- ⭐ 2026-02-14: 更新 `mapRenderer.js` - 地图点击处理

## 📝 文件关系图

```
README.md (入口)
    ↓
    ├─→ DOCS_INDEX.md (文档导航)
    │       ↓
    │       ├─→ 需求文档.md (设计规格)
    │       ├─→ DEVLOG.md (开发历史)
    │       ├─→ PHASE*.md (阶段记录)
    │       └─→ 功能文档 (具体实现)
    │
    └─→ index.html (游戏入口)
            ↓
            ├─→ css/style.css
            └─→ js/main.js
                    ↓
                    ├─→ data/ (数据层)
                    ├─→ render/ (渲染层)
                    ├─→ ui/ (UI层)
                    └─→ ai/ (AI层)
```

---

**最后更新：2026-02-14**
