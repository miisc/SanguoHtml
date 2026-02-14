/**
 * 军事系统数据结构和逻辑
 */

/**
 * 创建军队
 */
export function createArmy(id, faction, cityId, troops, generalId) {
    return {
        id,
        faction,
        general: generalId,
        troops: troops,
        morale: 80,
        x: 0, // 位置坐标，将在招募时设置
        y: 0,
        origin: cityId,
        destination: null,
        path: [],
        mission: 'idle' // idle, moving
    };
}

/**
 * 使用BFS查找城市之间通过道路网络的路径
 * @param {string} fromCityId - 起始城市ID
 * @param {string} toCityId - 目标城市ID
 * @param {Object} roads - 道路数据对象
 * @param {Object} cities - 城市数据对象
 * @returns {Array|null} - 城市ID路径数组，如果无法到达则返回null
 */
export function findRoadPath(fromCityId, toCityId, roads, cities) {
    if (fromCityId === toCityId) {
        return [fromCityId];
    }
    
    // 构建邻接表
    const adjacency = {};
    for (const roadId in roads) {
        const road = roads[roadId];
        if (!adjacency[road.from]) adjacency[road.from] = [];
        if (!adjacency[road.to]) adjacency[road.to] = [];
        adjacency[road.from].push(road.to);
        adjacency[road.to].push(road.from); // 道路是双向的
    }
    
    // BFS 查找路径
    const queue = [[fromCityId]];
    const visited = new Set([fromCityId]);
    
    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];
        
        if (current === toCityId) {
            return path;
        }
        
        if (adjacency[current]) {
            for (const neighbor of adjacency[current]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]);
                }
            }
        }
    }
    
    return null; // 无法到达
}

/**
 * 将城市路径转换为地图坐标路径（用于军队移动动画）
 * @param {Array} cityPath - 城市ID数组
 * @param {Object} cities - 城市数据对象
 * @returns {Array} - 坐标点数组
 */
export function convertCityPathToCoordinates(cityPath, cities) {
    const coordinatePath = [];
    
    for (let i = 0; i < cityPath.length; i++) {
        const city = cities[cityPath[i]];
        if (city) {
            coordinatePath.push({
                x: city.position.x,
                y: city.position.y,
                cityId: city.id
            });
        }
    }
    
    return coordinatePath;
}

/**
 * 计算两点间的简单路径（直线）- 已废弃，改用道路网络
 * @deprecated 使用 findRoadPath 和 convertCityPathToCoordinates 代替
 */
export function calculatePath(from, to) {
    const path = [];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    
    for (let i = 0; i <= steps; i++) {
        const t = steps === 0 ? 0 : i / steps;
        path.push({
            x: Math.round(from.x + dx * t),
            y: Math.round(from.y + dy * t)
        });
    }
    
    return path;
}

/**
 * 计算军队战斗力
 */
export function calculateArmyPower(army, general, cityDefense = 0) {
    const totalTroops = army.troops;
    
    // 基础战力
    let power = totalTroops * 10;
    
    // 将领加成
    if (general) {
        power += general.attributes.force * 5;
        power += general.attributes.command * 10;
    }
    
    // 士气影响
    power *= (army.morale / 100);
    
    // 防御方城防加成
    if (cityDefense > 0) {
        power += cityDefense * 100;
    }
    
    return Math.floor(power);
}

/**
 * 模拟战斗
 */
export function simulateBattle(attackerArmy, defenderArmy, attackerGeneral, defenderGeneral, cityDefense = 0) {
    const attackerPower = calculateArmyPower(attackerArmy, attackerGeneral);
    const defenderPower = calculateArmyPower(defenderArmy, defenderGeneral, cityDefense);
    
    // 计算伤亡率
    const totalPower = attackerPower + defenderPower;
    const attackerAdvantage = attackerPower / totalPower;
    const defenderAdvantage = defenderPower / totalPower;
    
    // 基础伤亡（相对于对方实力）
    const attackerCasualties = Math.floor(
        attackerArmy.troops * (0.1 + defenderAdvantage * 0.3)
    );
    
    const defenderCasualties = Math.floor(
        defenderArmy.troops * (0.1 + attackerAdvantage * 0.3)
    );
    
    // 判断胜负
    const winner = attackerPower > defenderPower * 1.2 ? 'attacker' : 
                   defenderPower > attackerPower * 1.2 ? 'defender' : 
                   'stalemate';
    
    return {
        winner,
        attackerPower,
        defenderPower,
        attackerCasualties,
        defenderCasualties,
        attackerMoraleChange: winner === 'attacker' ? 10 : winner === 'defender' ? -15 : -5,
        defenderMoraleChange: winner === 'defender' ? 10 : winner === 'attacker' ? -15 : -5
    };
}

/**
 * 检查军队是否到达目的地
 */
export function checkArrival(army) {
    if (!army.destination) return false;
    
    const dx = Math.abs(army.x - army.destination.x);
    const dy = Math.abs(army.y - army.destination.y);
    
    return dx <= 0.5 && dy <= 0.5;
}

/**
 * 更新军队位置（沿路径移动）
 */
export function updateArmyPosition(army, deltaTime) {
    if (army.mission !== 'moving' || !army.path || army.path.length === 0) {
        return false;
    }
    
    // 移动到路径中的下一个点
    const nextPoint = army.path[0];
    army.x = nextPoint.x;
    army.y = nextPoint.y;
    army.path.shift();
    
    // 如果到达终点
    if (army.path.length === 0) {
        army.mission = 'idle';
        return true; // 返回true表示到达
    }
    
    return false;
}
