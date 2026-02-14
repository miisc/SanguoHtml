/**
 * 朝会系统
 * 实现朝廷会议、大臣建议、政策决策等功能
 */

/**
 * 朝会事件类型
 */
export const COURT_EVENT_TYPES = {
    MINISTER_ADVICE: 'minister_advice',      // 大臣建言
    TREASURE_GIFT: 'treasure_gift',          // 宝物献上
    DISASTER_REPORT: 'disaster_report',      // 灾害报告
    VICTORY_REPORT: 'victory_report',        // 战报捷报
    POLICY_PROPOSAL: 'policy_proposal',      // 政策建议
    PERSONNEL_RECOMMENDATION: 'personnel',   // 人事推荐
    DIPLOMATIC_MESSAGE: 'diplomatic',        // 外交消息
    ECONOMIC_REPORT: 'economic_report'       // 经济报告
};

/**
 * 朝会事件优先级
 */
export const EVENT_PRIORITY = {
    URGENT: 3,    // 紧急
    HIGH: 2,      // 重要
    NORMAL: 1,    // 一般
    LOW: 0        // 普通
};

/**
 * 创建朝会事件
 */
export function createCourtEvent(type, title, description, options, priority = EVENT_PRIORITY.NORMAL) {
    return {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        title,
        description,
        options,
        priority,
        timestamp: Date.now(),
        resolved: false
    };
}

/**
 * 朝会系统类
 */
export class CourtMeetingSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.pendingEvents = [];
        this.eventHistory = [];
        this.lastMeetingDate = { year: 189, season: '春季' };
        this.meetingInterval = 30; // 每30天自动触发一次
        this.daysSinceLastMeeting = 0;
    }

    /**
     * 游戏更新时调用
     */
    update(daysPassed) {
        this.daysSinceLastMeeting += daysPassed;
        
        // 检查是否应该触发自动朝会
        if (this.daysSinceLastMeeting >= this.meetingInterval) {
            this.generateRandomEvents();
            this.daysSinceLastMeeting = 0;
        }
    }

    /**
     * 触发朝会
     */
    triggerCourtMeeting() {
        // 生成朝会事件
        this.generateRandomEvents();
        
        // 更新最后朝会日期
        const state = this.gameState.getState();
        this.lastMeetingDate = {
            year: state.currentYear,
            season: state.currentSeason
        };
        
        this.daysSinceLastMeeting = 0;
        
        // 触发朝会事件
        window.dispatchEvent(new CustomEvent('courtMeetingTriggered', {
            detail: {
                events: this.getPendingEvents()
            }
        }));
        
        return this.getPendingEvents();
    }

    /**
     * 生成随机事件
     */
    generateRandomEvents() {
        const state = this.gameState.getState();
        const playerFaction = this.gameState.getPlayerFaction();
        const playerCities = this.gameState.getPlayerCities();
        const playerGenerals = this.gameState.getPlayerGenerals();
        
        // 清空旧事件
        this.pendingEvents = [];
        
        // 经济报告（必定出现）
        this.generateEconomicReport(playerFaction, playerCities);
        
        // 随机生成其他事件
        const eventGenerators = [
            () => this.generateMinisterAdvice(playerGenerals),
            () => this.generatePolicyProposal(playerFaction),
            () => this.generatePersonnelRecommendation(playerGenerals, playerCities),
            () => this.generateDisasterReport(playerCities),
            () => this.generateTreasureGift()
        ];
        
        // 随机选择1-3个事件
        const numEvents = Math.floor(Math.random() * 3) + 1;
        const shuffled = eventGenerators.sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < Math.min(numEvents, shuffled.length); i++) {
            shuffled[i]();
        }
        
        // 按优先级排序
        this.pendingEvents.sort((a, b) => b.priority - a.priority);
    }

    /**
     * 生成经济报告
     */
    generateEconomicReport(faction, cities) {
        const totalProduction = cities.reduce((sum, city) => {
            return {
                gold: sum.gold + city.production.goldPerTurn,
                food: sum.food + city.production.foodPerTurn,
                wood: sum.wood + city.production.woodPerTurn
            };
        }, { gold: 0, food: 0, wood: 0 });

        const description = `
陛下，当前国库状况如下：
• 金钱：${Math.floor(faction.resources.gold)} （日产：${totalProduction.gold}）
• 粮食：${Math.floor(faction.resources.food)} （日产：${totalProduction.food}）
• 木材：${Math.floor(faction.resources.wood)} （日产：${totalProduction.wood}）

辖下共有 ${cities.length} 座城池，国力稳固。
        `.trim();

        const event = createCourtEvent(
            COURT_EVENT_TYPES.ECONOMIC_REPORT,
            '国库经济报告',
            description,
            [
                {
                    text: '知道了',
                    callback: () => {
                        return { message: '继续励精图治，方能成就霸业！' };
                    }
                }
            ],
            EVENT_PRIORITY.NORMAL
        );

        this.pendingEvents.push(event);
    }

    /**
     * 生成大臣建言
     */
    generateMinisterAdvice(generals) {
        if (generals.length === 0) return;

        const adviser = generals[Math.floor(Math.random() * generals.length)];
        const adviceTypes = [
            {
                title: '建议减税惠民',
                description: `${adviser.name}：主公，近来民生艰难，不如减免赋税，收买民心？`,
                options: [
                    {
                        text: '准奏（金钱-500，民心+10）',
                        callback: (gameState) => {
                            const faction = gameState.getPlayerFaction();
                            if (faction.resources.gold >= 500) {
                                faction.resources.gold -= 500;
                                return { 
                                    success: true,
                                    message: '减税令颁布，百姓拥戴，民心大增！' 
                                };
                            } else {
                                return { 
                                    success: false,
                                    message: '国库空虚，无力实施此策！' 
                                };
                            }
                        }
                    },
                    {
                        text: '不可（无影响）',
                        callback: () => {
                            return { 
                                success: true,
                                message: '当前国库吃紧，此事从长计议。' 
                            };
                        }
                    }
                ]
            },
            {
                title: '建议加强军备',
                description: `${adviser.name}：主公，天下未定，应当加强军备，以备不时之需！`,
                options: [
                    {
                        text: '准奏（金钱-800，木材-200）',
                        callback: (gameState) => {
                            const faction = gameState.getPlayerFaction();
                            if (faction.resources.gold >= 800 && faction.resources.wood >= 200) {
                                faction.resources.gold -= 800;
                                faction.resources.wood -= 200;
                                // 给所有城池增加驻军
                                const cities = gameState.getPlayerCities();
                                cities.forEach(city => {
                                    city.garrison += 100;
                                });
                                return { 
                                    success: true,
                                    message: '军备充实，各城驻军增加100！' 
                                };
                            } else {
                                return { 
                                    success: false,
                                    message: '资源不足，无法实施！' 
                                };
                            }
                        }
                    },
                    {
                        text: '暂缓（无影响）',
                        callback: () => {
                            return { 
                                success: true,
                                message: '容朕三思。' 
                            };
                        }
                    }
                ]
            },
            {
                title: '建议发展农业',
                description: `${adviser.name}：主公，民以食为天，应当重视农业生产，充实粮仓！`,
                options: [
                    {
                        text: '准奏（金钱-600）',
                        callback: (gameState) => {
                            const faction = gameState.getPlayerFaction();
                            if (faction.resources.gold >= 600) {
                                faction.resources.gold -= 600;
                                faction.resources.food += 1000;
                                return { 
                                    success: true,
                                    message: '发展农业，粮食增加1000！' 
                                };
                            } else {
                                return { 
                                    success: false,
                                    message: '资金不足！' 
                                };
                            }
                        }
                    },
                    {
                        text: '不采纳',
                        callback: () => {
                            return { 
                                success: true,
                                message: '此事容后再议。' 
                            };
                        }
                    }
                ]
            }
        ];

        const advice = adviceTypes[Math.floor(Math.random() * adviceTypes.length)];
        
        const event = createCourtEvent(
            COURT_EVENT_TYPES.MINISTER_ADVICE,
            advice.title,
            advice.description,
            advice.options,
            EVENT_PRIORITY.NORMAL
        );

        this.pendingEvents.push(event);
    }

    /**
     * 生成政策建议
     */
    generatePolicyProposal(faction) {
        const proposals = [
            {
                title: '轻徭薄赋政策',
                description: '有大臣建议实行轻徭薄赋，减轻民众负担，提高民心。此举将减少金钱收入，但能获得百姓拥戴。',
                options: [
                    {
                        text: '实施政策（金钱日产-20%）',
                        callback: (gameState) => {
                            const cities = gameState.getPlayerCities();
                            cities.forEach(city => {
                                city.production.goldPerTurn = Math.floor(city.production.goldPerTurn * 0.8);
                            });
                            return { 
                                success: true,
                                message: '轻徭薄赋政策实施，民心大悦！' 
                            };
                        }
                    },
                    {
                        text: '维持现状',
                        callback: () => {
                            return { 
                                success: true,
                                message: '维持现有政策。' 
                            };
                        }
                    }
                ]
            },
            {
                title: '屯田政策',
                description: '有大臣建议实行屯田制度，组织军队和流民开垦荒地，增加粮食产量。',
                options: [
                    {
                        text: '实施政策（粮食日产+30%）',
                        callback: (gameState) => {
                            const cities = gameState.getPlayerCities();
                            cities.forEach(city => {
                                city.production.foodPerTurn = Math.floor(city.production.foodPerTurn * 1.3);
                            });
                            return { 
                                success: true,
                                message: '屯田政策实施，粮食产量大增！' 
                            };
                        }
                    },
                    {
                        text: '暂不实施',
                        callback: () => {
                            return { 
                                success: true,
                                message: '此事容后再议。' 
                            };
                        }
                    }
                ]
            }
        ];

        const proposal = proposals[Math.floor(Math.random() * proposals.length)];
        
        const event = createCourtEvent(
            COURT_EVENT_TYPES.POLICY_PROPOSAL,
            proposal.title,
            proposal.description,
            proposal.options,
            EVENT_PRIORITY.HIGH
        );

        this.pendingEvents.push(event);
    }

    /**
     * 生成人事推荐
     */
    generatePersonnelRecommendation(generals, cities) {
        // 找出没有太守的城池
        const citiesWithoutGovernor = cities.filter(city => !city.governor);
        
        if (citiesWithoutGovernor.length === 0 || generals.length === 0) return;

        const city = citiesWithoutGovernor[Math.floor(Math.random() * citiesWithoutGovernor.length)];
        const candidates = generals
            .filter(g => !g.location && g.position === 'none')
            .slice(0, 3);

        if (candidates.length === 0) return;

        const description = `${city.name} 目前没有太守，请主公选择合适的人选：`;
        
        // 存储ID而不是对象引用
        const cityId = city.id;
        const cityName = city.name;
        
        const options = candidates.map(general => {
            const generalId = general.id;
            const generalName = general.name;
            const generalPolitics = general.attributes.politics;
            
            return {
                text: `任命 ${generalName}（政治${generalPolitics}）`,
                callback: (gameState) => {
                    // 重新获取最新的对象
                    const currentCity = gameState.getCity(cityId);
                    const currentGeneral = gameState.getGeneral(generalId);
                    
                    if (!currentCity || !currentGeneral) {
                        return {
                            success: false,
                            message: '城池或武将不存在！'
                        };
                    }
                    
                    currentCity.governor = generalId;
                    currentGeneral.location = cityId;
                    currentGeneral.position = 'governor';
                    return { 
                        success: true,
                        message: `${generalName} 被任命为 ${cityName} 太守！` 
                    };
                }
            };
        });

        options.push({
            text: '暂不任命',
            callback: () => {
                return { 
                    success: true,
                    message: '此事容后再议。' 
                };
            }
        });

        const event = createCourtEvent(
            COURT_EVENT_TYPES.PERSONNEL_RECOMMENDATION,
            '太守任命',
            description,
            options,
            EVENT_PRIORITY.HIGH
        );

        this.pendingEvents.push(event);
    }

    /**
     * 生成灾害报告
     */
    generateDisasterReport(cities) {
        if (cities.length === 0) return;
        
        // 20% 概率发生灾害
        if (Math.random() > 0.2) return;

        const city = cities[Math.floor(Math.random() * cities.length)];
        const cityId = city.id;
        const cityName = city.name;
        
        const disasters = [
            {
                type: '洪涝',
                description: `${cityName} 遭遇洪涝灾害，农田被淹，粮食产量下降。`,
                effectType: 'flood'
            },
            {
                type: '旱灾',
                description: `${cityName} 发生严重旱灾，颗粒无收，百姓流离失所。`,
                effectType: 'drought'
            },
            {
                type: '蝗灾',
                description: `${cityName} 蝗虫肆虐，庄稼受损，粮食短缺。`,
                effectType: 'locust'
            }
        ];

        const disaster = disasters[Math.floor(Math.random() * disasters.length)];
        const disasterType = disaster.effectType;

        const event = createCourtEvent(
            COURT_EVENT_TYPES.DISASTER_REPORT,
            `${disaster.type}灾害`,
            disaster.description,
            [
                {
                    text: '拨款赈灾（金钱-1000）',
                    callback: (gameState) => {
                        const faction = gameState.getPlayerFaction();
                        if (faction.resources.gold >= 1000) {
                            faction.resources.gold -= 1000;
                            // 减轻灾害影响
                            return { 
                                success: true,
                                message: '赈灾及时，灾情得到控制！' 
                            };
                        } else {
                            // 无力赈灾，遭受全部损失
                            const currentCity = gameState.getCity(cityId);
                            if (currentCity) {
                                if (disasterType === 'flood') {
                                    currentCity.production.foodPerTurn = Math.floor(currentCity.production.foodPerTurn * 0.7);
                                    currentCity.resources.food = Math.max(0, currentCity.resources.food - 500);
                                } else if (disasterType === 'drought') {
                                    currentCity.production.foodPerTurn = Math.floor(currentCity.production.foodPerTurn * 0.6);
                                    currentCity.population = Math.floor(currentCity.population * 0.95);
                                } else if (disasterType === 'locust') {
                                    currentCity.resources.food = Math.max(0, currentCity.resources.food - 800);
                                }
                            }
                            return { 
                                success: false,
                                message: '国库空虚，无力赈灾，灾情加重！' 
                            };
                        }
                    }
                },
                {
                    text: '听天由命（遭受损失）',
                    callback: (gameState) => {
                        // 遭受灾害损失
                        const currentCity = gameState.getCity(cityId);
                        if (currentCity) {
                            if (disasterType === 'flood') {
                                currentCity.production.foodPerTurn = Math.floor(currentCity.production.foodPerTurn * 0.7);
                                currentCity.resources.food = Math.max(0, currentCity.resources.food - 500);
                            } else if (disasterType === 'drought') {
                                currentCity.production.foodPerTurn = Math.floor(currentCity.production.foodPerTurn * 0.6);
                                currentCity.population = Math.floor(currentCity.population * 0.95);
                            } else if (disasterType === 'locust') {
                                currentCity.resources.food = Math.max(0, currentCity.resources.food - 800);
                            }
                        }
                        return { 
                            success: true,
                            message: '未能及时赈灾，损失惨重！' 
                        };
                    }
                }
            ],
            EVENT_PRIORITY.URGENT
        );

        this.pendingEvents.push(event);
    }

    /**
     * 生成宝物献上事件
     */
    generateTreasureGift() {
        // 10% 概率获得宝物
        if (Math.random() > 0.1) return;

        const treasures = [
            { name: '七星宝刀', bonus: '金钱+1000' },
            { name: '玉玺', bonus: '金钱+2000' },
            { name: '古籍兵书', bonus: '木材+500' },
            { name: '名马', bonus: '粮食+500' }
        ];

        const treasure = treasures[Math.floor(Math.random() * treasures.length)];

        const event = createCourtEvent(
            COURT_EVENT_TYPES.TREASURE_GIFT,
            '宝物献上',
            `有商人献上宝物【${treasure.name}】，请主公笑纳！`,
            [
                {
                    text: '收下宝物',
                    callback: (gameState) => {
                        const faction = gameState.getPlayerFaction();
                        if (treasure.name === '七星宝刀') {
                            faction.resources.gold += 1000;
                        } else if (treasure.name === '玉玺') {
                            faction.resources.gold += 2000;
                        } else if (treasure.name === '古籍兵书') {
                            faction.resources.wood += 500;
                        } else if (treasure.name === '名马') {
                            faction.resources.food += 500;
                        }
                        return { 
                            success: true,
                            message: `获得宝物【${treasure.name}】，${treasure.bonus}！` 
                        };
                    }
                }
            ],
            EVENT_PRIORITY.LOW
        );

        this.pendingEvents.push(event);
    }

    /**
     * 处理事件选择
     */
    handleEventChoice(eventId, optionIndex) {
        const event = this.pendingEvents.find(e => e.id === eventId);
        if (!event || event.resolved) {
            return { success: false, message: '事件不存在或已处理' };
        }

        const option = event.options[optionIndex];
        if (!option) {
            return { success: false, message: '选项不存在' };
        }

        // 执行回调
        const result = option.callback(this.gameState);
        
        // 标记事件为已处理
        event.resolved = true;
        
        // 添加到历史记录
        this.eventHistory.push({
            ...event,
            chosenOption: optionIndex,
            result,
            resolvedAt: Date.now()
        });

        // 从待处理列表中移除
        this.pendingEvents = this.pendingEvents.filter(e => e.id !== eventId);

        return result;
    }

    /**
     * 获取待处理事件
     */
    getPendingEvents() {
        // 已经在 handleEventChoice 中过滤了，这里直接返回
        return this.pendingEvents;
    }

    /**
     * 获取事件历史
     */
    getEventHistory(limit = 10) {
        return this.eventHistory.slice(-limit);
    }

    /**
     * 清空待处理事件
     */
    clearPendingEvents() {
        this.pendingEvents = [];
    }

    /**
     * 获取状态（用于保存）
     */
    getState() {
        return {
            pendingEvents: this.pendingEvents,
            eventHistory: this.eventHistory.slice(-20), // 只保存最近20条历史
            lastMeetingDate: this.lastMeetingDate,
            daysSinceLastMeeting: this.daysSinceLastMeeting
        };
    }

    /**
     * 加载状态
     */
    loadState(state) {
        if (state) {
            this.pendingEvents = state.pendingEvents || [];
            this.eventHistory = state.eventHistory || [];
            this.lastMeetingDate = state.lastMeetingDate || { year: 189, season: '春季' };
            this.daysSinceLastMeeting = state.daysSinceLastMeeting || 0;
        }
    }
}
