# MU Idle Debug Reference

Generated: 2026-06-17

## Battle Settings
- attackIntervalMs: 800
- monsterAttackIntervalMs: 1200
- critChance: 0.05
- critMultiplier: 1.5
- skillOrder: skill_db8e7d34 > skill_3666b01c > skill_cfb19455 > skill_5f54186d > skill_5fe6e074 > skill_97f30c54

## Skill Formula
- damage = (random attack from character stats and weapon + strength * strengthScale + agility * agilityScale + energy * energyScale + flatDamage) * multiplier - monster defense reduction
- skill_97f30c54 旋风斩: Lv.1, MP 8, CD 2000ms, multiplier 1.2, scales str 0.08, agi 0.035, energy 0.02, flat 0
- skill_5fe6e074 霹雳回旋斩: Lv.28, MP 15, CD 3000ms, multiplier 1.8, scales str 0.12, agi 0.045, energy 0.025, flat 4
- skill_5f54186d 袭风刺: Lv.45, MP 12, CD 1500ms, multiplier 2.2, scales str 0.16, agi 0.065, energy 0.03, flat 8
- skill_cfb19455 雷霆裂闪: Lv.68, MP 25, CD 6000ms, multiplier 2.5, scales str 0.18, agi 0.08, energy 0.035, flat 14
- skill_3666b01c 钻云枪: Lv.95, MP 30, CD 8000ms, multiplier 1.2, scales str 0.1, agi 0.09, energy 0.04, flat 10
- skill_db8e7d34 天地十字剑: Lv.120, MP 40, CD 10000ms, multiplier 4, scales str 0.26, agi 0.1, energy 0.06, flat 30

## Spawn Points And Drops
### zone_99a3fcaf 勇者大陆 Lv.4 - 19
- mon_0feea1f0 幼龙 Lv.4: 皮装, 西洋剑, 低阶首饰, 祝福宝石（极低）
- mon_f1b02cf8 猎犬怪 Lv.9: 战士盾, 火球术, 祝福宝石（极低）
- mon_b529482d 黑巫师 Lv.14: 玛雅之石, 藤套装, 火项链, 祝福宝石
- mon_37580c89 巨人 Lv.17: 青铜套装, 波刃剑, 祝福宝石（稳定）, 灵魂宝石（极低）
- mon_af03e888 骷髅兵 Lv.19: 毒戒指, 玛雅之石, 皮全套, 祝福宝石

### zone_2008aa39 仙踪林 Lv.10 - 25
- mon_4ac2fde8 树精 Lv.10: 藤装, 短弓, 治疗之石, 祝福宝石
- mon_a86b3ed8 幼蜂 Lv.12: 藤装, 短弓, 魔法箭, 祝福宝石
- mon_8a5d97ac 石巨人 Lv.22: 天蚕套装, 石弩, 玛雅之石, 灵魂宝石（极低）
- mon_e0f55d96 毒虫 Lv.25: 守护天使, 雷项链, 灵魂宝石, 玛雅之石

### zone_83889123 地下城1层 Lv.19 - 19
- mon_f8435ca4 幽灵 Lv.19: 骷髅套装, 青铜武器, 祝福宝石, 玛雅之石

### zone_0e0c339e 地下城2层 Lv.25 - 25
- mon_22f90393 骷髅弓箭手 Lv.25: 骷髅套装, 弓箭, 灵魂宝石（极低）, 玛雅之石

### zone_64c65b2b 地下城3层 Lv.32 - 32
- mon_9783b6ab 地狱猎犬 Lv.32: 黄金武器, 青铜套装, 灵魂宝石, 祝福宝石

### zone_a71f2350 地下城4层 Lv.40 - 40
- mon_49f83288 死灵巫师 Lv.40: 黄金套装, 传说武器, 灵魂宝石, 玛雅之石

### zone_e38d78f4 地下城5层 Lv.55 - 55
- mon_c93f1c34 戈登（BOSS） Lv.55: 玛雅之石, 风, 水属性首饰, 卓越青铜, 骷髅套装, 灵魂宝石, 祝福宝石

### zone_f471c1d3 冰风谷 Lv.30 - 52
- mon_ccba21eb 雪虫 Lv.30: 白金套装, 冰系戒指, 天使变身戒指, 灵魂宝石
- mon_434aaf0d 寒冰魔 Lv.38: 白金套装, 冰系项链, 恶魔变身戒指, 灵魂宝石
- mon_af6829c8 蓝魔怪 Lv.45: 白金套装, 冰系武器, 生命宝石（极低）, 灵魂宝石
- mon_eeeb5422 雪人王 Lv.52: 白金套装, 冰系首饰, 生命宝石, 灵魂宝石, 玛雅之石

### zone_656a652b 失落之塔1层 Lv.60 - 60
- mon_589afd28 死灵 Lv.60: 黄金套装, 太阳杖, 蓝翎弓, 灵魂宝石（稳定）

### zone_74741a44 失落之塔2层 Lv.68 - 68
- mon_d9ac84ed 死神骑士 Lv.68: 黄金套装, 白金武器, 灵魂宝石, 生命宝石（极低）

### zone_1ddb872e 失落之塔3层 Lv.75 - 75
- mon_2e5cb683 恶魔 Lv.75: 黑龙王套装, 传说套装, 女神套装, 生命宝石, 灵魂宝石

### zone_77af29b0 失落之塔4层 Lv.82 - 82
- mon_34e3477a 诅咒巫师 Lv.82: 黑龙王套装, 传说套装, 生命宝石, 创造宝石（极低）

### zone_6386f4e4 失落之塔5层 Lv.90 - 90
- mon_ab6210e5 死神 Lv.90: 黑龙王套装, 女神套装, 生命宝石, 创造宝石, 灵魂宝石

### zone_ebcf6797 失落之塔6层 Lv.95 - 95
- mon_d52b8fce 恶魔骑士 Lv.95: 黑凤凰套装, 传说套装, 生命宝石, 创造宝石, 玛雅之石

### zone_55954a79 失落之塔7层 Lv.100 - 100
- mon_0991bc00 巴洛克（BOSS） Lv.100: 卓越黄金, 白金套装, 大量灵魂宝石, 玛雅之石, 生命宝石, 创造宝石

### zone_783980e5 亚特兰蒂斯 Lv.80 - 400
- mon_ee68ec07 小巴哈姆特 Lv.80: 黑龙王套装, 卓越首饰, 洛克之羽（极低）, 灵魂宝石
- mon_afc3db2f 死亡美人鱼 Lv.85: 传说套装, 卓越首饰, 洛克之羽（极低）, 生命宝石
- mon_64b07da5 蓝翼海怪 Lv.90: 女神套装, 卓越武器, 洛克之羽（低）, 创造宝石
- mon_0d514e01 剧毒美人鱼 Lv.95: 黑凤凰套装, 卓越首饰, 洛克之羽（低）, 生命宝石
- mon_97f19d08 海魔希特拉（BOSS） Lv.400: 洛克之羽, 创造宝石, 卓越黑龙王, 传说套装, 二代翅膀材料, 大量灵魂宝石

### zone_798863a5 死亡沙漠 Lv.120 - 170
- mon_5f929be1 铁脊怪 Lv.120: 创造宝石, 生命宝石, 高阶卓越武器, 套装, 灵魂宝石
- mon_b739dcc4 巨齿兽 Lv.130: 创造宝石, 生命宝石, 高阶卓越套装, 玛雅之石, 灵魂宝石
- mon_5f5963dc 破坏骑士 Lv.140: 创造宝石, 生命宝石, 顶级卓越武器, 套装, 大量灵魂宝石
- mon_f41729e7 黑炎魔 Lv.150: 创造宝石, 生命宝石, 顶级卓越套装, 玛雅之石, 大量灵魂宝石
- mon_6cb1293d 炽炎魔（BOSS） Lv.170: 卓越全套装备, 大量创造宝石, 玛雅之石, 生命宝石, 灵魂宝石

### zone_3ad3ce87 天空之城 Lv.160 - 230
- mon_8339eaed 风后 Lv.160: 洛克之羽（常规掉落）, 卓越套装, 创造宝石, 生命宝石
- mon_f9c4b23c 魔龙 Lv.170: 洛克之羽（常规掉落）, 卓越武器, 创造宝石, 大量灵魂宝石
- mon_f87d38d3 天使 Lv.180: 洛克之羽（常规掉落）, 卓越套装, 创造宝石, 生命宝石
- mon_ce3c7b46 红魔龙 Lv.190: 洛克之羽（常规掉落）, 顶级卓越武器, 创造宝石, 大量灵魂宝石
- mon_86eaf335 天魔菲尼斯（BOSS） Lv.230: 必掉洛克之羽, 国王卷轴, 卓越黑凤凰套装, 创造宝石, 大量灵魂宝石

### zone_aeab2318 卡利玛神庙1层 Lv.15 - 15
- mon_03987f97 卡利玛小怪 Lv.15: 低阶装备, 祝福宝石, 玛雅之石, 昆顿印记（极低）

### zone_d77bacb5 卡利玛神庙2层 Lv.30 - 30
- mon_d8239725 卡利玛小怪 Lv.30: 中阶装备, 灵魂宝石, 玛雅之石, 昆顿印记（低）

### zone_b36fa6cd 卡利玛神庙3层 Lv.50 - 50
- mon_1c5aa79c 卡利玛小怪 Lv.50: 高阶装备, 灵魂宝石, 生命宝石, 昆顿印记（中）

### zone_04ea45c9 卡利玛神庙4层 Lv.70 - 70
- mon_7a2f95eb 卡利玛小怪 Lv.70: 卓越装备, 灵魂宝石, 创造宝石, 昆顿印记（中高）

### zone_ce81433e 卡利玛神庙5层 Lv.90 - 90
- mon_3823c73d 卡利玛小怪 Lv.90: 卓越套装, 创造宝石, 生命宝石, 昆顿印记（高）

### zone_06b6a04e 卡利玛神庙6层 Lv.110 - 110
- mon_9543d27d 卡利玛小怪 Lv.110: 顶级卓越套装, 创造宝石, 大量灵魂宝石, 昆顿印记（极高）

### zone_1bfa3514 卡利玛神庙7层 Lv.150 - 150
- mon_b1c6acfb 魔王昆顿（终极BOSS） Lv.150: 大天使武器, 三代翅膀材料, 顶级卓越套装, 大量创造, 生命, 玛雅, 灵魂宝石
