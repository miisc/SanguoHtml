/**
 * 游戏核心数据结构定义
 * 基于需求文档中的数据结构规范
 */

/**
 * 创建城池数据
 */
export function createCity(id, name, x, y, owner = null) {
    return {
        id,
        name,
        position: { x, y, z: 0 },
        screenPosition: { x: 0, y: 0 },
        population: 50000,
        garrison: 1000,
        walls: 5,
        owner,
        governor: null, // 太守
        buildings: [], // 建筑列表
        development: 3,
        terrainType: "plain",
        resources: {
            gold: 500, // 原100，提升初始金钱
            food: 800, // 原200，提升初始粮食
            wood: 300  // 原50，提升初始木材
        },
        production: {
            goldPerTurn: 50,
            foodPerTurn: 100,
            woodPerTurn: 20
        }
    };
}

/**
 * 创建武将数据
 */
export function createGeneral(id, name, faction) {
    return {
        id,
        name,
        courtesyName: "",
        faction,
        loyalty: 100,
        attributes: {
            force: 50,
            intelligence: 50,
            command: 50,
            charm: 50,
            politics: 50,
            administration: 50
        },
        personality: {
            type: "neutral",
            traits: [],
            preferences: {
                military: 0.5,
                economic: 0.5,
                diplomatic: 0.5,
                internal: 0.5
            }
        },
        relationships: {},
        titles: {
            position: "",
            rank: "",
            nobility: "",
            honors: [],
            salary: 0
        },
        skills: [],
        location: null,
        position: "none",
        courtRole: "none",
        courtInfluence: 50
    };
}

/**
 * 创建势力数据
 */
export function createFaction(id, name, color, ruler) {
    return {
        id,
        name,
        ruler,
        color,
        cities: [],
        generals: [ruler],
        resources: {
            gold: 5000, // 原2000，提升初始金钱
            food: 4000, // 原1500，提升初始粮食
            wood: 1500  // 原500，提升初始木材
        },
        relations: {},
        isPlayer: false
    };
}

/**
 * 创建游戏状态
 */
export function createGameState() {
    return {
        currentYear: 189,
        currentSeason: "春季",
        currentTurn: 1,
        playerFaction: null,
        factions: {},
        cities: {},
        generals: {},
        mapData: {
            width: 50,
            height: 40,
            gridSize: 20
        },
        mapView: {
            zoom: 1.0,
            centerX: 0,
            centerY: 0,
            offsetX: 0,
            offsetY: 0
        }
    };
}

/**
 * 创建道路数据
 */
export function createRoad(id, fromCityId, toCityId, level = 1) {
    return {
        id,
        from: fromCityId,
        to: toCityId,
        level, // 道路等级：1=小路, 2=驿道, 3=官道
        condition: 100, // 道路状况 0-100
        buildProgress: 0, // 建造进度（如果正在建造）
        underConstruction: false
    };
}

/**
 * 季节定义
 */
export const SEASONS = ["春季", "夏季", "秋季", "冬季"];

/**
 * 地形类型定义
 */
export const TERRAIN_TYPES = {
    plain: { name: "平原", color: "#8b9456", moveSpeed: 1.0 },
    mountain: { name: "山地", color: "#6b5544", moveSpeed: 0.5 },
    river: { name: "河流", color: "#4682b4", moveSpeed: 0.3 },
    forest: { name: "森林", color: "#3d5e3d", moveSpeed: 0.7 }
};

/**
 * 初始武将数据（精简版）
 */
export const INITIAL_GENERALS = [
    {
        id: "liubei",
        name: "刘备",
        courtesyName: "玄德",
        faction: "shu",
        attributes: { force: 75, intelligence: 70, command: 80, charm: 90, politics: 65, administration: 75 }
    },
    {
        id: "guanyu",
        name: "关羽",
        courtesyName: "云长",
        faction: "shu",
        attributes: { force: 95, intelligence: 70, command: 85, charm: 80, politics: 50, administration: 60 }
    },
    {
        id: "zhangfei",
        name: "张飞",
        courtesyName: "翼德",
        faction: "shu",
        attributes: { force: 98, intelligence: 40, command: 80, charm: 70, politics: 30, administration: 40 }
    },
    {
        id: "caocao",
        name: "曹操",
        courtesyName: "孟德",
        faction: "wei",
        attributes: { force: 72, intelligence: 95, command: 92, charm: 85, politics: 90, administration: 88 }
    },
    {
        id: "sunquan",
        name: "孙权",
        courtesyName: "仲谋",
        faction: "wu",
        attributes: { force: 68, intelligence: 85, command: 82, charm: 88, politics: 83, administration: 80 }
    }
];

/**
 * 初始城池数据（精简版）
 */
export const INITIAL_CITIES = [
    { id: "chengdu", name: "成都", x: 10, y: 25, owner: "shu" },
    { id: "luoyang", name: "洛阳", x: 30, y: 15, owner: "wei" },
    { id: "xuchang", name: "许昌", x: 32, y: 20, owner: "wei" },
    { id: "jianye", name: "建业", x: 40, y: 30, owner: "wu" },
    { id: "changsha", name: "长沙", x: 30, y: 32, owner: null },
    { id: "xiangyang", name: "襄阳", x: 25, y: 23, owner: null },
    { id: "hanzhong", name: "汉中", x: 15, y: 18, owner: null },
    { id: "jiangling", name: "江陵", x: 28, y: 28, owner: null }
];

/**
 * 初始道路数据
 */
export const INITIAL_ROADS = [
    { id: "road1", from: "chengdu", to: "hanzhong", level: 2 }, // 蜀国通道
    { id: "road2", from: "hanzhong", to: "xiangyang", level: 2 }, // 中部通道
    { id: "road3", from: "luoyang", to: "xuchang", level: 3 }, // 魏国官道
    { id: "road4", from: "xuchang", to: "xiangyang", level: 2 }, // 南下通道
    { id: "road5", from: "xiangyang", to: "jiangling", level: 2 }, // 荆州通道
    { id: "road6", from: "jiangling", to: "changsha", level: 2 }, // 南方通道
    { id: "road7", from: "changsha", to: "jianye", level: 2 }, // 吴国通道
    { id: "road8", from: "jiangling", to: "jianye", level: 2 } // 东部通道
];

/**
 * 势力配置
 */
export const FACTION_CONFIG = {
    shu: { name: "蜀", color: "#4169E1", ruler: "liubei" },
    wei: { name: "魏", color: "#DC143C", ruler: "caocao" },
    wu: { name: "吴", color: "#32CD32", ruler: "sunquan" }
};
