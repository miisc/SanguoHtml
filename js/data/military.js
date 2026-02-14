/**
 * 军事系统数据结构和逻辑
 */

/**
 * 创建军队
 */
export function createArmy(id, name, commander, faction, origin) {
    return {
        id,
        name,
        commander, // 统帅武将ID
        faction,
        origin, // 出发城池ID
        destination: null, // 目标城池ID
        currentPosition: null, // 当前位置坐标 {x, y}
        path: [], // 移动路径
        troops: {
            infantry: 0,
            cavalry: 0,
            archers: 0
        },
        status: {
            moving: false,
            speed: 1.0, // 移动速度（格/天）
            morale: 80,
            supplies: 30, // 军粮剩余天数
            experience: 0
        },
        mission: 'idle' // idle, moving, attacking, defending
    };
}

/**
 * 计算两点间的简单路径（直线）
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
    const totalTroops = army.troops.infantry + army.troops.cavalry + army.troops.archers;
    
    // 基础战力
    let power = totalTroops * 10;
    
    // 将领加成
    if (general) {
        power += general.attributes.force * 5;
        power += general.attributes.command * 10;
    }
    
    // 士气影响
    power *= (army.status.morale / 100);
    
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
        (attackerArmy.troops.infantry + attackerArmy.troops.cavalry + attackerArmy.troops.archers) * 
        (0.1 + defenderAdvantage * 0.3)
    );
    
    const defenderCasualties = Math.floor(
        (defenderArmy.troops.infantry + defenderArmy.troops.cavalry + defenderArmy.troops.archers) * 
        (0.1 + attackerAdvantage * 0.3)
    );
    
    // 应用伤亡
    const attackerLosses = distributeCasualties(attackerArmy.troops, attackerCasualties);
    const defenderLosses = distributeCasualties(defenderArmy.troops, defenderCasualties);
    
    // 判断胜负
    const winner = attackerPower > defenderPower * 1.2 ? 'attacker' : 
                   defenderPower > attackerPower * 1.2 ? 'defender' : 
                   'stalemate';
    
    return {
        winner,
        attackerPower,
        defenderPower,
        attackerLosses,
        defenderLosses,
        attackerMoraleChange: winner === 'attacker' ? 10 : winner === 'defender' ? -15 : -5,
        defenderMoraleChange: winner === 'defender' ? 10 : winner === 'attacker' ? -15 : -5
    };
}

/**
 * 分配伤亡到不同兵种
 */
function distributeCasualties(troops, totalCasualties) {
    const total = troops.infantry + troops.cavalry + troops.archers;
    if (total === 0) return { infantry: 0, cavalry: 0, archers: 0 };
    
    return {
        infantry: Math.min(troops.infantry, Math.floor(totalCasualties * troops.infantry / total)),
        cavalry: Math.min(troops.cavalry, Math.floor(totalCasualties * troops.cavalry / total)),
        archers: Math.min(troops.archers, Math.floor(totalCasualties * troops.archers / total))
    };
}

/**
 * 检查军队是否到达目的地
 */
export function checkArrival(army, targetCity) {
    if (!army.currentPosition || !targetCity) return false;
    
    const dx = Math.abs(army.currentPosition.x - targetCity.position.x);
    const dy = Math.abs(army.currentPosition.y - targetCity.position.y);
    
    return dx <= 0.5 && dy <= 0.5;
}

/**
 * 更新军队位置（沿路径移动）
 */
export function updateArmyPosition(army, speed = 1) {
    if (!army.status.moving || army.path.length === 0) return false;
    
    // 移动到路径中的下一个点
    const nextPoint = army.path[0];
    army.currentPosition = { ...nextPoint };
    army.path.shift();
    
    // 消耗补给
    army.status.supplies -= 0.1 * speed;
    
    // 如果到达终点
    if (army.path.length === 0) {
        army.status.moving = false;
        return true; // 返回true表示到达
    }
    
    return false;
}
