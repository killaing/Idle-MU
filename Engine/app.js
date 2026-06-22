const APP_DATA_VERSION = "40";
const SAVE_KEY = "mu_idle_engine_save";
const OLD_SAVE_KEYS = ["mu_idle_engine_v08", "mu_idle_engine_v07", "mu_idle_engine_v06"];
const MANAGED_SAVE_PREFIX = "mu_idle_engine_";
const SAVE_LABELS = {
  [SAVE_KEY]: "统一存档",
  mu_idle_engine_v08: "旧存档 V0.8",
  mu_idle_engine_v07: "旧存档 V0.7",
  mu_idle_engine_v06: "旧存档 V0.6"
};
const DATA = {};
const WARRIOR_ANIMS = {
  idle: { src: "Assets/warrior_model/warrior_idle.png", frames: 4, fps: 6, loop: true },
  attack: { src: "Assets/warrior_model/warrior_attack.png", frames: 8, fps: 14, loop: false },
  heavy: { src: "Assets/warrior_model/warrior_heavy.png", frames: 6, fps: 11, loop: false },
  skill: { src: "Assets/warrior_model/warrior_skill.png", frames: 6, fps: 10, loop: false },
  death: { src: "Assets/warrior_model/warrior_death.png", frames: 8, fps: 8, loop: false, holdLast: true }
};
const WARRIOR_ACTION_CLASS = { attack: "attack", heavy: "heavy", skill: "skill-cast", death: "dead" };
const SLOT_NAMES = {
  weapon: "武器",
  shield: "盾牌",
  helm: "头盔",
  armor: "铠甲",
  guardian: "守护物",
  gloves: "护手",
  pants: "护腿",
  boots: "靴子",
  pendant: "项链",
  ring: "戒指",
  bracelet: "手镯",
  earringLeft: "耳环左",
  earringRight: "耳环右",
  wing: "翅膀"
};

const EQUIPMENT_QUALITY_ORDER = ["normal", "blue", "excellent", "set", "epic", "mythic"];

const GEM_ICON_BY_NAME = {
  "[绑定]神秘之石": "mu_gems_package/icons/so_stone01.png",
  "神秘之石": "mu_gems_package/icons/so_stone01.png",
  "提高宝石": "mu_gems_package/icons/lucky_items02.png",
  "延长宝石": "mu_gems_package/icons/lucky_items01.png",
  "高级进化宝石": "mu_gems_package/icons/HighRefineStone.png",
  "初级进化宝石": "mu_gems_package/icons/LowRefineStone.png",
  "再生宝石": "mu_gems_package/icons/jos.png",
  "再生原石": "mu_gems_package/icons/rs.png",
  "守护宝石": "mu_gems_package/icons/suho.png",
  "创造宝石": "mu_gems_package/icons/jewel22.png",
  "生命宝石": "mu_gems_package/icons/Jewel03.png",
  "灵魂宝石": "mu_gems_package/icons/Jewel02.png",
  "祝福宝石": "mu_gems_package/icons/Jewel01.png",
  "玛雅之石": "mu_gems_package/icons/Jewel15.png",
  "奇迹的铜币": "mu_gems_package/icons/coin7.png",
  "血色天使之魂变换标志": "mu_gems_package/icons/rareitem_ticket7.png"
};

let state;
let refs = {};
let activeMonster = null;
let activeMonsters = [];
let loopId = 0;
let runStartedAt = 0;
let lastMonsterAttack = 0;
let maxActiveMonsters = 1;
let activeLog = "combat";
let testToolsSignature = "";
let monsterEntitiesSignature = "";
let offlineModalShown = false;
let warriorModel = null;

const TEST_DEFAULTS = {
  speed: 1,
  instantKill: false,
  noDamage: false,
  forceRare: false
};

const $ = (id) => document.getElementById(id);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const weightedPick = (entries) => {
  const pool = entries.filter((entry) => Number(entry.weight) > 0);
  const total = pool.reduce((sum, entry) => sum + Number(entry.weight), 0);
  if (!total) return pool[0]?.value;
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= Number(entry.weight);
    if (roll <= 0) return entry.value;
  }
  return pool[pool.length - 1]?.value;
};

async function loadJson(path) {
  try {
    const res = await fetch(`${path}?v=${APP_DATA_VERSION}`);
    if (!res.ok) throw new Error(`加载失败: ${path}`);
    return await res.json();
  } catch (error) {
    console.warn(`使用内置备用数据: ${path}`, error);
    return fallbackData(path);
  }
}

function fallbackData(path) {
  const zones = [
    { id: "zone_99a3fcaf", name: "勇者大陆", levelRange: "1 - 20", monsters: ["mon_spider", "mon_dragon", "mon_hound", "mon_bull", "mon_wizard", "mon_giant", "mon_skeleton"] },
    { id: "zone_dungeon", name: "地下城", levelRange: "20 - 45", monsters: ["mon_poison_bug", "mon_ghost", "mon_cyclops", "mon_gorgon"] },
    { id: "zone_devias", name: "冰风谷", levelRange: "35 - 70", monsters: ["mon_worm", "mon_assassin", "mon_yeti", "mon_ice_queen"] }
  ];
  const monsters = [
    ["mon_spider", "蜘蛛", 2, 30, 4, 7, 1, "怪物信息按地图分类/勇者大陆/images/蜘蛛_3.png"],
    ["mon_dragon", "幼龙", 4, 60, 10, 13, 3, "怪物信息按地图分类/勇者大陆/images/幼龙_2.png"],
    ["mon_hound", "猎犬怪", 9, 140, 22, 27, 9, "怪物信息按地图分类/勇者大陆/images/猎犬怪_1.png"],
    ["mon_bull", "蛮牛怪", 12, 190, 31, 36, 12, "怪物信息按地图分类/勇者大陆/images/蛮牛怪_4.png"],
    ["mon_wizard", "黑巫师", 14, 255, 41, 46, 14, "怪物信息按地图分类/勇者大陆/images/黑巫师_6.png"],
    ["mon_giant", "巨人", 17, 400, 57, 62, 18, "怪物信息按地图分类/勇者大陆/images/巨人_7.png"],
    ["mon_skeleton", "骷髅兵", 19, 525, 68, 74, 22, "怪物信息按地图分类/勇者大陆/images/骷髅兵_14.png"],
    ["mon_poison_bug", "毒虫", 22, 720, 80, 92, 30, "怪物信息按地图分类/地下城/images/毒虫_12.png"],
    ["mon_ghost", "幽灵", 28, 980, 104, 118, 42, "怪物信息按地图分类/地下城/images/幽灵_11.png"],
    ["mon_cyclops", "独眼巨人", 34, 1380, 135, 150, 58, "怪物信息按地图分类/地下城/images/独眼巨人_17.png"],
    ["mon_gorgon", "魔鬼戈登", 42, 2100, 170, 195, 78, "怪物信息按地图分类/地下城/images/魔鬼戈登_18.png"],
    ["mon_worm", "雪虫", 38, 1600, 150, 172, 66, "怪物信息按地图分类/冰风谷/images/雪虫_24.png"],
    ["mon_assassin", "暗杀者", 44, 2300, 185, 210, 84, "怪物信息按地图分类/冰风谷/images/暗杀者_21.png"],
    ["mon_yeti", "雪人王", 52, 3400, 230, 260, 110, "怪物信息按地图分类/冰风谷/images/雪人王_20.png"],
    ["mon_ice_queen", "冰后", 60, 5200, 285, 325, 145, "怪物信息按地图分类/冰风谷/images/冰后_25.png"]
  ].map(([id, name, level, hp, attackMin, attackMax, defense, image]) => ({
    id, name, level, hp, attackMin, attackMax, defense, image,
    map: zones.find((zone) => zone.monsters.includes(id))?.name || "勇者大陆",
    exp: Math.floor(level * level * 1.6 + 18),
    goldMin: Math.floor(level * 3),
    goldMax: Math.floor(level * 6)
  }));
  const weapons = [
    { id: "eq_5dfce32c", name: "短剑", category: "单手剑", classes: ["剑士"], requiredLevel: 1, dropLevel: 1, requiredStrength: 0, requiredAgility: 0, durability: 10, speed: 30, kind: "weapon", slot: "weapon", quality: "normal", attackMin: 3, attackMax: 7, price: 20 },
    { id: "eq_bronze_sword", name: "青铜剑", category: "单手剑", classes: ["剑士"], requiredLevel: 8, dropLevel: 8, requiredStrength: 30, requiredAgility: 10, durability: 24, speed: 32, kind: "weapon", slot: "weapon", quality: "normal", attackMin: 9, attackMax: 16, price: 90 },
    { id: "eq_scale_sword", name: "波刃剑", category: "单手剑", classes: ["剑士"], requiredLevel: 18, dropLevel: 18, requiredStrength: 45, requiredAgility: 18, durability: 32, speed: 34, kind: "weapon", slot: "weapon", quality: "normal", attackMin: 18, attackMax: 28, price: 260 }
  ];
  const armor = [
    { id: "eq_ce0ba26f", name: "皮铠", category: "剑士铠甲", classes: ["剑士"], requiredLevel: 1, dropLevel: 1, requiredStrength: 0, requiredAgility: 0, durability: 10, kind: "armor", slot: "armor", quality: "normal", defenseMin: 2, defenseMax: 2, defense: 2, price: 18 },
    { id: "eq_bronze_armor", name: "青铜铠甲", category: "剑士铠甲", classes: ["剑士"], requiredLevel: 10, dropLevel: 10, requiredStrength: 35, requiredAgility: 10, durability: 28, kind: "armor", slot: "armor", quality: "normal", defenseMin: 7, defenseMax: 7, defense: 7, price: 120 },
    { id: "eq_bronze_boots", name: "青铜靴", category: "剑士靴", classes: ["剑士"], requiredLevel: 12, dropLevel: 12, requiredStrength: 30, requiredAgility: 14, durability: 25, kind: "armor", slot: "boots", quality: "normal", defenseMin: 5, defenseMax: 5, defense: 5, price: 95 }
  ];
  const guardians = [
    { id: "guardian_imp", name: "小恶魔", category: "守护物", classes: ["全职业"], requiredLevel: 28, dropLevel: 28, kind: "guardian", slot: "guardian", quality: "normal", petLife: 255, icon: "Assets/guardians/小恶魔.png", effects: [{ effect: "damageIncrease", value: 0.3, label: "攻击力提高 +30%" }] },
    { id: "guardian_guardian_angel", name: "守护天使", category: "守护物", classes: ["全职业"], requiredLevel: 23, dropLevel: 23, kind: "guardian", slot: "guardian", quality: "normal", petLife: 255, icon: "Assets/guardians/守护天使.png", effects: [{ effect: "damageAbsorb", value: 0.2, label: "伤害吸收 +20%" }, { effect: "lifeFlat", value: 50, label: "最大生命力 +50" }] }
  ];
  const jewels = [
    { id: "jewel_bless", name: "祝福宝石", kind: "jewel", quality: "normal", stack: 99, price: 1000 },
    { id: "jewel_soul", name: "灵魂宝石", kind: "jewel", quality: "normal", stack: 99, price: 1800 }
  ];
  const drops = Object.fromEntries(monsters.map((monster) => [monster.id, [
    { itemId: monster.level < 15 ? "eq_bronze_sword" : "eq_scale_sword", weight: 35 },
    { itemId: "eq_bronze_armor", weight: 25 },
    { itemId: "jewel_bless", weight: 3 }
  ]]));
  const data = {
    "Data/Character/Knight.json": {
      id: "dark_knight", name: "剑士", muName: "Dark Knight", spawnMap: "mu_103h_world", spawnZone: "zone_99a3fcaf", level: 1,
      baseStats: { strength: 28, agility: 20, vitality: 25, energy: 10, life: 80, mana: 30 },
      growth: { pointsPerLevel: 5, lifePerLevel: 2, lifePerVitality: 2, manaPerLevel: 1.5, manaPerEnergy: 1.5, minAttackDivisor: 6, maxAttackDivisor: 4, defenseAgilityDivisor: 3, defenseSuccessAgilityDivisor: 3, attackSpeedAgilityDivisor: 15, attackSuccessLevelMultiplier: 5, attackSuccessAgilityMultiplier: 3, attackSuccessStrengthDivisor: 4 },
      startingItems: [{ itemId: "eq_5dfce32c", slot: "weapon", level: 0 }, { itemId: "eq_ce0ba26f", slot: "armor", level: 0 }],
      dualWield: { enabled: true, offhandSlot: "shield", offhandDamageRate: 0.55, oneHandOnly: true }
    },
    "Data/Character/ClassFormulas.json": { activeClass: "dark_knight", classes: {} },
    "Data/Character/LevelExp.json": { formula: "level * level * 12 + level * 35", maxLevel: 400 },
    "Data/Character/Skills.json": [
      { id: "skill_97f30c54", name: "旋风斩", type: "attack", requiredLevel: 1, mana: 8, cooldownMs: 2000, multiplier: 1.2, strengthScale: 0.08, agilityScale: 0.035, flatDamage: 0, skillType: "近战" },
      { id: "skill_5fe6e074", name: "雷霆回旋斩", type: "attack", requiredLevel: 18, mana: 15, cooldownMs: 3000, multiplier: 1.8, strengthScale: 0.12, agilityScale: 0.045, flatDamage: 4, skillType: "近战" },
      { id: "skill_5f54186d", name: "袭风刺", type: "attack", requiredLevel: 35, mana: 18, cooldownMs: 4200, multiplier: 2.2, strengthScale: 0.16, agilityScale: 0.065, flatDamage: 8, skillType: "突刺" },
      { id: "skill_cfb19455", name: "雷霆裂闪", type: "attack", requiredLevel: 55, mana: 25, cooldownMs: 6000, multiplier: 2.5, strengthScale: 0.18, agilityScale: 0.08, flatDamage: 14, skillType: "爆发" }
    ],
    "Data/Map/Lorencia.json": { id: "mu_103h_world", name: "勇者大陆", zones },
    "Data/Monster/MonsterList.json": monsters,
    "Data/Monster/Spawn.json": {},
    "Data/Monster/DropTable.json": drops,
    "Data/Item/Weapons.json": weapons,
    "Data/Item/Armor.json": armor,
    "Data/Item/Guardians.json": guardians,
    "Data/Item/Jewels.json": jewels,
    "Data/Item/GuardianAttributes.json": { branch: "guardian", name: "守护物属性数据库", attributes: [] },
    "Data/Config/Battle.json": { attackIntervalMs: 800, monsterAttackIntervalMs: 1200, critChance: 0.05, critMultiplier: 1.5, excellentChance: 0.003, skillOrder: ["skill_cfb19455", "skill_5f54186d", "skill_5fe6e074", "skill_97f30c54"] },
    "Data/Config/Offline.json": { enabled: true, maxHours: 12, efficiency: 0.65 },
    "Data/Config/AutoLoot.json": { gold: true, equipment: true, excellent: true, set: true, jewel: true, material: true, autoSellNormal: false },
    "Data/Config/DropRates.json": { offline: { maxHours: 12, fullRateHours: 6, afterFullRateEfficiency: 0.8, dailyFirstLoginOfflineBonus: 0.5 }, materials: [], rarityWeights: [] }
  };
  if (!(path in data)) console.warn(`缺少备用数据: ${path}`);
  return structuredClone(data[path] ?? {});
}

async function boot() {
  refs = {
    hpBar: $("hpBar"), mpBar: $("mpBar"), hpText: $("hpText"), mpText: $("mpText"),
    expBar: $("expBar"), expText: $("expText"),
    roleName: $("roleName"), powerText: $("powerText"), goldText: $("goldText"),
    jewelText: $("jewelText"), premiumText: $("premiumText"), mapName: $("mapName"),
    zoneList: $("zoneList"), toggleRun: $("toggleRun"), zoneTitle: $("zoneTitle"),
    openMapBtn: $("openMapBtn"), closeMapBtn: $("closeMapBtn"), mapModal: $("mapModal"), mapSummary: $("mapSummary"),
    runState: $("runState"), runTime: $("runTime"), effText: $("effText"),
    statsGrid: $("statsGrid"), pointsText: $("pointsText"), equipment: $("equipment"),
    inventory: $("inventory"), bagCount: $("bagCount"), shopList: $("shopList"),
    monsterName: $("monsterName"), monsterSprite: $("monsterSprite"), slash: $("slash"), floatText: $("floatText"),
    monsterHpBar: $("monsterHpBar"), monsterHpText: $("monsterHpText"),
    heroHpBar: $("heroHpBar"), heroHpText: $("heroHpText"), heroMpBar: $("heroMpBar"), heroMpText: $("heroMpText"),
    startScreen: $("startScreen"), createKnightBtn: $("createKnightBtn"), continueBtn: $("continueBtn"),
    currentZoneMonsters: $("currentZoneMonsters"),
    logBox: $("logBox"), lootOptions: $("lootOptions"), skillList: $("skillList"),
    priorityText: $("priorityText"), rewardExp: $("rewardExp"), rewardGold: $("rewardGold"),
    rewardEquip: $("rewardEquip"), rewardJewels: $("rewardJewels"), itemTooltip: $("itemTooltip"),
    dropLayer: $("dropLayer"), testTools: $("testTools"),
    resetPointsBtn: $("resetPointsBtn"), autoPointsToggle: $("autoPointsToggle"),
    autoPointPlan: $("autoPointPlan"), autoPointPlanText: $("autoPointPlanText"),
    offlineSummary: $("offlineSummary"),
    autoSellOptions: $("autoSellOptions"),
    debugPanel: $("debugPanel"), debugModal: $("debugModal"), openDebugBtn: $("openDebugBtn"), closeDebugBtn: $("closeDebugBtn"),
    offlineModal: $("offlineModal"), offlineModalBody: $("offlineModalBody"), closeOfflineBtn: $("closeOfflineBtn"),
    saveModal: $("saveModal"), saveList: $("saveList"), openSaveBtn: $("openSaveBtn"), closeSaveBtn: $("closeSaveBtn"),
    migrateSaveBtn: $("migrateSaveBtn"), exportSaveBtn: $("exportSaveBtn"), cleanupSaveBtn: $("cleanupSaveBtn"),
    importSaveBtn: $("importSaveBtn"), saveImportText: $("saveImportText"),
    guideModal: $("guideModal"), guideBody: $("guideBody"), openGuideBtn: $("openGuideBtn"), closeGuideBtn: $("closeGuideBtn")
  };

  const [
    knight, classFormulas, exp, skills, map, monsters, spawn, drops,
    weapons, armor, accessories, guardians, jewels, setItems, sets, itemAffixes, guardianAttributes, excellentOptions, classBranches, knightGuide, battle, offline, autoLoot, dropRates
  ] = await Promise.all([
    loadJson("Data/Character/Knight.json"),
    loadJson("Data/Character/ClassFormulas.json"),
    loadJson("Data/Character/LevelExp.json"),
    loadJson("Data/Character/Skills.json"),
    loadJson("Data/Map/Lorencia.json"),
    loadJson("Data/Monster/MonsterList.json"),
    loadJson("Data/Monster/Spawn.json"),
    loadJson("Data/Monster/DropTable.json"),
    loadJson("Data/Item/Weapons.json"),
    loadJson("Data/Item/Armor.json"),
    loadJson("Data/Item/Accessories.json"),
    loadJson("Data/Item/Guardians.json"),
    loadJson("Data/Item/Jewels.json"),
    loadJson("Data/Item/SetItems.json"),
    loadJson("Data/Item/Sets.json"),
    loadJson("Data/Item/ItemAffixes.json"),
    loadJson("Data/Item/GuardianAttributes.json"),
    loadJson("Data/Item/ExcellentOptions.json"),
    loadJson("Data/Item/ClassBranches.json"),
    loadJson("Data/Guide/KnightEquipmentGuide.json"),
    loadJson("Data/Config/Battle.json"),
    loadJson("Data/Config/Offline.json"),
    loadJson("Data/Config/AutoLoot.json"),
    loadJson("Data/Config/DropRates.json")
  ]);

  Object.assign(DATA, {
    knight, classFormulas, exp, skills, map, monsters, spawn, drops, battle, offline, autoLoot, dropRates,
    classBranches, knightGuide, excellentOptions, guardianAttributes,
    sets: Object.fromEntries((sets.sets || []).map((set) => [set.id, set])),
    affixes: Object.fromEntries((itemAffixes.affixes || []).map((affix) => [affix.id, affix])),
    items: Object.fromEntries([...weapons, ...armor, ...accessories, ...guardians, ...jewels, ...(Array.isArray(setItems) ? setItems : [])].map((item) => [item.id, item])),
    zones: Object.fromEntries(map.zones.map((zone) => [zone.id, zone])),
    monsterById: Object.fromEntries(monsters.map((monster) => [monster.id, monster]))
  });
  normalizeEquipmentData();
  applyGemIcons();
  addRuntimeShopPotions();

  state = normalize(loadState());
  autoEnterFromLauncher();
  resetSessionRewards();
  applyOffline();
  bindEvents();
  initWarriorModel();
  renderAll();
  showOfflineModalOnce();
  save();
}

function resetSessionRewards() {
  state.rewards = { exp: 0, gold: 0, equip: 0, jewels: 0 };
}

function defaultState() {
  const st = {
    level: DATA.knight.level,
    exp: 0,
    gold: 0,
    premium: 50,
    stats: { ...DATA.knight.baseStats },
    points: 0,
    hp: 0,
    mp: 0,
    mapId: DATA.knight.spawnMap,
    zoneId: DATA.knight.spawnZone,
    targetMonsterId: "",
    running: false,
    equipment: {},
    inventory: [],
    offlinePendingItems: [],
    loot: { ...DATA.autoLoot },
    autoAssignPoints: false,
    autoAssignPlan: { strength: 3, agility: 1, vitality: 1, energy: 0 },
    potion: {
      autoHp: true,
      hpPercent: 35,
      autoMp: true,
      mpPercent: 25
    },
    skillCd: {},
    buffs: {},
    rewards: { exp: 0, gold: 0, equip: 0, jewels: 0 },
    logs: { combat: [], info: [] },
    kills: 0,
    created: false,
    potionsUsed: 0,
    dropPity: { jewelKills: 0 },
    test: { ...TEST_DEFAULTS },
    lastLoginBonusDate: "",
    offlineSummary: null,
    dataVersion: APP_DATA_VERSION,
    lastSaveAt: Date.now()
  };
  DATA.knight.startingItems.forEach((entry) => {
    const item = makeItem(entry.itemId, { level: entry.level ?? 0 });
    if (item) st.equipment[entry.slot] = item;
  });
  st.hp = maxLife(st);
  st.mp = maxMana(st);
  return st;
}

function loadState() {
  const saves = listManagedSaves();
  if (!saves.length) return defaultState();
  const picked = saves[0];
  if (picked.key !== SAVE_KEY) {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...picked.data, migratedFrom: picked.key, migratedAt: Date.now() }));
  }
  return picked.data;
}

function hasAnySave() {
  return managedSaveKeys().some((key) => Boolean(localStorage.getItem(key)));
}

function normalizeEquipmentData() {
  Object.values(DATA.items || {}).forEach((item) => {
    if (!item) return;
    item.name = cleanBaseItemName(item.name);
    item.classes = cleanClassList(item.classes);
    normalizeSetItemData(item);
  });
}

function normalizeSetItemData(item) {
  if (!item || (item.quality !== "set" && !item.setId)) return;
  const sets = Object.values(DATA.sets || {});
  if (!sets.length) return;
  if (item.setId && DATA.sets[item.setId]) {
    item.setName = item.setName || DATA.sets[item.setId].name;
    return;
  }
  const itemKey = normalizeClassName(item.name);
  const match = sets
    .map((set) => ({ set, key: normalizeClassName(String(set.name || "").replace(/套装$/, "")) }))
    .filter(({ key }) => key && itemKey.startsWith(key))
    .sort((a, b) => b.key.length - a.key.length)[0];
  if (match) {
    item.setId = match.set.id;
    item.setName = match.set.name;
  } else if (item.setId && !DATA.sets[item.setId]) {
    delete item.setId;
    delete item.setName;
  }
}

function cleanClassList(classes) {
  if (!Array.isArray(classes)) return [];
  const seen = new Set();
  return classes
    .map((cls) => String(cls || "").trim())
    .filter((cls) => cls && !/^\?+$/.test(cls) && !cls.includes("\uFFFD"))
    .filter((cls) => {
      const key = normalizeClassName(cls);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function cleanBaseItemName(name) {
  return String(name || "")
    .replace(/^(卓越的\s*)+/g, "")
    .replace(/^(套装\s*)+/g, "")
    .trim();
}

function qualityPrefix(item, base = DATA.items[item?.itemId] || {}) {
  const kind = item?.quality || base?.quality || "normal";
  if (kind === "excellent") return "卓越的 ";
  if (kind === "set") return "套装 ";
  if (kind === "epic") return "史诗 ";
  if (kind === "mythic") return "神话 ";
  return "";
}

function displayItemName(item, base = DATA.items[item?.itemId] || {}) {
  const name = cleanBaseItemName(item?.name || base?.name || "");
  return `${qualityPrefix(item, base)}${name}`.trim();
}

function normalize(raw) {
  const st = { ...defaultState(), ...raw };
  st.stats = { ...DATA.knight.baseStats, ...(raw.stats || {}) };
  st.equipment = Object.fromEntries(Object.entries(raw.equipment || st.equipment)
    .filter(([, item]) => item && DATA.items[item.itemId])
    .map(([slot, item]) => [slot, hydrateItemIcon(item)]));
  if (!st.equipment.weapon && DATA.knight.startingItems?.length) {
    DATA.knight.startingItems.forEach((entry) => {
      if (!st.equipment[entry.slot]) {
        const item = makeItem(entry.itemId, { level: entry.level ?? 0 });
        if (item) st.equipment[entry.slot] = item;
      }
    });
  }
  st.inventory = mergeStackedInventory(Array.isArray(raw.inventory) ? raw.inventory.filter((item) => item && DATA.items[item.itemId]).map(hydrateItemIcon) : []);
  st.offlinePendingItems = mergeStackedInventory(Array.isArray(raw.offlinePendingItems) ? raw.offlinePendingItems.filter((item) => item && DATA.items[item.itemId]).map(hydrateItemIcon) : []);
  st.autoAssignPoints = Boolean(raw.autoAssignPoints);
  st.autoAssignPlan = normalizeAutoAssignPlan(raw.autoAssignPlan);
  st.loot = { ...DATA.autoLoot, ...(raw.loot || {}) };
  st.potion = {
    autoHp: true,
    hpPercent: 35,
    autoMp: true,
    mpPercent: 25,
    ...(raw.potion || {})
  };
  st.potion.hpPercent = clamp(Number(st.potion.hpPercent) || 35, 1, 99);
  st.potion.mpPercent = clamp(Number(st.potion.mpPercent) || 25, 1, 99);
  st.potion.autoHp = Boolean(st.potion.autoHp);
  st.potion.autoMp = Boolean(st.potion.autoMp);
  st.loot.autoSell = {
    normal: Boolean(st.loot.autoSellNormal),
    blue: false,
    excellent: false,
    set: false,
    epic: false,
    mythic: false,
    jewel: false,
    material: false,
    potion: false,
    ...(raw.loot?.autoSell || {})
  };
  st.rewards = { exp: 0, gold: 0, equip: 0, jewels: 0, ...(raw.rewards || {}) };
  st.logs = { combat: [], info: [], ...(raw.logs || {}) };
  if (raw.dataVersion !== APP_DATA_VERSION) st.logs = { combat: [], info: [] };
  st.dataVersion = APP_DATA_VERSION;
  st.created = raw.created ?? hasAnySave();
  st.potionsUsed = raw.potionsUsed || 0;
  st.dropPity = { jewelKills: 0, ...(raw.dropPity || {}) };
  st.test = { ...TEST_DEFAULTS, ...(raw.test || {}) };
  st.test.speed = clamp(Number(st.test.speed) || 1, 1, 16);
  st.lastLoginBonusDate = raw.lastLoginBonusDate || "";
  st.offlineSummary = raw.offlineSummary || null;
  st.mapId = DATA.map.id;
  if (!DATA.zones[st.zoneId]) st.zoneId = DATA.knight.spawnZone;
  const zoneMonsterIds = DATA.zones[st.zoneId]?.monsters || [];
  st.targetMonsterId = zoneMonsterIds.includes(raw.targetMonsterId) ? raw.targetMonsterId : "";
  st.hp = clamp(raw.hp ?? maxLife(st), 1, maxLife(st));
  st.mp = clamp(raw.mp ?? maxMana(st), 0, maxMana(st));
  st.running = false;
  return st;
}

function save() {
  state.lastSaveAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function cleanupLegacySaves() {
  managedSaveKeys()
    .filter((key) => key !== SAVE_KEY)
    .forEach((key) => localStorage.removeItem(key));
  renderSaveManager();
}

function managedSaveKeys() {
  return Object.keys(localStorage)
    .filter((key) => key === SAVE_KEY || OLD_SAVE_KEYS.includes(key) || key.startsWith(MANAGED_SAVE_PREFIX))
    .filter((key) => key !== "mu_idle_engine_save_export");
}

function listManagedSaves() {
  return managedSaveKeys()
    .map((key) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const data = JSON.parse(raw);
        return {
          key,
          data,
          raw,
          label: SAVE_LABELS[key] || key,
          updatedAt: Number(data.lastSaveAt || data.createdAt || 0),
          level: Number(data.level || 1),
          gold: Number(data.gold || 0),
          current: key === SAVE_KEY
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function makeItem(itemId, extra = {}) {
  const base = DATA.items[itemId];
  if (!base) return null;
  const equipment = isEquipment(base);
  const quality = extra.quality || base.quality || "normal";
  const rolled = equipment ? rollEquipmentOptions(base, quality, extra) : { luck: false, additionalLevel: 0, excellentOptions: [], excellentOptionIds: [] };
  return {
    uid: crypto.randomUUID(),
    itemId,
    name: cleanBaseItemName(base.name),
    kind: base.kind,
    slot: base.slot,
    quality,
    level: extra.level ?? 0,
    count: equipment ? 1 : (extra.count ?? 1),
    luck: Boolean(extra.luck ?? base.guaranteedLuck ?? rolled.luck),
    additionalLevel: extra.additionalLevel ?? rolled.additionalLevel,
    affixes: extra.affixes || rollBaseAffixes(base),
    excellentOptions: quality === "excellent" ? rolled.excellentOptions : [],
    excellentOptionIds: quality === "excellent" ? rolled.excellentOptionIds : []
  };
}

function applyGemIcons() {
  Object.values(DATA.items).forEach((item) => {
    if (!item || item.icon) return;
    const icon = GEM_ICON_BY_NAME[item.name];
    if (icon) item.icon = icon;
  });
}

function rollBaseAffixes(base) {
  const affixes = [];
  (base.explicitExtraAffixes || []).forEach((entry) => {
    if (!Array.isArray(entry.values) || !entry.values.length) return;
    affixes.push({
      affixId: entry.affixId,
      effect: entry.effect,
      value: pick(entry.values),
      label: entry.label
    });
  });
  return affixes;
}

function rollEquipmentOptions(base, quality, extra = {}) {
  const excellentOptions = quality === "excellent" ? makeExcellentOptions(base, extra) : [];
  const additionalLevel = extra.additionalLevel ?? rollAdditionalLevel(quality);
  return {
    excellentOptions,
    excellentOptionIds: quality === "excellent" ? makeExcellentOptionIds(base, excellentOptions, extra) : [],
    luck: Boolean(extra.luck ?? (Math.random() < equipmentLuckChance(quality, additionalLevel, extra))),
    additionalLevel
  };
}

function makeExcellentOptions(base, extra = {}) {
  if (Array.isArray(extra.excellentOptions)) return sanitizeExcellentOptions(extra.excellentOptions);
  const pool = excellentOptionPool(base);
  const count = clamp(Number(extra.excellentCount) || rollExcellentOptionCount(extra), 1, pool.length);
  const picked = [];
  const remaining = [...pool];
  while (picked.length < count && remaining.length) {
    const option = weightedPick(remaining.map((entry) => ({ value: entry, weight: entry.weight || 1 })));
    picked.push(option);
    remaining.splice(remaining.indexOf(option), 1);
  }
  return picked.map((option) => option.text);
}

function rollExcellentOptionCount(extra = {}) {
  const roll = DATA.excellentOptions?.roll || {};
  const configured = extra.bossDrop ? roll.bossCountWeights : roll.countWeights;
  const weights = Array.isArray(configured) && configured.length
    ? configured.map((entry) => ({ value: Number(entry.count), weight: Number(entry.weight) }))
    : [
      { value: 1, weight: 8000 },
      { value: 2, weight: 1600 },
      { value: 3, weight: 320 },
      { value: 4, weight: 64 },
      { value: 5, weight: 12 },
      { value: 6, weight: 4 }
    ];
  return weightedPick(weights);
}

function makeExcellentOptionIds(base, optionTexts, extra = {}) {
  if (Array.isArray(extra.excellentOptionIds)) return extra.excellentOptionIds.filter(Boolean);
  const idsByText = new Map(excellentOptionPool(base).map((option) => [option.text, option.id]));
  return optionTexts
    .map((text) => idsByText.get(text) || excellentOptionIdFromText(text, base))
    .filter(Boolean);
}

function officialExcellentOptionPool(base) {
  const weaponLike = ["weapon", "pendant"].includes(excellentGroupForItem(base));
  return weaponLike
    ? [
      { id: "excellentDamageRate", text: "卓越攻击几率增加 +10%", effect: "excellentDamageRate", value: 0.1, weight: 1 },
      { id: "attackPerLevel", text: "攻击力(魔法攻击力)增加 +等级/20", effect: "attackFlat", value: 1, calc: "levelDivisor", divisor: 20, weight: 1 },
      { id: "attackPercent", text: "攻击力(魔法攻击力)增加 +2%", effect: "attackPercent", value: 0.02, weight: 1 },
      { id: "attackSpeed", text: "攻击(魔法)速度增加 +7", effect: "attackSpeed", value: 7, weight: 1 },
      { id: "lifeOnKill", text: "杀死怪物时所获生命值增加 +生命值/8", effect: "lifeOnKill", value: 0.125, weight: 1 },
      { id: "manaOnKill", text: "杀死怪物时所获魔法值增加 +魔法值/8", effect: "manaOnKill", value: 0.125, weight: 1 }
    ]
    : [
      { id: "maxLifePercent", text: "生命增加 +4%", effect: "maxLifePercent", value: 0.04, weight: 1 },
      { id: "maxManaPercent", text: "魔法增加 +4%", effect: "maxManaPercent", value: 0.04, weight: 1 },
      { id: "damageDecrease", text: "伤害减少 +4%", effect: "damageDecrease", value: 0.04, weight: 1 },
      { id: "damageReflect", text: "伤害反射 +5%", effect: "damageReflect", value: 0.05, weight: 1 },
      { id: "defenseSuccessRate", text: "防御成功率增加 +10%", effect: "defenseSuccessRate", value: 0.1, weight: 1 },
      { id: "zenOnKill", text: "杀怪掉出的金钱增加 +40%", effect: "zenOnKill", value: 0.4, weight: 1 }
    ];
}

function excellentOptionPool(base) {
  const group = excellentGroupForItem(base);
  const ids = DATA.excellentOptions?.groups?.[group];
  const options = DATA.excellentOptions?.options || [];
  if (Array.isArray(ids) && ids.length && Array.isArray(options) && options.length) {
    const byId = new Map(options.map((option) => [option.id, option]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }
  return officialExcellentOptionPool(base);
}

function excellentGroupForItem(base = {}) {
  if (base.kind === "weapon") return "weapon";
  if (base.slot === "pendant") return "pendant";
  if (base.slot === "ring") return "ring";
  if (base.slot === "shield") return "shield";
  return "armor";
}

function excellentOptionMeta(id, base = {}) {
  return excellentOptionPool(base).find((option) => option.id === id)
    || (DATA.excellentOptions?.options || []).find((option) => option.id === id)
    || officialExcellentOptionPool(base).find((option) => option.id === id);
}

function excellentOptionValue(option, st = state) {
  if (!option) return 0;
  if (option.calc === "levelDivisor") return Math.floor((st.level || 1) / Number(option.divisor || 20)) * Number(option.value || 1);
  return Number(option.value || 0);
}

function excellentOptionIdFromText(text, base = {}) {
  const normalized = String(text || "").replace(/\s+/g, "").toLowerCase();
  if (!normalized) return "";
  const direct = excellentOptionPool(base).find((option) => normalizeClassName(option.text) === normalizeClassName(text));
  if (direct) return direct.id;
  if (normalized.includes("卓越一击") || normalized.includes("卓越攻击")) return "excellentDamageRate";
  if (normalized.includes("攻击") && normalized.includes("20等级")) return "attackPerLevel";
  if (normalized.includes("防御") && normalized.includes("20等级")) return "defensePerLevel";
  if ((normalized.includes("攻击") || normalized.includes("魔法攻击")) && normalized.includes("2%")) return "attackPercent";
  if (normalized.includes("攻击速度") || normalized.includes("速度增加+7")) return "attackSpeed";
  if (normalized.includes("生命") && (normalized.includes("/8") || normalized.includes("恢复"))) return "lifeOnKill";
  if ((normalized.includes("魔法") || normalized.includes("魔力")) && (normalized.includes("/8") || normalized.includes("恢复"))) return "manaOnKill";
  if (normalized.includes("最大生命") || normalized.includes("生命增加+4")) return "maxLifePercent";
  if (normalized.includes("最大魔法") || normalized.includes("魔法增加+4") || normalized.includes("魔力增加+4")) return "maxManaPercent";
  if (normalized.includes("伤害减少")) return "damageDecrease";
  if (normalized.includes("伤害反射")) return "damageReflect";
  if (normalized.includes("防御成功率")) return "defenseSuccessRate";
  if (normalized.includes("金币") || normalized.includes("金钱") || normalized.includes("zen")) return "zenOnKill";
  return "";
}

function excellentTextForId(id, item, base = DATA.items[item?.itemId] || {}) {
  const option = excellentOptionMeta(id, base);
  const levelValue = Math.floor((state?.level || item?.ownerLevel || 1) / 20);
  if (option?.calc === "levelDivisor") return `${option.text}（当前 +${levelValue * Number(option.value || 1)}）`;
  if (option?.text) return option.text;
  const labels = {
    excellentDamageRate: "卓越攻击几率增加 +10%",
    attackPerLevel: `攻击力(魔法攻击力)增加 +等级/20（当前 +${levelValue}）`,
    attackPercent: "攻击力(魔法攻击力)增加 +2%",
    attackSpeed: "攻击(魔法)速度增加 +7",
    lifeOnKill: "杀死怪物时所获生命值增加 +生命值/8",
    manaOnKill: "杀死怪物时所获魔法值增加 +魔法值/8",
    maxLifePercent: "最大生命值增加 +4%",
    maxManaPercent: "最大魔法值增加 +4%",
    damageDecrease: "伤害减少 +4%",
    damageReflect: "伤害反射 +5%",
    defenseSuccessRate: "防御成功率增加 +10%",
    zenOnKill: "杀怪掉出的金钱增加 +40%"
  };
  return labels[id] || id;
}

function equipmentLuckChance(quality, additionalLevel = 0, extra = {}) {
  if (quality === "excellent") return extra.bossDrop ? 0.10 : 0.05;
  if (quality !== "normal") return 0;
  const baseChance = additionalLevel ? 0.05 : 0.01;
  return Math.min(1, baseChance * (extra.bossDrop ? 3 : 1));
}

function rollAdditionalLevel(quality) {
  const chance = quality === "excellent" ? 0.10 : quality === "normal" ? 0.19 : 0;
  if (Math.random() >= chance) return 0;
  return weightedPick([
    { value: 4, weight: 55 },
    { value: 8, weight: 30 },
    { value: 12, weight: 12 },
    { value: 16, weight: 3 }
  ]);
}

function addRuntimeShopPotions() {
  const potions = [
    { id: "shop_heal_potion_small", name: "治疗药水", price: 30, use: "生命过低时自动使用" },
    { id: "shop_mana_potion_small", name: "魔法药水", price: 25, use: "补充魔法值" }
  ];
  potions.forEach((item) => {
    if (DATA.items[item.id]) return;
    DATA.items[item.id] = {
      ...item,
      kind: "potion",
      quality: "normal",
      stack: 99,
      source: "shop"
    };
  });
}

function expToNext(level = state.level) {
  return level * level * 12 + level * 35;
}

function equipped(slot) {
  const item = state.equipment[slot];
  return item ? DATA.items[item.itemId] : null;
}

function effectiveAdditionalLevel(item) {
  const raw = Number(item?.additionalLevel || 0);
  return item?.luck ? Math.floor(raw * 1.1) : raw;
}

function itemAttackMin(item, base = DATA.items[item?.itemId] || {}) {
  if (!item || !base || !["weapon", "accessory"].includes(base.kind)) return 0;
  const excellentBonus = item.quality === "excellent" ? 30 : 0;
  return Number(base.attackMin || base.statMin || 0) + excellentBonus + (item.level || 0) * 2 + effectiveAdditionalLevel(item);
}

function itemAttackMax(item, base = DATA.items[item?.itemId] || {}) {
  if (!item || !base || !["weapon", "accessory"].includes(base.kind)) return 0;
  const excellentBonus = item.quality === "excellent" ? 30 : 0;
  return Number(base.attackMax || base.statMax || 0) + excellentBonus + (item.level || 0) * 2 + effectiveAdditionalLevel(item);
}

function itemDefense(item, base = DATA.items[item?.itemId] || {}) {
  if (!item || !base || !["armor", "accessory"].includes(base.kind)) return 0;
  const baseDefense = Number(base.defenseMax ?? base.defense ?? base.statMax ?? 0);
  const excellentBonus = item.quality === "excellent" ? 20 : 0;
  return baseDefense + excellentBonus + (item.level || 0) * 3 + effectiveAdditionalLevel(item);
}

function maxLife(st = state) {
  const growth = DATA.knight.growth || {};
  const base = DATA.knight.baseStats.life
    + Math.max(0, (st.level || 1) - 1) * (growth.lifePerLevel ?? 2)
    + statWithEquipment("vitality", st) * (growth.lifePerVitality ?? 2)
    + equipmentEffectTotal("lifeFlat", st);
  return Math.floor(base * (1 + equipmentEffectTotal("maxLifePercent", st)));
}

function maxMana(st = state) {
  const growth = DATA.knight.growth || {};
  const base = DATA.knight.baseStats.mana
    + Math.max(0, (st.level || 1) - 1) * (growth.manaPerLevel ?? 1.5)
    + statWithEquipment("energy", st) * (growth.manaPerEnergy ?? 1.5)
    + equipmentEffectTotal("manaFlat", st);
  return Math.floor(base * (1 + equipmentEffectTotal("maxManaPercent", st)));
}

function statWithEquipment(stat, st = state) {
  const key = `${stat}Flat`;
  return (st.stats?.[stat] || 0) + equipmentEffectTotal(key, st) + equipmentEffectTotal("allStatsFlat", st);
}

function calcStats() {
  const mainWeaponItem = state.equipment.weapon;
  const mainWeapon = equipped("weapon");
  const offhandItem = state.equipment.shield;
  const offhandBase = offhandItem ? DATA.items[offhandItem.itemId] : null;
  const offhandWeapon = offhandBase?.kind === "weapon" ? offhandBase : null;
  const shield = offhandBase && offhandBase.kind !== "weapon" ? offhandBase : null;
  const equippedItems = Object.values(state.equipment).filter(Boolean);
  const armorItems = equippedItems.filter((it) => DATA.items[it.itemId]?.kind === "armor");
  const growth = DATA.knight.growth || {};
  const offhandRate = DATA.knight.dualWield?.offhandDamageRate ?? 0.55;
  const strength = statWithEquipment("strength");
  const agility = statWithEquipment("agility");
  let attackMin = Math.floor(strength / (growth.minAttackDivisor ?? 6)) + itemAttackMin(mainWeaponItem, mainWeapon);
  let attackMax = Math.floor(strength / (growth.maxAttackDivisor ?? 4)) + itemAttackMax(mainWeaponItem, mainWeapon);
  if (offhandWeapon) {
    attackMin += Math.floor(itemAttackMin(offhandItem, offhandWeapon) * offhandRate);
    attackMax += Math.floor(itemAttackMax(offhandItem, offhandWeapon) * offhandRate);
  }
  const attackFlat = equipmentEffectTotal("attackFlat");
  const attackPercent = equipmentEffectTotal("attackPercent") + equipmentEffectTotal("damageIncrease");
  attackMin = Math.floor((attackMin + attackFlat) * (1 + attackPercent));
  attackMax = Math.floor((attackMax + attackFlat) * (1 + attackPercent));
  const armorDefense = armorItems.reduce((sum, it) => sum + itemDefense(it), 0);
  const setDefenseBonus = hasFullSetEquipped() ? Math.floor(armorDefense * 0.1) : 0;
  const defense = Math.floor(agility / (growth.defenseAgilityDivisor ?? 3))
    + armorDefense
    + setDefenseBonus
    + itemDefense(offhandItem, shield)
    + equipmentEffectTotal("defenseFlat");
  const speed = (mainWeapon?.speed || 30) + (offhandWeapon?.speed || 0) + Math.floor(agility / (growth.attackSpeedAgilityDivisor ?? 15)) + equipmentEffectTotal("attackSpeed");
  const success = Math.floor((state.level || 1) * (growth.attackSuccessLevelMultiplier ?? 5)
    + agility * (growth.attackSuccessAgilityMultiplier ?? 3)
    + strength / (growth.attackSuccessStrengthDivisor ?? 4));
  const defenseSuccess = Math.floor(agility / (growth.defenseSuccessAgilityDivisor ?? 3)
    + (shield?.defenseRate || 0)
    + setDefenseBonus
    + equipmentEffectTotal("defenseSuccessRate") * 100);
  const critChance = Math.min(0.7, DATA.battle.critChance + equipmentEffectTotal("critChance"));
  const excellentChance = DATA.battle.excellentChance + equipmentEffectTotal("excellentDamageRate");
  const damageDecrease = equipmentEffectTotal("damageDecrease") + equipmentEffectTotal("damageAbsorb");
  const damageReflect = equipmentEffectTotal("damageReflect");
  const zenBonus = equipmentEffectTotal("zenOnKill");
  const expBonus = equipmentEffectTotal("expBonus");
  const power = attackMax * 4 + defense * 5 + speed * 2 + success + defenseSuccess + state.level * 18;
  return { attackMin, attackMax, defense, speed, success, defenseSuccess, power, critChance, excellentChance, damageDecrease, damageReflect, zenBonus, expBonus };
}

function hasFullSetEquipped() {
  const armorPieces = Object.values(state.equipment || {})
    .map((item) => item && DATA.items[item.itemId])
    .filter((base) => base?.kind === "armor" && ["helm", "armor", "gloves", "pants", "boots"].includes(base.slot));
  if (armorPieces.length < 5) return false;
  const namedSets = armorPieces.map((base) => base.setName || "").filter(Boolean);
  return namedSets.length >= 5 && new Set(namedSets).size === 1;
}

function bindEvents() {
  refs.toggleRun.addEventListener("click", () => setRunning(!state.running));
  refs.openDebugBtn?.addEventListener("click", () => {
    renderDebugPanel();
    refs.debugModal?.classList.remove("hidden");
  });
  refs.closeDebugBtn?.addEventListener("click", () => refs.debugModal?.classList.add("hidden"));
  refs.debugModal?.addEventListener("click", (event) => {
    if (event.target === refs.debugModal) refs.debugModal.classList.add("hidden");
  });
  refs.closeOfflineBtn?.addEventListener("click", () => refs.offlineModal?.classList.add("hidden"));
  refs.offlineModal?.addEventListener("click", (event) => {
    if (event.target === refs.offlineModal) refs.offlineModal.classList.add("hidden");
  });
  refs.offlineModalBody?.addEventListener("click", handleOfflineBagAction);
  refs.offlineSummary?.addEventListener("click", openOfflineModal);
  refs.openSaveBtn?.addEventListener("click", openSaveManager);
  refs.closeSaveBtn?.addEventListener("click", () => refs.saveModal?.classList.add("hidden"));
  refs.saveModal?.addEventListener("click", (event) => {
    if (event.target === refs.saveModal) refs.saveModal.classList.add("hidden");
  });
  refs.openGuideBtn?.addEventListener("click", openEquipmentGuide);
  refs.closeGuideBtn?.addEventListener("click", () => refs.guideModal?.classList.add("hidden"));
  refs.guideModal?.addEventListener("click", (event) => {
    if (event.target === refs.guideModal) refs.guideModal.classList.add("hidden");
  });
  refs.migrateSaveBtn?.addEventListener("click", migrateNewestSave);
  refs.exportSaveBtn?.addEventListener("click", exportCurrentSave);
  refs.importSaveBtn?.addEventListener("click", importCurrentSave);
  refs.cleanupSaveBtn?.addEventListener("click", cleanupLegacySaves);
  refs.openMapBtn.addEventListener("click", () => refs.mapModal.classList.remove("hidden"));
  refs.closeMapBtn.addEventListener("click", () => refs.mapModal.classList.add("hidden"));
  refs.mapModal.addEventListener("click", (event) => {
    if (event.target === refs.mapModal) refs.mapModal.classList.add("hidden");
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") refs.mapModal.classList.add("hidden");
  });
  refs.createKnightBtn.addEventListener("click", () => createKnight(true));
  refs.continueBtn.addEventListener("click", () => createKnight(false));
  document.addEventListener("mouseover", showItemTooltip);
  document.addEventListener("mousemove", moveItemTooltip);
  document.addEventListener("mouseout", hideItemTooltip);
  $("leaveBtn").addEventListener("click", () => setRunning(false));
  $("autoAddBtn").addEventListener("click", autoAddPoints);
  refs.resetPointsBtn?.addEventListener("click", resetStatPoints);
  refs.autoPointsToggle?.addEventListener("change", () => {
    state.autoAssignPoints = refs.autoPointsToggle.checked;
    if (state.autoAssignPoints && state.points > 0) autoAddPoints(false);
    renderAll();
    save();
  });
  refs.autoPointPlan?.querySelectorAll("[data-auto-point]").forEach((input) => {
    input.addEventListener("change", () => {
      state.autoAssignPlan = readAutoAssignPlanFromInputs();
      if (state.autoAssignPoints && state.points > 0) autoAddPoints(false);
      renderAll();
      save();
    });
  });
  $("bestEquipBtn").addEventListener("click", equipBest);
  $("sortBagBtn").addEventListener("click", sortBag);
  document.querySelectorAll("[data-sell-quality]").forEach((btn) => {
    btn.addEventListener("click", () => sellEquipmentByQuality(btn.dataset.sellQuality));
  });
  $("shopBtn").addEventListener("click", () => setRightView("shop"));
  document.querySelectorAll("[data-right-tab]").forEach((btn) => {
    btn.addEventListener("click", () => setRightView(btn.dataset.rightTab));
  });
  document.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.open === "shop" ? "shop" : "bag";
      setRightView(target);
    });
  });
  $("resetBtn").addEventListener("click", resetSave);
  document.querySelectorAll("[data-log]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeLog = btn.dataset.log;
      document.querySelectorAll("[data-log]").forEach((b) => b.classList.toggle("active", b === btn));
      renderLog();
    });
  });
  refs.testTools?.addEventListener("click", handleTestToolsClick);
  refs.testTools?.addEventListener("change", handleTestToolsChange);
  refs.lootOptions?.addEventListener("change", handlePotionSettingsChange);
  window.addEventListener("beforeunload", save);
  setInterval(() => {
    if (state.running) {
      renderRunTime();
      renderSkills();
    }
    save();
  }, 1000);
}

function setRunning(on) {
  if (on && !state.created) createKnight(false);
  state.running = on;
  if (on) {
    runStartedAt = Date.now();
    log("info", `进入 ${DATA.zones[state.zoneId].name}，开始挂机。`, "good");
    log("combat", `进入 ${DATA.zones[state.zoneId].name}，开始挂机。`, "good");
    spawnMonster();
    clearInterval(loopId);
    tickBattle();
    loopId = setInterval(tickBattle, battleIntervalMs());
  } else {
    clearInterval(loopId);
    loopId = 0;
    activeMonster = null;
    activeMonsters = [];
    maxActiveMonsters = 1;
    log("info", "已停止挂机。");
  }
  renderAll();
  save();
}

function resetSave() {
  if (!confirm("确认清空所有 MU Idle 存档并回到创建角色界面？")) return;
  clearInterval(loopId);
  loopId = 0;
  activeMonster = null;
  activeMonsters = [];
  managedSaveKeys().forEach((key) => localStorage.removeItem(key));
  state = defaultState();
  renderAll();
}

function autoEnterFromLauncher() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("autoEnter") !== "1") return;
  state.created = true;
  if (!state.hp) state.hp = maxLife();
  if (!state.mp) state.mp = maxMana();
}

function openSaveManager() {
  renderSaveManager();
  refs.saveModal?.classList.remove("hidden");
}

function openEquipmentGuide() {
  renderEquipmentGuide();
  refs.guideModal?.classList.remove("hidden");
}

function renderEquipmentGuide() {
  if (!refs.guideBody) return;
  const guide = DATA.knightGuide || {};
  const items = Array.isArray(guide.items) ? guide.items : [];
  const summary = guide.summary || {};
  const slots = [["weapon", "武器"], ["shield", "盾牌"], ["helm", "头盔"], ["armor", "铠甲"], ["gloves", "护手"], ["pants", "护腿"], ["boots", "靴子"], ["wing", "翅膀"]];
  const qualities = [["normal", "普通"], ["excellent", "卓越"], ["set", "套装"]];
  const list = items.slice()
    .sort((a, b) => (a.requiredLevel || 0) - (b.requiredLevel || 0) || String(a.name).localeCompare(String(b.name), "zh-Hans-CN"))
    .slice(0, 160);
  refs.guideBody.innerHTML = `
    <div class="guide-summary">
      <div><span>总装备</span><b>${Number(summary.totalItems || items.length).toLocaleString()}</b></div>
      <div><span>武器</span><b>${Number(summary.weapons || 0).toLocaleString()}</b></div>
      <div><span>防具/翅膀</span><b>${Number(summary.armorAndWings || 0).toLocaleString()}</b></div>
      <div><span>图标</span><b>${Number(summary.icons || 0).toLocaleString()}</b></div>
    </div>
    <div class="guide-section"><strong>部位分布</strong><div class="guide-chip-row">${slots.map(([key, label]) => `<span>${label}<b>${Number(summary.slots?.[key] || 0)}</b></span>`).join("")}</div></div>
    <div class="guide-section"><strong>品质分布</strong><div class="guide-chip-row">${qualities.map(([key, label]) => `<span class="guide-q-${key}">${label}<b>${Number(summary.qualities?.[key] || 0)}</b></span>`).join("")}</div></div>
    <div class="guide-section"><strong>成长建议</strong><div class="guide-tip-list">${(guide.progressionTips || []).map((tip) => `<p>${escapeHtml(tip)}</p>`).join("")}</div></div>
    <div class="guide-section">
      <strong>装备索引 <small>显示前 160 件，完整数据已入库</small></strong>
      <div class="guide-item-list">${list.map((item) => equipmentGuideItemHtml(item)).join("")}</div>
    </div>
  `;
}

function equipmentGuideItemHtml(item) {
  const attrs = (item.baseAttributes || []).slice(0, 4).join(" · ");
  const drops = (item.dropMonsters || []).slice(0, 3).join("、");
  return `
    <div class="guide-item guide-q-${escapeAttr(item.quality || "normal")}">
      ${item.icon ? `<span class="guide-item-icon" style="background-image:url('${escapeAttr(item.icon)}')"></span>` : `<span class="guide-item-icon empty"></span>`}
      <div>
        <b>${escapeHtml(item.name || "")}</b>
        <small>${escapeHtml(item.category || item.slot || "")} · ${escapeHtml(item.quality || "normal")}</small>
        <em>${escapeHtml(attrs || "基础属性待整理")}</em>
        ${drops ? `<i>掉落：${escapeHtml(drops)}</i>` : ""}
      </div>
    </div>
  `;
}

function renderSaveManager() {
  if (!refs.saveList) return;
  const saves = listManagedSaves();
  refs.saveList.innerHTML = saves.length ? saves.map((saveInfo) => `
    <div class="save-row ${saveInfo.current ? "current" : ""}">
      <div>
        <b>${escapeHtml(saveInfo.label)}</b>
        <small>${escapeHtml(saveInfo.key)}</small>
      </div>
      <div>
        <span>Lv.${saveInfo.level}</span>
        <span>${saveInfo.gold.toLocaleString()} 金币</span>
        <span>${formatSaveTime(saveInfo.updatedAt)}</span>
      </div>
    </div>
  `).join("") : `<div class="save-empty">没有找到本地存档</div>`;
}

function formatSaveTime(timestamp) {
  if (!timestamp) return "未知时间";
  return new Date(timestamp).toLocaleString("zh-CN");
}

function migrateNewestSave() {
  const saves = listManagedSaves();
  if (!saves.length) return;
  const newest = saves[0];
  localStorage.setItem(SAVE_KEY, JSON.stringify({ ...newest.data, migratedFrom: newest.key, migratedAt: Date.now(), lastSaveAt: Date.now() }));
  state = normalize(JSON.parse(localStorage.getItem(SAVE_KEY)));
  renderAll();
  renderSaveManager();
  log("info", `已将 ${newest.label} 迁移为统一存档。`, "good");
}

function exportCurrentSave() {
  save();
  const raw = localStorage.getItem(SAVE_KEY) || "{}";
  if (refs.saveImportText) {
    refs.saveImportText.value = raw;
    refs.saveImportText.select();
  }
  localStorage.setItem("mu_idle_engine_save_export", raw);
}

function importCurrentSave() {
  const raw = refs.saveImportText?.value?.trim();
  if (!raw) return;
  try {
    const imported = JSON.parse(raw);
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...imported, importedAt: Date.now(), lastSaveAt: Date.now() }));
    state = normalize(imported);
    save();
    renderAll();
    renderSaveManager();
    log("info", "导入存档成功，已设为统一存档。", "good");
  } catch {
    alert("导入失败：存档 JSON 无法解析。");
  }
}

function spawnMonster() {
  activeMonsters = [];
  const count = rnd(1, 5);
  maxActiveMonsters = count;
  refillMonsters(maxActiveMonsters);
  const names = activeMonsters.map((monster) => monster.name);
  log("combat", `怪物从四周靠近：${names.join("、")}。`);
  renderBattleTarget();
  renderDebugPanel();
}

function refillMonsters(targetCount = activeMonsters.length || 1) {
  const zone = DATA.zones[state.zoneId];
  const monsters = zone.monsters.map((id) => DATA.monsterById[id]).filter(Boolean);
  const eligible = monsters.filter((monster) => monster.level <= state.level + 5);
  const target = state.targetMonsterId ? DATA.monsterById[state.targetMonsterId] : null;
  const pool = eligible.length ? eligible : monsters;
  while (activeMonsters.length < targetCount) {
    const base = target && zone.monsters.includes(target.id) ? target : pick(pool);
    activeMonsters.push(createBattleMonster(base));
  }
  activeMonster = activeMonsters[0] || null;
}

function createBattleMonster(base) {
  const attackIntervalMs = Math.floor(DATA.battle.monsterAttackIntervalMs * (0.85 + Math.random() * 0.35));
  return {
    ...base,
    hpNow: base.hp,
    spawnUid: crypto.randomUUID(),
    attackIntervalMs,
    nextAttackAt: Date.now() + scaledMs(attackIntervalMs)
  };
}

function maybeSpawnReinforcement() {
  if (!state.running || activeMonsters.length >= maxActiveMonsters) return;
  const missing = maxActiveMonsters - activeMonsters.length;
  const chance = Math.min(0.55, 0.18 + missing * 0.12);
  if (Math.random() > chance) return;
  const before = activeMonsters.length;
  refillMonsters(before + 1);
  const joined = activeMonsters[activeMonsters.length - 1];
  if (joined) log("combat", `${joined.name} 从战场边缘加入。`);
}

function tickBattle() {
  if (!state.running) return;
  if (!activeMonster || activeMonster.hpNow <= 0) {
    activeMonsters = activeMonsters.filter((monster) => monster.hpNow > 0);
    activeMonster = activeMonsters[0] || null;
  }
  if (!activeMonster) spawnMonster();
  const stats = calcStats();
  const skill = chooseSkill();
  let skillName = "普通攻击";
  let castSkill = null;
  let hitAll = false;

  if (skill) {
    if (skill.type === "buff") {
      if (!spendSkillCost(skill)) return;
      state.buffs[skill.id] = Date.now() + skill.durationMs;
      state.hp = Math.min(maxLife(), state.hp + Math.floor(maxLife() * 0.15));
      log("combat", `释放 ${skill.name}，生命上限提升。`, "good");
      renderAll();
      return;
    }
    if (!spendSkillCost(skill)) {
      skillName = "普通攻击";
    } else {
      castSkill = skill;
      skillName = skill.name;
      hitAll = isAreaSkill(skill);
    }
  }

  const targets = hitAll ? activeMonsters.filter((monster) => monster.hpNow > 0) : [activeMonster].filter(Boolean);
  const results = targets.map((monster) => {
    const luckyHit = Math.random() < stats.critChance;
    const excellentHit = Math.random() < stats.excellentChance;
    const baseRoll = luckyHit ? stats.attackMax : rnd(stats.attackMin, stats.attackMax);
    const hitTone = excellentHit ? "excellent" : luckyHit ? "lucky" : elementalHitTone(castSkill);
    let targetDamage = castSkill ? calcSkillDamage(castSkill, stats, baseRoll) : baseRoll;
    if (state.test.instantKill) targetDamage = monster.hpNow + monster.defense;
    if (excellentHit) targetDamage = Math.floor(targetDamage * 1.2);
    targetDamage = Math.max(1, targetDamage - Math.floor(monster.defense * 0.55));
    monster.hpNow -= targetDamage;
    return { monster, damage: targetDamage, tone: hitTone };
  });
  const totalDamage = results.reduce((sum, result) => sum + result.damage, 0);
  playAttackEffects(castSkill, results);
  results.forEach((result) => showMonsterHit(result.monster, result.damage, result.tone));
  log("combat", hitAll
    ? `${skillName} 命中周围怪物，共造成 ${totalDamage} 伤害。`
    : `${skillName} 命中 ${activeMonster.name}，造成 ${results[0]?.damage || 0} 伤害。`);

  const killed = results.filter((result) => result.monster.hpNow <= 0).map((result) => result.monster);
  killed.forEach(killMonster);
  if (killed.length) {
    activeMonsters = activeMonsters.filter((monster) => monster.hpNow > 0);
    activeMonster = activeMonsters[0] || null;
  }
  const attacks = resolveMonsterAttacks(stats);
  if (attacks.total > 0) {
    state.hp -= attacks.total;
    showHeroHit(attacks.total);
    autoUsePotions();
    log("combat", attacks.count > 1
      ? `怪物连续攻击，合计造成 ${attacks.total} 伤害。`
      : `${attacks.names[0]} 攻击，造成 ${attacks.total} 伤害。`);
    if (state.hp <= 0) {
      setWarriorAction("death", true);
      state.hp = maxLife();
      state.mp = maxMana();
      log("combat", "角色生命耗尽，回城恢复后继续挂机。");
    }
  }

  state.mp = Math.min(maxMana(), state.mp + 1);
  maybeSpawnReinforcement();
  autoUsePotions();
  renderAll();
}

function resolveMonsterAttacks(stats) {
  const now = Date.now();
  return activeMonsters.filter((monster) => monster.hpNow > 0 && now >= (monster.nextAttackAt || 0))
    .reduce((summary, monster) => {
      const rawTaken = rnd(monster.attackMin, monster.attackMax) - Math.floor(stats.defense * 0.45);
      const taken = state.test.noDamage ? 0 : Math.max(1, Math.floor(rawTaken * (1 - stats.damageDecrease)));
      monster.nextAttackAt = now + scaledMs(monster.attackIntervalMs || DATA.battle.monsterAttackIntervalMs);
      const node = refs.monsterSprite?.querySelector(`[data-monster-uid="${monster.spawnUid}"]`);
      if (node) restartClassAnimation(node, "attacking", 260);
      summary.total += taken;
      summary.count += 1;
      summary.names.push(monster.name);
      return summary;
    }, { total: 0, count: 0, names: [] });
}

function isAreaSkill(skill) {
  const text = `${skill.skillType || ""} ${skill.officialEffect || ""}`;
  return /范围|周围|所有|持续/.test(text) && !/单体|单个/.test(text);
}

function elementalHitTone(skill) {
  const text = `${skill?.name || ""} ${skill?.skillType || ""} ${skill?.officialEffect || ""}`;
  if (/雷|电/.test(text)) return "lightning";
  if (/火|焰/.test(text)) return "fire";
  if (/冰|霜/.test(text)) return "ice";
  if (/毒/.test(text)) return "poison";
  if (/风/.test(text)) return "wind";
  return "normal";
}

function spendSkillCost(skill) {
  const manaCost = Number(skill.mana || 0);
  if (state.mp < manaCost) return false;
  state.mp = Math.max(0, state.mp - manaCost);
  if (skill.cooldownMs) state.skillCd[skill.id] = Date.now() + scaledMs(skill.cooldownMs);
  return true;
}

function calcSkillDamage(skill, stats, baseRoll) {
  const physical = baseRoll
    + statWithEquipment("strength") * (skill.strengthScale ?? 0.08)
    + statWithEquipment("agility") * (skill.agilityScale ?? 0.035);
  const flat = skill.flatDamage ?? 0;
  const energyScale = 1 + statWithEquipment("energy") / 1000;
  return Math.floor((physical + flat) * (skill.multiplier || 2) * energyScale);
}

function battleIntervalMs() {
  return Math.max(50, scaledMs(DATA.battle.attackIntervalMs));
}

function scaledMs(ms) {
  return Math.max(1, Math.floor(ms / (state?.test?.speed || 1)));
}

function restartBattleLoop() {
  if (!state.running) return;
  clearInterval(loopId);
  loopId = setInterval(tickBattle, battleIntervalMs());
}

function chooseSkill() {
  const now = Date.now();
  const ordered = DATA.battle.skillOrder.map((id) => DATA.skills.find((skill) => skill.id === id)).filter(Boolean);
  return ordered.find((skill) => {
    if (state.level < skill.requiredLevel || state.mp < skill.mana) return false;
    if ((state.skillCd[skill.id] || 0) > now) return false;
    if (skill.type === "buff" && (state.buffs[skill.id] || 0) > now + 10000) return false;
    return true;
  });
}

function createKnight(reset) {
  if (reset) state = defaultState();
  state.created = true;
  state.hp = maxLife();
  state.mp = maxMana();
  log("info", "剑士已进入勇者大陆，选择挂机点后可以开始挂机。", "good");
  renderAll();
  save();
}

window.muIdleEnterGame = function muIdleEnterGame(reset = false) {
  createKnight(Boolean(reset));
};

function autoUsePotions() {
  autoUsePotionType("hp");
  autoUsePotionType("mp");
}

function autoUsePotionType(type) {
  const settings = state.potion || {};
  const isHp = type === "hp";
  if (isHp && !settings.autoHp) return;
  if (!isHp && !settings.autoMp) return;
  const max = isHp ? maxLife() : maxMana();
  const current = isHp ? state.hp : state.mp;
  const threshold = clamp(Number(isHp ? settings.hpPercent : settings.mpPercent) || (isHp ? 35 : 25), 1, 99);
  if (current > max * threshold / 100) return;
  const idx = state.inventory.findIndex((item) => {
    const base = DATA.items[item.itemId];
    if (base?.kind !== "potion" || item.count <= 0) return false;
    const text = `${item.name} ${item.itemId}`.toLowerCase();
    return isHp ? /heal|治疗|生命/.test(text) : /mana|魔法/.test(text);
  });
  if (idx < 0) return;
  const item = state.inventory[idx];
  item.count -= 1;
  if (isHp) {
    state.hp = Math.min(maxLife(), state.hp + Math.floor(maxLife() * 0.35));
  } else {
    state.mp = Math.min(maxMana(), state.mp + Math.floor(maxMana() * 0.35));
  }
  state.potionsUsed += 1;
  if (item.count <= 0) state.inventory.splice(idx, 1);
  log("combat", `${isHp ? "生命" : "魔法"}过低，自动使用${isHp ? "治疗" : "魔法"}药水。`, "good");
}

function killMonster(monster) {
  showMonsterDeath(monster);
  state.kills += 1;
  const reward = monsterRewards(monster);
  const stats = calcStats();
  const exp = Math.floor((monster.exp ?? reward.exp) * (1 + (stats.expBonus || 0)));
  state.exp += exp;
  const gold = (Number.isFinite(monster.goldMin) && Number.isFinite(monster.goldMax)) ? rnd(monster.goldMin, monster.goldMax) : reward.gold;
  const bonusGold = Math.floor(gold * (stats.zenBonus || 0));
  state.gold += gold + bonusGold;
  if (gold || bonusGold) showBattleCoins(monster);
  applyKillRecovery();
  state.rewards.exp += exp;
  state.rewards.gold += gold + bonusGold;
  const rewardText = gold || exp ? `击杀 ${monster.name}，获得 ${exp} 经验、${gold} 金币。` : `击杀 ${monster.name}。`;
  log("info", rewardText);
  log("combat", rewardText, "good");
  rollDrops(monster);
  let leveled = false;
  while (state.exp >= expToNext()) {
    state.exp -= expToNext();
    state.level += 1;
    state.points += DATA.knight.growth.pointsPerLevel;
    leveled = true;
    log("info", `等级提升到 Lv.${state.level}，获得 ${DATA.knight.growth.pointsPerLevel} 属性点。`, "good");
  }
  if (leveled && state.autoAssignPoints) autoAddPoints(false);
  if (leveled) {
    state.hp = maxLife();
    state.mp = maxMana();
  }
}

function monsterRewards(monster) {
  return {
    exp: Math.max(1, Math.floor(monster.level * 4 + monster.hp / 8)),
    gold: Math.max(1, Math.floor(monster.level * 3 + monster.hp / 10))
  };
}

function rollDrops(monster) {
  if (DATA.dropRates?.rarityWeights?.length) {
    rollConfiguredDrops(monster);
    return;
  }
  const table = [...(DATA.drops.default || []), ...(DATA.drops[monster.id] || [])];
  table.forEach((drop) => {
    if (typeof drop.chance !== "number") return;
    if (Math.random() > drop.chance) return;
    if (drop.type === "item") {
      const base = DATA.items[drop.itemId];
      if (!base || !passesLoot(base)) return;
      const quality = base.kind === "weapon" || base.kind === "armor"
        ? (Math.random() < DATA.battle.excellentChance ? "excellent" : base.quality)
        : base.quality;
      const count = base.stack ? rnd(drop.min || 1, drop.max || 1) : 1;
      const item = makeItem(drop.itemId, { quality, count });
      const addResult = item ? addInventory(item) : false;
      showBattleDrop(item, addResult);
      if (item && addResult) {
        if (base.kind === "jewel") state.rewards.jewels += count;
        if (base.kind === "weapon" || base.kind === "armor") state.rewards.equip += 1;
        if (addResult !== "sold") logHtml("info", `获得 ${itemLabelHtml(item)}。`, `获得 ${itemLabel(item)}。`, quality === "excellent" || base.kind === "jewel" ? "rare" : "good");
      }
    }
  });
}

function rollConfiguredDrops(monster) {
  state.dropPity.jewelKills = (state.dropPity.jewelKills || 0) + 1;
  const forced = state.test.forceRare;
  const bossDrop = isBossMonster(monster);
  if (forced && state.loot.set) {
    dropEquipmentByQuality(monster, "set", { bossDrop });
  }
  const hasExcellentPool = equipmentPoolFor(monster, "excellent").length > 0;
  if ((forced && hasExcellentPool) || Math.random() < officialExcellentDropChance(monster)) {
    dropEquipmentByQuality(monster, "excellent", { bossDrop });
  } else if (forced || Math.random() < officialNormalEquipmentDropChance(monster)) {
    dropEquipmentByQuality(monster, "normal", { bossDrop });
  }
  if (forced || weightedRarityForMap(monster.map) === "jewel") {
    dropMapMaterial(monster, true);
  }
  if (state.dropPity.jewelKills >= 1200) {
    state.dropPity.jewelKills = 0;
    dropMapMaterial(monster, true, "宝石计数保底");
  }
}

function isBossMonster(monster) {
  const text = `${monster?.name || ""} ${monster?.officialDropText || ""}`;
  return /BOSS|鐜媩鍚巪宸存礇鍏媩甯岀壒鎷墊鑿插凹鏂瘄鏄嗛】|鐐界値榄攟鎴堢櫥/.test(text);
}

function officialNormalEquipmentDropChance(monster) {
  const level = Number(monster?.level || 1);
  const base = 0.22 + Math.floor(level / 10) * 0.005;
  return Math.min(isBossMonster(monster) ? base * 8 : base, 0.90);
}

function officialExcellentDropChance(monster) {
  if (!equipmentPoolFor(monster, "excellent").length) return 0;
  return isBossMonster(monster) ? 0.005 : 0.00025;
}

function rollDroppedEnhanceLevel(monster) {
  const highWeight = isBossMonster(monster) ? 20 : 10;
  const group = weightedPick([
    { value: "zero", weight: 62 },
    { value: "low", weight: 28 },
    { value: "high", weight: highWeight }
  ]);
  if (group === "low") return rnd(1, 3);
  if (group === "high") return rnd(4, 7);
  return 0;
}

function weightedRarityForMap(mapName) {
  const row = dropRateForMap(mapName);
  if (!row?.weights) return null;
  const entries = Object.entries(row.weights).filter(([, weight]) => Number(weight) > 0);
  const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
  if (!total) return null;
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= Number(weight);
    if (roll <= 0) return key;
  }
  return entries[entries.length - 1]?.[0] || null;
}

function dropRateForMap(mapName) {
  const rows = DATA.dropRates?.rarityWeights || [];
  const group = dropRateGroupForMap(mapName);
  return rows.find((row) => row.map === mapName || row.map === group)
    || rows.find((row) => mapName.includes(row.map) || row.map.includes(mapName) || row.map.includes(group))
    || rows[0];
}

function dropRateGroupForMap(mapName) {
  if (mapName.includes("失落之塔")) {
    const floor = Number((mapName.match(/(\d+)/) || [])[1] || 1);
    return floor <= 3 ? "失落之塔1-3层" : "失落之塔4-7层";
  }
  if (mapName.includes("地下城")) return "勇者大陆";
  if (mapName.includes("幻术园")) return "勇者大陆";
  if (mapName.includes("幽暗森林")) return "卡利玛神庙";
  if (mapName.includes("死亡沙漠")) return "冰霜之城";
  if (mapName.includes("天空之城")) return "冰霜之城";
  return mapName;
}

function dropEquipmentByQuality(monster, quality, extra = {}) {
  if (!state.loot.equipment) return;
  if (quality === "excellent" && !state.loot.excellent) return;
  if (quality === "set" && !state.loot.set) return;
  const tableEntries = equipmentDropEntriesFor(monster, quality);
  const pool = tableEntries.length
    ? tableEntries.map((entry) => DATA.items[entry.itemId]).filter((item) => isEquipment(item))
    : equipmentPoolFor(monster, quality);
  const base = pick(pool);
  if (!base) return;
  const item = makeItem(base.id, { quality, level: rollDroppedEnhanceLevel(monster), ...extra });
  const addResult = item ? addInventory(item) : false;
  showBattleDrop(item, addResult);
  if (!item || !addResult) return;
  state.rewards.equip += 1;
  if (addResult === "sold") return;
  const tone = ["excellent", "set", "epic", "mythic"].includes(quality) ? "rare" : "good";
        if (addResult !== "sold") logHtml("info", `获得 ${itemLabelHtml(item)}。`, `获得 ${itemLabel(item)}。`, quality === "excellent" || base.kind === "jewel" ? "rare" : "good");
  logHtml("combat", `掉落 ${itemLabelHtml(item)}。`, `掉落 ${itemLabel(item)}。`, tone);
}

function addOfflineEquipmentByQuality(monster, quality, summary, extra = {}) {
  if (!state.loot.equipment) return false;
  if (quality === "excellent" && !state.loot.excellent) return false;
  if (quality === "set" && !state.loot.set) return false;
  const tableEntries = equipmentDropEntriesFor(monster, quality);
  const pool = tableEntries.length
    ? tableEntries.map((entry) => DATA.items[entry.itemId]).filter((item) => isEquipment(item))
    : equipmentPoolFor(monster, quality);
  const base = pick(pool);
  if (!base) return false;
  const item = makeItem(base.id, { quality, level: rollDroppedEnhanceLevel(monster), ...extra });
  if (!item) return false;
  addOfflinePendingItem(item);
  summary.equipment += 1;
  summary.byQuality[quality] = (summary.byQuality[quality] || 0) + 1;
  if (summary.items.length < 8) summary.items.push(itemLabel(item));
  return true;
}

function addOfflineMaterial(monster, summary, reason = "") {
  if (!state.loot.jewel) return false;
  const materials = eligibleMaterials(monster.map);
  if (!materials.length) return false;
  const material = weightedMaterialPick(materials);
  const base = findItemByName(material.name);
  if (!base) return false;
  const item = makeItem(base.id, { count: 1 });
  if (!item) return false;
  addOfflinePendingItem(item);
  summary.jewels += 1;
  if (summary.items.length < 8) summary.items.push(`${reason ? `${reason}：` : ""}${itemLabel(item)}`);
  return true;
}

function addOfflinePendingItem(item) {
  state.offlinePendingItems = state.offlinePendingItems || [];
  const base = DATA.items[item.itemId];
  const maxStack = itemMaxStack(item, base);
  if (maxStack > 1) {
    const signature = stackSignature(item);
    let remaining = Number(item.count || 1);
    while (remaining > 0) {
      const existing = state.offlinePendingItems.find((it) => stackSignature(it) === signature && (it.count || 1) < maxStack);
      if (!existing) {
        const moved = Math.min(remaining, maxStack);
        state.offlinePendingItems.push(hydrateItemIcon({ ...item, uid: crypto.randomUUID(), count: moved }));
        remaining -= moved;
      } else {
        const moved = Math.min(remaining, maxStack - (existing.count || 1));
        existing.count = (existing.count || 1) + moved;
        remaining -= moved;
      }
    }
    return true;
  }
  state.offlinePendingItems.push(hydrateItemIcon({ ...item, uid: item.uid || crypto.randomUUID(), count: 1 }));
  return true;
}

function rollOfflineDrops(monsters, kills) {
  const summary = { equipment: 0, jewels: 0, byQuality: {}, items: [] };
  if (!kills || !monsters.length) return summary;
  const forced = state.test.forceRare;
  for (let i = 0; i < kills; i += 1) {
    const monster = monsters[i % monsters.length];
    state.dropPity.jewelKills = (state.dropPity.jewelKills || 0) + 1;
    const bossDrop = isBossMonster(monster);
    const hasExcellentPool = equipmentPoolFor(monster, "excellent").length > 0;
    if (forced && state.loot.set) {
      addOfflineEquipmentByQuality(monster, "set", summary, { bossDrop });
    }
    if ((forced && hasExcellentPool) || Math.random() < officialExcellentDropChance(monster)) {
      addOfflineEquipmentByQuality(monster, "excellent", summary, { bossDrop });
    } else if (forced || Math.random() < officialNormalEquipmentDropChance(monster)) {
      addOfflineEquipmentByQuality(monster, "normal", summary, { bossDrop });
    }
    if (forced || weightedRarityForMap(monster.map) === "jewel") {
      addOfflineMaterial(monster, summary);
    }
    if (state.dropPity.jewelKills >= 1200) {
      state.dropPity.jewelKills = 0;
      addOfflineMaterial(monster, summary, "宝石计数保底");
    }
  }
  return summary;
}

function equipmentPoolFor(monster, quality) {
  const tablePool = equipmentDropEntriesFor(monster, quality)
    .map((entry) => DATA.items[entry.itemId])
    .filter((item) => isEquipment(item));
  if (tablePool.length) return uniqueItemsById(tablePool);

  const all = Object.values(DATA.items).filter((item) => isEquipment(item));
  const mapItems = all.filter((item) => itemMatchesMap(item, monster.map));
  const byMap = mapItems.length ? mapItems : all;
  const levelLimit = quality === "excellent" ? monster.level - 20 : monster.level + 10;
  const byLevel = byMap.filter((item) => !item.dropLevel || item.dropLevel <= levelLimit);
  const qualityPool = byLevel.length ? byLevel : byMap.length ? byMap : all;
  if (quality === "excellent") return byLevel;
  if (quality === "normal") return qualityPool.filter((item) => (item.quality || "normal") === "normal");
  if (quality === "set") {
    const setPool = qualityPool.filter((item) => item.setId || item.quality === "set");
    if (setPool.length) return setPool;
  }
  if (quality === "epic" || quality === "mythic") {
    const highPool = qualityPool.filter((item) => (item.requiredLevel || 0) >= 100 || (item.officialEffect && item.officialEffect !== "无"));
    if (highPool.length) return highPool;
  }
  return qualityPool;
}

function equipmentDropEntriesFor(monster, quality) {
  const entries = DATA.drops?.[monster?.id] || [];
  const filtered = entries.filter((drop) => {
    if (drop?.type !== "item") return false;
    const base = DATA.items[drop.itemId];
    if (!isEquipment(base)) return false;
    const dropQuality = drop.quality || base.quality || "normal";
    if (quality === "excellent") return dropQuality === "excellent";
    if (quality === "set") return dropQuality === "set" || base.setId || base.quality === "set";
    if (quality === "normal") return dropQuality === "normal";
    return dropQuality === quality;
  });
  return uniqueDropEntries(filtered);
}

function uniqueDropEntries(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = `${entry.itemId}|${entry.quality || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueItemsById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item?.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function isEquipment(item) {
  return item?.kind === "weapon" || item?.kind === "armor" || item?.kind === "guardian" || item?.kind === "accessory";
}

function itemForCurrentClass(item) {
  return true;
}

function currentClassAliases() {
  const names = [DATA.knight.name, DATA.knight.muName, "剑士", "鍓戝＋", "Dark Knight", "DK"].filter(Boolean);
  if (names.some((name) => String(name).includes("鍓戝＋") || String(name).includes("Dark Knight"))) {
    names.push("剑士", "楠戝＋", "鍓戝＋绯", "鎴樺＋");
  }
  return names.map(normalizeClassName).filter(Boolean);
}

function normalizeClassName(value) {
  return String(value || "").replace(/[\s/，、]+/g, "").toLowerCase();
}

function classMatchesCurrent(cls) {
  const normalized = normalizeClassName(cls);
  if (!normalized) return false;
  return currentClassAliases().some((name) => normalized === name || normalized.includes(name) || name.includes(normalized));
}

function itemMatchesMap(item, mapName) {
  return (item.dropMaps || []).some((dropMap) => {
    if (dropMap === "鍏ㄥ湴鍥炬€墿鎺夎惤") return true;
    return dropMap === mapName || dropMap.includes(mapName) || mapName.includes(dropMap);
  });
}

function dropMapMaterial(monster, useWeightPick = false, reason = "") {
  if (!state.loot.jewel) return;
  const materials = eligibleMaterials(monster.map);
  if (!materials.length) return;
  const material = useWeightPick ? weightedMaterialPick(materials) : pick(materials);
  const base = findItemByName(material.name);
  if (!base) return;
  const item = makeItem(base.id, { count: 1 });
  const addResult = item ? addInventory(item) : false;
  showBattleDrop(item, addResult);
  if (!item || !addResult) return;
  state.rewards.jewels += 1;
  if (addResult === "sold") return;
  const prefix = reason ? `${escapeHtml(reason)}：` : "";
  const text = `获得 ${reason ? `${reason}：` : ""}${itemLabel(item)}。`;
  if (addResult !== "sold") logHtml("info", `获得 ${itemLabelHtml(item)}。`, `获得 ${itemLabel(item)}。`, base.kind === "jewel" ? "rare" : "good");
  logHtml("combat", `获得 ${prefix}${itemLabelHtml(item)}。`, text, "rare");
}

function eligibleMaterials(mapName) {
  const mapRank = mapProgressRank(mapName);
  return (DATA.dropRates?.materials || []).filter((material) => {
    const maps = material.maps || "";
    if (maps === "全地图" || maps.includes(mapName) || mapName.includes(maps.replace("及以上地图", ""))) return true;
    const gate = maps.replace("及以上地图", "");
    return maps.includes("及以上地图") && mapRank >= mapProgressRank(gate);
  });
}

function mapProgressRank(mapName = "") {
  const groups = [
    ["勇者大陆", "仙踪林", "幻术园", "地下城", "鍕囪€呭ぇ闄", "浠欒釜鏋", "骞绘湳鍥", "鍦颁笅鍩"],
    ["冰风谷", "鍐伴璋"],
    ["澶辫惤涔嬪"],
    ["亚特兰蒂斯", "浜氱壒鍏拌拏鏂"],
    ["姝讳骸娌欐紶", "澶╃┖涔嬪煄"],
    ["卡利玛神庙", "鍗″埄鐜涚搴"],
    ["骞芥殫妫灄", "鍐伴湝涔嬪煄"]
  ];
  const index = groups.findIndex((names) => names.some((name) => mapName.includes(name)));
  return index < 0 ? 0 : index;
}

function weightedMaterialPick(materials) {
  const total = materials.reduce((sum, material) => sum + Number(material.smallMonsterChance || 0), 0);
  if (!total) return pick(materials);
  let roll = Math.random() * total;
  for (const material of materials) {
    roll -= Number(material.smallMonsterChance || 0);
    if (roll <= 0) return material;
  }
  return materials[materials.length - 1];
}

function findItemByName(name) {
  return Object.values(DATA.items).find((item) => item.name === name)
    || Object.values(DATA.items).find((item) => item.name.includes(name) || name.includes(item.name));
}

function passesLoot(base) {
  if (base.kind === "jewel") return state.loot.jewel;
  if (base.kind === "potion") return state.loot.material;
  if (base.quality === "excellent") return state.loot.excellent;
  if (isEquipment(base)) return state.loot.equipment;
  return true;
}

function equipmentEffectTotal(effect, st = state) {
  const itemTotal = Object.values(st.equipment || {}).reduce((sum, item) => sum + equipmentEffectValue(item, effect, st), 0);
  return itemTotal + setBonusEffectTotal(effect, st);
}

function equipmentEffectValue(item, effect, st = state) {
  if (!item) return 0;
  let value = 0;
  const ids = normalizeExcellentOptionIds(item, DATA.items[item.itemId] || {});
  if (effect === "critChance" && item.luck) value += 0.05;
  if (effect === "soulJewelSuccessRate" && item.luck) value += 0.25;
  const base = DATA.items[item.itemId] || {};
  ids.forEach((id) => {
    const option = excellentOptionMeta(id, base);
    if (option?.effect === effect) value += excellentOptionValue(option, st);
  });
  if (effect === "lifeFlat") value += Number(base.lifeBonus || base.vitalityBonus || 0);
  if (effect === "manaFlat") value += Number(base.manaBonus || 0);
  if (effect === "attackFlat") value += Number(base.attackBonus || 0);
  if (effect === "damageIncrease") value += Number(base.damageIncrease || 0) / 100;
  if (effect === "damageAbsorb") value += Number(base.damageAbsorb || 0) / 100;
  (base.effects || []).forEach((entry) => {
    if (entry?.effect === effect) value += Number(entry.value || 0);
  });
  (item.affixes || []).forEach((affix) => {
    if (affix.effect === effect) value += Number(affix.value || 0);
  });
  return value;
}

function setBonusEffectTotal(effect, st = state) {
  return activeSetBonuses(st).reduce((sum, bonus) => {
    return sum + (bonus.affixes || []).reduce((inner, affix) => {
      if (affix.effect !== effect) return inner;
      return inner + Number(affix.value ?? DATA.affixes?.[affix.affixId]?.defaultValue ?? 0);
    }, 0);
  }, 0);
}

function activeSetBonuses(st = state) {
  const counts = equippedSetCounts(st);
  return Object.entries(counts).flatMap(([setId, count]) => {
    const set = DATA.sets?.[setId];
    if (!set) return [];
    return (set.bonuses || []).filter((bonus) => count >= Number(bonus.requiredPieces || 0));
  });
}

function equippedSetCounts(st = state) {
  return Object.values(st.equipment || {}).reduce((counts, item) => {
    const setId = DATA.items[item?.itemId]?.setId;
    if (setId) counts[setId] = (counts[setId] || 0) + 1;
    return counts;
  }, {});
}

function applyKillRecovery() {
  const equippedItems = Object.values(state.equipment || {}).filter(Boolean);
  const hasLifeRecovery = equippedItems.some((item) => (item.excellentOptionIds || [])
    .some((id) => excellentOptionMeta(id, DATA.items[item.itemId])?.effect === "lifeOnKill"));
  const hasManaRecovery = equippedItems.some((item) => (item.excellentOptionIds || [])
    .some((id) => excellentOptionMeta(id, DATA.items[item.itemId])?.effect === "manaOnKill"));
  if (hasLifeRecovery) state.hp = Math.min(maxLife(), state.hp + Math.max(1, Math.floor(maxLife() / 8)));
  if (hasManaRecovery) state.mp = Math.min(maxMana(), state.mp + Math.max(1, Math.floor(maxMana() / 8)));
}

function addInventory(item, allowAutoSell = true) {
  if (!item) return false;
  const base = DATA.items[item.itemId];
  if (allowAutoSell && shouldAutoSell(item, base)) {
    const price = sellPrice(item);
    state.gold += price;
  log("info", `出售 ${item.name}，获得 ${price} 金币。`, "good");
    return "sold";
  }
  const maxStack = itemMaxStack(item, base);
  if (maxStack > 1) {
    const signature = stackSignature(item);
    const existing = state.inventory.find((it) => stackSignature(it) === signature && (it.count || 1) < maxStack);
    if (existing) {
      const room = maxStack - (existing.count || 1);
      const moved = Math.min(room, item.count || 1);
      existing.count += moved;
      item.count -= moved;
      if (item.count <= 0) return true;
    }
  }
  if (state.inventory.length >= 64 && state.loot.autoSellNormal) sellNormalEquipment(false);
  if (state.inventory.length >= 64) {
    log("info", `背包已满，无法拾取 ${item.name}。`);
    return false;
  }
  state.inventory.push(item);
  return true;
}

function itemMaxStack(item, base = DATA.items[item.itemId]) {
  if (isEquipment(base)) return 1;
  if (base?.stack) return base.stack;
  return 1;
}

function stackSignature(item) {
  const options = Array.isArray(item.excellentOptions) ? [...item.excellentOptions].sort().join("|") : "";
  const affixes = Array.isArray(item.affixes) ? item.affixes.map((entry) => `${entry.affixId}:${entry.value}`).sort().join("|") : "";
  return [
    item.itemId,
    item.quality || "",
    item.level || 0,
    item.additionalLevel || 0,
    item.luck ? 1 : 0,
    options,
    affixes,
    item.regenerationOption || "",
    item.elementOption || "",
    item.socketOption || "",
    item.pvpOption || ""
  ].join("::");
}

function mergeStackedInventory(items) {
  const merged = [];
  items.forEach((raw) => {
    const item = { ...raw, uid: raw.uid || crypto.randomUUID(), count: Math.max(1, Number(raw.count) || 1) };
    const maxStack = itemMaxStack(item);
    if (maxStack <= 1) {
      const count = Math.max(1, Number(item.count) || 1);
      for (let i = 0; i < count; i += 1) merged.push({ ...item, uid: i === 0 ? item.uid : crypto.randomUUID(), count: 1 });
      return;
    }
    let left = item.count;
    while (left > 0) {
      const existing = merged.find((it) => stackSignature(it) === stackSignature(item) && (it.count || 1) < maxStack);
      if (!existing) {
        const moved = Math.min(left, maxStack);
        merged.push({ ...item, uid: crypto.randomUUID(), count: moved });
        left -= moved;
      } else {
        const moved = Math.min(left, maxStack - (existing.count || 1));
        existing.count = (existing.count || 1) + moved;
        left -= moved;
      }
    }
  });
  return merged;
}

function shouldAutoSell(item, base = DATA.items[item.itemId]) {
  const settings = state.loot.autoSell || {};
  if (isEquipment(base)) return Boolean(settings[item.quality]);
  if (base.kind === "jewel") return Boolean(settings.jewel);
  if (base.kind === "potion") return Boolean(settings.potion || settings.material);
  if (base.kind === "material") return Boolean(settings.material);
  return false;
}

function itemLabelLegacy(item) {
  const level = item.level ? ` +${item.level}` : "";
  const count = item.count > 1 ? ` x${item.count}` : "";
  return `${displayItemName(item)}${level}${count}`;
}

function itemLabel(item) {
  const level = item.level ? ` +${item.level}` : "";
  const count = item.count > 1 ? ` x${item.count}` : "";
  return `${displayItemName(item)}${level}${count}`;
}

function itemLabelHtml(item) {
  const base = DATA.items[item.itemId];
  const quality = dropVisualQuality(item, base);
  return `<span class="log-item log-${quality}">${escapeHtml(itemLabel(item))}</span>`;
}

function log(type, text, tone = "") {
  state.logs[type].unshift({ text, tone, html: "", time: new Date().toLocaleTimeString() });
  state.logs[type] = state.logs[type].slice(0, 80);
  if (activeLog === type) renderLog();
}

function logHtml(type, html, text, tone = "") {
  state.logs[type].unshift({ text, html, tone, time: new Date().toLocaleTimeString() });
  state.logs[type] = state.logs[type].slice(0, 80);
  if (activeLog === type) renderLog();
}

function showNotice(text, tone = "info") {
  const node = document.createElement("div");
  node.className = `ui-notice ${tone}`;
  node.textContent = text;
  document.body.appendChild(node);
  window.setTimeout(() => node.classList.add("show"), 20);
  window.setTimeout(() => {
    node.classList.remove("show");
    window.setTimeout(() => node.remove(), 220);
  }, 1800);
}

function notifyInfo(text, tone = "info") {
  log("info", text, tone);
  showNotice(text, tone);
}

function showHit(damage) {
  refs.floatText.textContent = damage;
  refs.floatText.classList.remove("show");
  refs.slash.classList.remove("hit");
  void refs.floatText.offsetWidth;
  refs.floatText.classList.add("show");
  refs.slash.classList.add("hit");
}

function initWarriorModel() {
  const root = document.querySelector(".fighter.knight");
  const sprite = root?.querySelector(":scope > span");
  if (!root || !sprite) return;
  Object.values(WARRIOR_ANIMS).forEach((anim) => {
    const image = new Image();
    image.src = anim.src;
  });
  warriorModel = {
    root,
    sprite,
    action: "idle",
    frame: 0,
    lastFrameAt: 0,
    lockedUntil: 0,
    frameSize: 168,
    raf: 0
  };
  setWarriorAction("idle", true);
  warriorModel.raf = requestAnimationFrame(updateWarriorModel);
}

function setWarriorAction(action, force = false) {
  if (!warriorModel || !WARRIOR_ANIMS[action]) return;
  const now = Date.now();
  if (!force && now < warriorModel.lockedUntil) return;
  warriorModel.action = action;
  warriorModel.frame = 0;
  warriorModel.lastFrameAt = 0;
  const anim = WARRIOR_ANIMS[action];
  const duration = anim.loop ? 0 : Math.ceil(anim.frames * 1000 / anim.fps);
  warriorModel.lockedUntil = anim.loop ? 0 : now + duration;
  warriorModel.root.classList.remove(...Object.values(WARRIOR_ACTION_CLASS));
  const actionClass = WARRIOR_ACTION_CLASS[action];
  if (actionClass) warriorModel.root.classList.add(actionClass);
  applyWarriorFrame();
}

function updateWarriorModel(time) {
  if (!warriorModel) return;
  const anim = WARRIOR_ANIMS[warriorModel.action] || WARRIOR_ANIMS.idle;
  if (!warriorModel.lastFrameAt) warriorModel.lastFrameAt = time;
  const frameMs = 1000 / anim.fps;
  if (time - warriorModel.lastFrameAt >= frameMs) {
    warriorModel.frame += 1;
    if (warriorModel.frame >= anim.frames) {
      if (anim.loop) {
        warriorModel.frame = 0;
      } else if (anim.holdLast) {
        warriorModel.frame = anim.frames - 1;
      } else {
        setWarriorAction("idle", true);
      }
    }
    warriorModel.lastFrameAt = time;
    applyWarriorFrame();
  }
  warriorModel.raf = requestAnimationFrame(updateWarriorModel);
}

function applyWarriorFrame() {
  if (!warriorModel) return;
  const anim = WARRIOR_ANIMS[warriorModel.action] || WARRIOR_ANIMS.idle;
  warriorModel.sprite.style.backgroundImage = `url("${anim.src}")`;
  warriorModel.sprite.style.backgroundSize = `${anim.frames * 100}% 100%`;
  warriorModel.sprite.style.backgroundPosition = `-${warriorModel.frame * warriorModel.frameSize}px 0`;
}

function attackVisualAction(skill, results = []) {
  if (skill) return "skill";
  return results.some((result) => result.tone === "lucky" || result.tone === "excellent") ? "heavy" : "attack";
}

function playAttackEffects(skill, results = []) {
  const field = $("battlefield");
  const hero = document.querySelector(".fighter.knight");
  const target = results.find((result) => result.monster?.spawnUid)?.monster;
  const targetNode = target ? refs.monsterSprite?.querySelector(`[data-monster-uid="${target.spawnUid}"]`) : null;
  const point = battleNodeCenter(targetNode, field) || { x: field?.clientWidth * 0.6 || 0, y: field?.clientHeight * 0.45 || 0 };
  const heroAction = attackVisualAction(skill, results);
  const heroClass = WARRIOR_ACTION_CLASS[heroAction] || "attack";
  setWarriorAction(heroAction);
  if (hero) restartClassAnimation(hero, heroClass, heroAction === "skill" ? 700 : heroAction === "heavy" ? 580 : 420);
  if (targetNode) restartClassAnimation(targetNode, "hit", 280);
  if (refs.slash) {
    refs.slash.style.setProperty("--fx-x", `${point.x}px`);
    refs.slash.style.setProperty("--fx-y", `${point.y}px`);
    refs.slash.classList.remove("hit");
    void refs.slash.offsetWidth;
    refs.slash.classList.add("hit");
  }
}

function restartClassAnimation(node, className, duration) {
  node.classList.remove(className);
  void node.offsetWidth;
  node.classList.add(className);
  window.setTimeout(() => node.classList.remove(className), duration);
}

function battleNodeCenter(node, field = $("battlefield")) {
  if (!node || !field) return null;
  const nodeRect = node.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  return {
    x: nodeRect.left + nodeRect.width / 2 - fieldRect.left,
    y: nodeRect.top + nodeRect.height / 2 - fieldRect.top
  };
}

function showBattleDrop(item, addResult) {
  if (!item || !refs.dropLayer) return;
  const base = DATA.items[item.itemId];
  const quality = dropVisualQuality(item, base);
  const node = document.createElement("div");
  node.className = `battle-drop drop-${quality}${addResult ? " pickup" : " blocked"}`;
  const icon = itemIconUrl(item, base);
  node.innerHTML = `
    <span class="drop-beam"></span>
    ${icon ? `<span class="drop-icon" style="background-image:url('${escapeAttr(icon)}')"></span>` : `<span class="drop-orb"></span>`}
    <b>${escapeHtml(itemLabel(item))}</b>
  `;
  refs.dropLayer.appendChild(node);
  window.setTimeout(() => node.remove(), addResult ? 1300 : 1700);
}

function dropVisualQuality(item, base) {
  if (base?.kind === "jewel") return "jewel";
  if (["mythic", "epic", "set", "excellent"].includes(item.quality)) return item.quality;
  if (item.quality === "blue") return "blue";
  return "normal";
}

function setRightView(view) {
  document.querySelectorAll("[data-right-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.rightTab === view);
  });
  document.querySelectorAll("[data-right-view]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.rightView === view);
  });
}

function defaultAutoAssignPlan() {
  return { strength: 3, agility: 1, vitality: 1, energy: 0 };
}

function normalizeAutoAssignPlan(plan = defaultAutoAssignPlan()) {
  const next = {};
  ["strength", "agility", "vitality", "energy"].forEach((stat) => {
    next[stat] = clamp(Math.floor(Number(plan?.[stat]) || 0), 0, 5);
  });
  const total = Object.values(next).reduce((sum, value) => sum + value, 0);
  next.strength = clamp(next.strength + (5 - total), 0, 5);
  let overflow = Object.values(next).reduce((sum, value) => sum + value, 0) - 5;
  ["energy", "vitality", "agility", "strength"].forEach((stat) => {
    if (overflow <= 0) return;
    const cut = Math.min(overflow, next[stat]);
    next[stat] -= cut;
    overflow -= cut;
  });
  return next;
}

function autoAssignStatOrder() {
  const plan = normalizeAutoAssignPlan(state.autoAssignPlan);
  return ["strength", "agility", "vitality", "energy"]
    .flatMap((stat) => Array.from({ length: plan[stat] }, () => stat));
}

function autoAddPoints(shouldRender = true) {
  const order = autoAssignStatOrder();
  if (!order.length) return;
  while (state.points > 0) {
    state.stats[order[state.points % order.length]] += 1;
    state.points -= 1;
  }
  state.hp = maxLife();
  state.mp = maxMana();
  if (shouldRender) {
    renderAll();
    save();
  }
}

function resetStatPoints() {
  const baseStats = DATA.knight.baseStats || {};
  const earnedPoints = totalEarnedStatPoints();
  state.stats = { ...baseStats };
  state.points = earnedPoints;
  state.hp = maxLife();
  state.mp = maxMana();
  if (state.autoAssignPoints) autoAddPoints(false);
  log("info", `已洗点，返还 ${earnedPoints} 点属性。`, "good");
  renderAll();
  save();
}

function totalEarnedStatPoints() {
  return Math.max(0, (state.level - (DATA.knight.level || 1)) * DATA.knight.growth.pointsPerLevel);
}

function readAutoAssignPlanFromInputs() {
  const plan = {};
  refs.autoPointPlan?.querySelectorAll("[data-auto-point]").forEach((input) => {
    plan[input.dataset.autoPoint] = Number(input.value) || 0;
  });
  return normalizeAutoAssignPlan(plan);
}

function syncAutoAssignPlanControls() {
  const plan = normalizeAutoAssignPlan(state.autoAssignPlan);
  state.autoAssignPlan = plan;
  refs.autoPointPlan?.querySelectorAll("[data-auto-point]").forEach((input) => {
    input.value = plan[input.dataset.autoPoint] ?? 0;
  });
  if (refs.autoPointPlanText) {
    refs.autoPointPlanText.textContent = `每 5 点：力${plan.strength} / 敏${plan.agility} / 体${plan.vitality} / 智${plan.energy}`;
  }
}

function addStatPoint(stat, amount) {
  if (!state.stats[stat] || state.points <= 0) return;
  const used = Math.min(amount, state.points);
  state.stats[stat] += used;
  state.points -= used;
  state.hp = maxLife();
  state.mp = maxMana();
  renderAll();
  save();
}

function equipBest() {
  const slots = Object.keys(SLOT_NAMES);
  slots.forEach((slot) => {
    const candidates = state.inventory.filter((it) => targetEquipSlot(it) === slot);
    const current = state.equipment[slot];
    const best = candidates.sort((a, b) => itemScore(b) - itemScore(a))[0];
    if (best && (!current || itemScore(best) > itemScore(current))) equipItem(best.uid);
  });
  renderAll();
  save();
}

function itemScore(item) {
  const base = DATA.items[item.itemId];
  const effectScore = (base.effects || []).reduce((sum, entry) => {
    const effect = entry?.effect;
    const value = Number(entry?.value || 0);
    if (["damageIncrease", "damageAbsorb", "expBonus", "zenOnKill"].includes(effect)) return sum + value * 350;
    if (effect === "attackSpeed") return sum + value * 8;
    if (effect === "defenseFlat" || effect === "lifeFlat") return sum + value * 2;
    return sum;
  }, 0);
  return itemAttackMax(item, base) * 3
    + itemDefense(item, base) * 4
    + effectScore
    + (item.level || 0) * 10
    + effectiveAdditionalLevel(item) * 4
    + (item.luck ? 35 : 0)
    + (item.excellentOptionIds?.length || 0) * 45
    + (item.quality === "excellent" ? 100 : 0);
}

function equipItem(uid) {
  const idx = state.inventory.findIndex((it) => it.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  const base = DATA.items[item.itemId];
  if (!base) return;
  item.slot = item.slot || base.slot;
  if (!item.slot) {
    notifyInfo(`${item.name || base.name} 缺少装备部位，无法穿戴。`, "bad");
    return;
  }
  const requirements = [
    ["力量", base.requiredStrength || 0, state.stats.strength],
    ["敏捷", base.requiredAgility || 0, state.stats.agility],
    ["智力", base.requiredEnergy || 0, state.stats.energy]
  ];
  const missing = requirements.find(([, need, have]) => need > have);
  if (missing) {
    const [label, need, have] = missing;
    notifyInfo(`${label}不足，无法穿戴 ${displayItemName(item, base)}（需要 ${need}，当前 ${have}）。`, "bad");
    return;
  }
  const slot = targetEquipSlot(item);
  const previous = state.equipment[slot];
  state.inventory.splice(idx, 1);
  if (previous && !addInventory(previous, false)) {
    state.inventory.splice(idx, 0, item);
    notifyInfo("背包已满，无法更换装备。", "bad");
    return;
  }
  state.equipment[slot] = { ...item, count: 1 };
  state.hp = clamp(state.hp, 1, maxLife());
  state.mp = clamp(state.mp, 0, maxMana());
  notifyInfo(`已穿戴 ${displayItemName(item, base)}。`, "good");
}

function targetEquipSlot(item) {
  const base = DATA.items[item.itemId];
  if (item.quality === "set") return item.slot;
  if (base?.kind === "weapon" && isOneHandWeapon(base) && state.equipment.weapon && !state.equipment.shield) return "shield";
  if (base?.slot === "earring" || item.slot === "earring") {
    const preferred = base?.earringSide === "right" ? "earringRight" : base?.earringSide === "left" ? "earringLeft" : "";
    if (preferred && !state.equipment[preferred]) return preferred;
    if (!state.equipment.earringLeft) return "earringLeft";
    if (!state.equipment.earringRight) return "earringRight";
    return preferred || "earringLeft";
  }
  return item.slot;
}

function isOneHandWeapon(base) {
  return base?.kind === "weapon" && !String(base.category || "").includes("鍙屾墜") && !String(base.category || "").includes("two-hand");
}

function unequipItem(slot) {
  const item = state.equipment[slot];
  if (!item) return;
  if (!addInventory(item, false)) {
    log("info", "背包已满，无法卸下装备。");
    return;
  }
  delete state.equipment[slot];
  state.hp = clamp(state.hp, 1, maxLife());
  state.mp = clamp(state.mp, 0, maxMana());
}

function sellItemLegacy(uid) {
  const idx = state.inventory.findIndex((it) => it.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  const base = DATA.items[item.itemId];
  if (typeof base.price !== "number") {
    log("info", `${item.name} 的价格资料未提供，暂不能出售。`);
    return;
  }
  const price = Math.max(1, Math.floor(base.price * (item.count || 1) * (1 + item.level * 0.25)));
  state.gold += price;
  state.inventory.splice(idx, 1);
  log("info", `出售 ${item.name}，获得 ${price} 金币。`, "good");
}

function sellNormalEquipmentLegacy(show = true) {
  let earned = 0;
  state.inventory = state.inventory.filter((item) => {
    const base = DATA.items[item.itemId];
    const sell = (base.kind === "weapon" || base.kind === "armor") && item.quality === "normal";
    if (sell && typeof base.price === "number") earned += Math.floor(base.price * 0.35);
    if (sell && typeof base.price !== "number") return true;
    return !sell;
  });
  if (earned) {
    state.gold += earned;
    log("info", `自动出售白装，获得 ${earned} 金币。`, "good");
  } else if (show) {
    log("info", "背包中没有可出售白装。");
  }
  renderAll();
}

function sellItem(uid) {
  const idx = state.inventory.findIndex((it) => it.uid === uid);
  if (idx < 0) return;
  const item = state.inventory[idx];
  const price = sellPrice(item);
  state.gold += price;
  state.inventory.splice(idx, 1);
  log("info", `出售 ${itemLabel(item)}，获得 ${price} 金币。`, "good");
}

function sellNormalEquipment(show = true) {
  sellEquipmentByQuality("normal", show);
}

function sellEquipmentByQuality(quality, show = true) {
  let earned = 0;
  let count = 0;
  state.inventory = state.inventory.filter((item) => {
    const base = DATA.items[item.itemId];
    const sell = isEquipment(base) && item.quality === quality;
    if (!sell) return true;
    earned += sellPrice(item);
    count += 1;
    return false;
  });
  if (count) {
    state.gold += earned;
    log("info", `批量出售 ${qualityLabel(quality)}装备 ${count} 件，获得 ${earned} 金币。`, "good");
  } else if (show) {
    log("info", `背包中没有可出售的 ${qualityLabel(quality)}装备。`);
  }
  renderAll();
  save();
}

function sellPrice(item) {
  const base = DATA.items[item.itemId] || {};
  const raw = typeof base.price === "number"
    ? base.price
    : Math.max(1,
      (base.requiredLevel || base.dropLevel || 1) * 8
      + (base.attackMax || base.statMax || 0) * 18
      + (base.defenseMax ?? base.defense ?? 0) * 16
      + (base.durability || 0) * 2
    );
  const qualityMultiplier = {
    normal: 0.35,
    blue: 0.7,
    excellent: 2.5,
    set: 3,
    epic: 5,
    mythic: 8
  }[item.quality] || 0.35;
  return Math.max(1, Math.floor(raw * qualityMultiplier * (item.count || 1) * (1 + (item.level || 0) * 0.25)));
}

function qualityLabel(quality) {
  return {
    normal: "普通",
    blue: "精良",
    excellent: "卓越",
    set: "套装",
    epic: "史诗",
    mythic: "神话"
  }[quality] || quality;
}

function selectedOfflineBagUids() {
  if (!refs.offlineModalBody) return [];
  return [...refs.offlineModalBody.querySelectorAll("[data-offline-keep]:checked")]
    .map((box) => box.dataset.offlineKeep)
    .filter(Boolean);
}

function handleOfflineBagAction(event) {
  const button = event.target.closest("[data-offline-action], [data-offline-sell-quality]");
  if (!button) return;
  const action = button.dataset.offlineAction;
  if (action === "select-all" || action === "select-none") {
    refs.offlineModalBody.querySelectorAll("[data-offline-keep]").forEach((box) => {
      box.checked = action === "select-all";
    });
    return;
  }
  if (action === "claim-selected") {
    claimOfflinePendingItems(selectedOfflineBagUids());
    return;
  }
  if (action === "sell-unselected") {
    const kept = new Set(selectedOfflineBagUids());
    const uids = (state.offlinePendingItems || [])
      .filter((item) => !kept.has(item.uid))
      .map((item) => item.uid);
    sellOfflinePendingItems(uids);
    return;
  }
  if (button.dataset.offlineSellQuality) {
    const quality = button.dataset.offlineSellQuality;
    const uids = (state.offlinePendingItems || [])
      .filter((item) => isEquipment(DATA.items[item.itemId]) && (item.quality || "normal") === quality)
      .map((item) => item.uid);
    sellOfflinePendingItems(uids);
  }
}

function claimOfflinePendingItems(uids) {
  const selected = new Set(uids || []);
  if (!selected.size) {
    log("info", "请先勾选要收取的离线物品。");
    return;
  }
  let moved = 0;
  const kept = [];
  for (const item of state.offlinePendingItems || []) {
    if (!selected.has(item.uid)) {
      kept.push(item);
      continue;
    }
    if (addInventory({ ...item }, false)) {
      moved += 1;
    } else {
      kept.push(item);
    }
  }
  state.offlinePendingItems = kept;
  if (moved) log("info", `已收取 ${moved} 件离线物品到背包。`, "good");
  if (selected.size > moved) log("info", "背包空间不足，未收取的物品仍保留在临时背包。");
  refreshOfflineModal();
  renderAll();
  save();
}

function sellOfflinePendingItems(uids) {
  const selected = new Set(uids || []);
  if (!selected.size) {
    log("info", "临时背包中没有可出售的目标物品。");
    return;
  }
  let earned = 0;
  let count = 0;
  state.offlinePendingItems = (state.offlinePendingItems || []).filter((item) => {
    if (!selected.has(item.uid)) return true;
    earned += sellPrice(item);
    count += 1;
    return false;
  });
  if (count) {
    state.gold += earned;
    log("info", `临时背包出售 ${count} 件物品，获得 ${earned} 金币。`, "good");
  }
  refreshOfflineModal();
  renderAll();
  save();
}

function refreshOfflineModal() {
  if (!refs.offlineModalBody || !state.offlineSummary) return;
  refs.offlineModalBody.innerHTML = offlineModalHtml(state.offlineSummary);
}

function sortBag() {
  state.inventory.sort((a, b) => {
    const qa = qualityRank(a), qb = qualityRank(b);
    if (qb !== qa) return qb - qa;
    return a.name.localeCompare(b.name, "zh-CN");
  });
  renderAll();
}

function qualityRank(item) {
  const base = DATA.items[item.itemId] || {};
  const qualityIndex = EQUIPMENT_QUALITY_ORDER.indexOf(item.quality || base.quality || "normal");
  if (qualityIndex >= 0 && isEquipment(base)) return 10 + qualityIndex;
  if (base.kind === "jewel") return 8;
  if (base.kind === "material") return 7;
  if (base.kind === "potion") return 2;
  return 1;
}

function buyItem(itemId, quantity = 1) {
  const base = DATA.items[itemId];
  if (!base || typeof base.price !== "number") {
    log("info", "该物品没有价格资料，暂不能购买。");
    return;
  }
  const affordable = Math.floor(state.gold / base.price);
  const requested = quantity === "max" ? affordable : Math.max(1, Number(quantity) || 1);
  const capacity = purchasableCapacity(itemId, base);
  const count = Math.max(0, Math.min(requested, affordable, capacity));
  if (state.gold < base.price) {
    log("info", "金币不足。");
    return;
  }
  if (!capacity) {
    log("info", "背包空间不足。");
    return;
  }
  if (!count) return;
  let remaining = count;
  let bought = 0;
  const maxStack = itemMaxStack({ itemId }, base);
  while (remaining > 0) {
    const batch = maxStack > 1 ? Math.min(remaining, maxStack) : 1;
    const item = makeItem(itemId, { count: batch });
    if (!addInventory(item, false)) break;
    bought += batch;
    remaining -= batch;
    if (maxStack === 1) break;
  }
  if (!bought) return;
  state.gold -= base.price * bought;
  log("info", `购买 ${base.name} x${bought}。`);
  if (bought < requested) log("info", "金币或背包空间不足，已购买可放入的数量。");
  renderAll();
  save();
}

function purchasableCapacity(itemId, base = DATA.items[itemId]) {
  const maxStack = itemMaxStack({ itemId }, base);
  if (maxStack <= 1) return Math.max(0, 64 - state.inventory.length);
  const sameStackRoom = state.inventory
    .filter((it) => it.itemId === itemId && (it.count || 1) < maxStack)
    .reduce((sum, it) => sum + Math.max(0, maxStack - (it.count || 1)), 0);
  const emptySlots = Math.max(0, 64 - state.inventory.length);
  return sameStackRoom + emptySlots * maxStack;
}

function buyQuantityFromButton(btn) {
  const raw = btn.dataset.buyQty || "1";
  return raw === "max" ? "max" : Math.max(1, Number(raw) || 1);
}

function shopBuyControlsHtml(item, hasPrice) {
  if (!hasPrice) return `<button data-buy="${item.id}" disabled>璐拱</button>`;
  if (item.kind !== "potion") return `<button data-buy="${item.id}" data-buy-qty="1">璐拱</button>`;
  return `
    <div class="shop-buy-group">
      <button data-buy="${item.id}" data-buy-qty="1">x1</button>
      <button data-buy="${item.id}" data-buy-qty="10">x10</button>
      <button data-buy="${item.id}" data-buy-qty="50">x50</button>
      <button data-buy="${item.id}" data-buy-qty="max">最大</button>
    </div>
  `;
}

function applyOffline() {
  if (!DATA.offline.enabled || !state.lastSaveAt) return;
  const offlineRule = DATA.dropRates?.offline || {};
  const maxHours = offlineRule.maxHours ?? DATA.offline.maxHours;
  const fullRateHours = offlineRule.fullRateHours ?? maxHours;
  const lateEfficiency = offlineRule.afterFullRateEfficiency ?? DATA.offline.efficiency;
  const seconds = Math.min((Date.now() - state.lastSaveAt) / 1000, maxHours * 3600);
  const capped = (Date.now() - state.lastSaveAt) / 1000 > maxHours * 3600;
  if (seconds < 60) {
    state.offlineSummary = null;
    return;
  }
  const fullSeconds = Math.min(seconds, fullRateHours * 3600);
  const lateSeconds = Math.max(0, seconds - fullSeconds);
  let effectiveSeconds = fullSeconds + lateSeconds * lateEfficiency;
  const today = new Date().toLocaleDateString("zh-CN");
  if (state.lastLoginBonusDate !== today && offlineRule.dailyFirstLoginOfflineBonus) {
    effectiveSeconds *= 1 + offlineRule.dailyFirstLoginOfflineBonus;
    state.lastLoginBonusDate = today;
  }
  const zone = DATA.zones[state.zoneId];
  const monsters = zone.monsters.map((id) => DATA.monsterById[id]).filter(Boolean);
  const stats = calcStats();
  const avgExp = monsters.reduce((sum, m) => sum + (m.exp ?? monsterRewards(m).exp), 0) / monsters.length;
  const avgGold = monsters.reduce((sum, m) => {
    const reward = monsterRewards(m);
    return sum + ((m.goldMin ?? reward.gold) + (m.goldMax ?? reward.gold)) / 2;
  }, 0) / monsters.length;
  const avgHp = monsters.reduce((sum, m) => sum + m.hp, 0) / monsters.length;
  const hits = Math.max(1, Math.ceil(avgHp / Math.max(1, (stats.attackMin + stats.attackMax) / 2)));
  const kills = Math.floor(effectiveSeconds / (hits * DATA.battle.attackIntervalMs / 1000));
  const summaryBase = {
    seconds,
    effectiveSeconds,
    capped,
    zoneName: zone.name,
    avgExp: Math.floor(avgExp),
    avgGold: Math.floor(avgGold),
    killsPerMinute: Math.round(kills / Math.max(1, effectiveSeconds / 60) * 10) / 10
  };
  if (kills <= 0) {
    state.offlineSummary = { ...summaryBase, kills: 0, exp: 0, gold: 0, levelBefore: state.level, levelAfter: state.level };
    return;
  }
  const levelBefore = state.level;
  const exp = Math.floor(kills * avgExp * (1 + (stats.expBonus || 0)));
  const gold = Math.floor(kills * avgGold * (1 + (stats.zenBonus || 0)));
  const drops = rollOfflineDrops(monsters, kills);
  state.exp += exp;
  state.gold += gold;
  state.offlineSummary = { ...summaryBase, kills, exp, gold, drops, levelBefore, levelAfter: levelBefore };
  while (state.exp >= expToNext()) {
    state.exp -= expToNext();
    state.level += 1;
    state.points += DATA.knight.growth.pointsPerLevel;
  }
  if (state.level > levelBefore && state.autoAssignPoints) autoAddPoints(false);
  state.offlineSummary.levelAfter = state.level;
  state.offlineSummary.pointsGained = Math.max(0, state.level - levelBefore) * DATA.knight.growth.pointsPerLevel;
  const dropText = drops.equipment || drops.jewels ? `，掉落 ${drops.equipment} 件装备、${drops.jewels} 个宝石/材料` : "";
  log("info", `离线 ${formatTime(seconds)}，结算 ${exp} 经验、${gold} 金币${dropText}。`, "good");
}

const EQUIPMENT_ICON_FALLBACK_CACHE = new Map();

function equipmentIconFallback(item, base) {
  const slot = base?.slot || item?.slot;
  if (!slot) return "";
  const quality = item?.quality || base?.quality || "normal";
  const key = `${slot}:${quality}`;
  if (EQUIPMENT_ICON_FALLBACK_CACHE.has(key)) return EQUIPMENT_ICON_FALLBACK_CACHE.get(key);
  const items = Object.values(DATA.items || {}).filter((candidate) => (
    candidate?.icon
    && isEquipment(candidate)
    && candidate.slot === slot
  ));
  const picked = items.find((candidate) => candidate.quality === quality)
    || items.find((candidate) => candidate.quality === "normal")
    || items[0];
  const icon = picked?.icon || "";
  EQUIPMENT_ICON_FALLBACK_CACHE.set(key, icon);
  return icon;
}

function itemIconUrl(item, base = DATA.items[item?.itemId]) {
  return base?.icon || item?.icon || GEM_ICON_BY_NAME[item?.name] || equipmentIconFallback(item, base) || "";
}

function renderAll() {
  renderStartScreen();
  renderTop();
  renderZones();
  renderStats();
  renderEquipmentPanel();
  renderInventory();
  renderLoot();
  renderTestTools();
  renderAutoSell();
  renderSkills();
  renderShop();
  renderOfflineSummary();
  renderRewards();
  renderLog();
  renderRunTime();
  renderBattleTarget();
  renderDebugPanel();
}

function renderStartScreen() {
  if (!refs.startScreen) return;
  refs.startScreen.classList.toggle("hidden", Boolean(state.created));
  refs.continueBtn.disabled = false;
  refs.continueBtn.textContent = hasAnySave() ? "进入游戏" : "进入游戏";
}

function renderTop() {
  const stats = calcStats();
  refs.roleName.textContent = `Lv. ${state.level}  剑士`;
  refs.hpText.textContent = `${state.hp} / ${maxLife()}`;
  refs.mpText.textContent = `${state.mp} / ${maxMana()}`;
  refs.expText.textContent = `${state.exp} / ${expToNext()} EXP`;
  refs.hpBar.style.width = `${clamp(state.hp / maxLife() * 100, 0, 100)}%`;
  refs.mpBar.style.width = `${clamp(state.mp / maxMana() * 100, 0, 100)}%`;
  refs.expBar.style.width = `${clamp(state.exp / expToNext() * 100, 0, 100)}%`;
  refs.powerText.textContent = stats.power.toLocaleString();
  refs.goldText.textContent = state.gold.toLocaleString();
  refs.jewelText.textContent = potionCount("heal").toLocaleString();
  refs.premiumText.textContent = potionCount("mana").toLocaleString();
  refs.toggleRun.textContent = state.running ? "停止挂机" : "开始挂机";
  refs.runState.textContent = state.running ? "挂机中..." : "未挂机";
  refs.zoneTitle.textContent = `${DATA.zones[state.zoneId].name} (${DATA.zones[state.zoneId].levelRange})`;
  refs.currentZoneMonsters.textContent = DATA.zones[state.zoneId].monsters.map((id) => DATA.monsterById[id]?.name).filter(Boolean).join(" / ");
}

function potionCount(name) {
  return state.inventory
    .filter((it) => DATA.items[it.itemId]?.kind === "potion")
    .filter((it) => {
      const itemName = `${it.name} ${it.itemId}`.toLowerCase();
      return name === "heal" ? /heal|治疗|生命/.test(itemName) : /mana|魔法/.test(itemName);
    })
    .reduce((sum, it) => sum + (it.count || 1), 0);
}

function renderBattleTarget() {
  if (refs.heroHpBar && refs.heroHpText && refs.heroMpBar && refs.heroMpText) {
    refs.heroHpBar.style.width = `${clamp(state.hp / maxLife() * 100, 0, 100)}%`;
    refs.heroHpText.textContent = `${state.hp} / ${maxLife()}`;
    refs.heroMpBar.style.width = `${clamp(state.mp / maxMana() * 100, 0, 100)}%`;
    refs.heroMpText.textContent = `${state.mp} / ${maxMana()}`;
  }
  if (refs.monsterHpBar) refs.monsterHpBar.style.width = "0%";
  if (refs.monsterHpText) refs.monsterHpText.textContent = "";
  if (!activeMonster) {
    refs.monsterSprite.classList.remove("with-image");
    refs.monsterSprite.innerHTML = `<span></span><b id="monsterName">等待怪物</b>`;
    refs.monsterName = $("monsterName");
    monsterEntitiesSignature = "";
    return;
  }
  refs.monsterName.textContent = activeMonster.name;
  renderMonsterEntities();
}

function setMonsterSpriteImage(monster) {
  const sprite = refs.monsterSprite;
  const body = sprite?.querySelector("span");
  if (!sprite || !body) return;
  const image = monsterImageUrl(monster);
  if (!image) {
    sprite.classList.remove("with-image");
    body.style.backgroundImage = "";
    body.title = "";
    return;
  }
  sprite.classList.add("with-image");
  body.style.backgroundImage = `url("${image}")`;
  body.title = monster.name || "";
}

function renderMonsterEntities() {
  const sprite = refs.monsterSprite;
  if (!sprite) return;
  sprite.classList.toggle("with-image", Boolean(activeMonster));
  const alive = activeMonsters.filter((monster) => monster.hpNow > 0);
  const previousIds = new Set([...sprite.querySelectorAll("[data-monster-uid]")].map((node) => node.dataset.monsterUid));
  const signature = alive.map((monster) => monster.spawnUid).join("|");
  if (signature === monsterEntitiesSignature) {
    updateMonsterEntityStates();
    updateMonsterEntityBars();
    return;
  }
  monsterEntitiesSignature = signature;
  const slots = [
    { x: 55, y: 45, s: 1.0, sx: 14, sy: -8 },
    { x: 60, y: 52, s: 1.04, sx: 16, sy: 4 },
    { x: 52, y: 58, s: 0.94, sx: -10, sy: 10 },
    { x: 64, y: 61, s: 0.9, sx: 12, sy: 12 },
    { x: 49, y: 50, s: 0.88, sx: -12, sy: -4 }
  ];
  const bodyHtml = alive.map((monster, index) => {
    const image = monsterImageUrl(monster);
    const slot = slots[index % slots.length];
    const active = monster === activeMonster;
    const entering = !previousIds.has(monster.spawnUid);
    return `
      <span class="monster-entity ${active ? "active" : ""} ${entering ? "entering" : ""}" data-monster-uid="${escapeAttr(monster.spawnUid)}" title="${escapeAttr(monster.name)}" style="--mx:${slot.x}%;--my:${slot.y}%;--ms:${slot.s};--sx:${slot.sx}px;--sy:${slot.sy}px;${image ? `background-image:url('${escapeAttr(image)}')` : ""}">
        <i class="monster-mini-bars">
          <i class="monster-mini-hp"></i>
          <i class="monster-mini-mp"></i>
        </i>
      </span>
    `;
  }).join("");
  sprite.innerHTML = `${bodyHtml}<b id="monsterName">${escapeHtml(activeMonster?.name || "等待怪物")}</b>`;
  refs.monsterName = $("monsterName");
  updateMonsterEntityStates();
  updateMonsterEntityBars();
}

function updateMonsterEntityStates() {
  refs.monsterSprite?.querySelectorAll("[data-monster-uid]").forEach((node) => {
    node.classList.toggle("active", node.dataset.monsterUid === activeMonster?.spawnUid);
  });
  if (refs.monsterName) refs.monsterName.textContent = activeMonster?.name || "等待怪物";
}

function updateMonsterEntityBars() {
  const now = Date.now();
  activeMonsters.forEach((monster) => {
    const node = refs.monsterSprite?.querySelector(`[data-monster-uid="${monster.spawnUid}"]`);
    if (!node) return;
    const hp = node.querySelector(".monster-mini-hp");
    const mp = node.querySelector(".monster-mini-mp");
    if (hp) hp.style.width = `${clamp(monster.hpNow / monster.hp * 100, 0, 100)}%`;
    if (mp) {
      const interval = scaledMs(monster.attackIntervalMs || DATA.battle.monsterAttackIntervalMs);
      const remaining = Math.max(0, (monster.nextAttackAt || now) - now);
      mp.style.width = `${clamp((1 - remaining / Math.max(1, interval)) * 100, 0, 100)}%`;
    }
  });
}

function showMonsterHit(monster, damage, tone = "normal") {
  const node = refs.monsterSprite?.querySelector(`[data-monster-uid="${monster.spawnUid}"]`);
  const field = $("battlefield");
  if (!node || !field) {
    showHit(damage);
    return;
  }
  restartClassAnimation(node, "hit", 280);
  const nodeRect = node.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  const hit = document.createElement("em");
  hit.className = `monster-hit hit-${tone}`;
  hit.textContent = damage;
  hit.style.left = `${nodeRect.left + nodeRect.width / 2 - fieldRect.left}px`;
  hit.style.top = `${nodeRect.top - fieldRect.top + 4}px`;
  field.appendChild(hit);
  window.setTimeout(() => hit.remove(), 900);
}

function showHeroHit(damage) {
  const node = document.querySelector(".fighter.knight");
  if (!node) return;
  const hit = document.createElement("em");
  hit.className = "hero-hit";
  hit.textContent = damage;
  node.appendChild(hit);
  window.setTimeout(() => hit.remove(), 900);
}

function showMonsterDeath(monster) {
  const field = $("battlefield");
  const node = refs.monsterSprite?.querySelector(`[data-monster-uid="${monster.spawnUid}"]`);
  if (!field || !node) return;
  const nodeRect = node.getBoundingClientRect();
  const fieldRect = field.getBoundingClientRect();
  const ghost = document.createElement("span");
  ghost.className = "monster-death-ghost";
  ghost.style.left = `${nodeRect.left + nodeRect.width / 2 - fieldRect.left}px`;
  ghost.style.top = `${nodeRect.top + nodeRect.height / 2 - fieldRect.top}px`;
  ghost.style.width = `${nodeRect.width}px`;
  ghost.style.height = `${nodeRect.height}px`;
  ghost.style.backgroundImage = node.style.backgroundImage;
  ghost.style.setProperty("--ms", node.style.getPropertyValue("--ms") || "1");
  field.appendChild(ghost);
  window.setTimeout(() => ghost.remove(), 760);
}

function showBattleCoins(monster) {
  const field = $("battlefield");
  const node = refs.monsterSprite?.querySelector(`[data-monster-uid="${monster.spawnUid}"]`);
  const point = battleNodeCenter(node, field) || { x: field?.clientWidth * 0.62 || 0, y: field?.clientHeight * 0.52 || 0 };
  if (!field) return;
  const pile = document.createElement("span");
  pile.className = "battle-coin";
  pile.style.setProperty("--coin-x", `${point.x + Math.random() * 28 - 14}px`);
  pile.style.setProperty("--coin-y", `${point.y + Math.random() * 20 + 12}px`);
  const coins = 5 + Math.floor(Math.random() * 4);
  pile.innerHTML = Array.from({ length: coins }, (_, index) => {
    const row = index % 3;
    const layer = Math.floor(index / 3);
    const x = 12 + row * 18 + Math.random() * 8 + layer * 5;
    const y = 20 - layer * 10 + Math.random() * 8;
    const size = 20 + Math.random() * 8;
    const rotate = Math.random() * 34 - 17;
    return `<i style="--px:${x}px;--py:${y}px;--ps:${size}px;--pr:${rotate}deg"></i>`;
  }).join("");
  field.appendChild(pile);
  window.setTimeout(() => pile.remove(), 1500);
}

function monsterImageUrl(monster) {
  const image = monster?.image;
  if (!image) return "";
  return String(image)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function renderZones() {
  refs.mapName.textContent = DATA.map.name;
  const current = DATA.zones[state.zoneId];
  const target = state.targetMonsterId ? DATA.monsterById[state.targetMonsterId] : null;
  refs.mapSummary.textContent = `${current.name} · Lv. ${current.levelRange}${target ? ` · 定点：${target.name}` : ""}`;
  refs.zoneList.innerHTML = DATA.map.zones.map((zone) => `
    <section class="zone-card ${zone.id === state.zoneId ? "active" : ""}">
      <button class="zone" data-zone="${zone.id}">
        <i></i><span>${escapeHtml(zone.name)}</span><small>Lv. ${escapeHtml(zone.levelRange)}</small>
      </button>
      <div class="spawn-list">
        ${zone.monsters.map((monsterId) => spawnButtonHtml(zone, monsterId)).join("")}
      </div>
    </section>
  `).join("");
  refs.zoneList.querySelectorAll("[data-zone]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.zoneId = btn.dataset.zone;
      state.targetMonsterId = "";
      activeMonster = null;
      activeMonsters = [];
      log("info", `进入 ${DATA.zones[state.zoneId].name}，开始挂机。`, "good");
      renderAll();
      save();
    });
  });
  refs.zoneList.querySelectorAll("[data-spawn-monster]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.zoneId = btn.dataset.zone;
      state.targetMonsterId = btn.dataset.spawnMonster;
      activeMonster = null;
      activeMonsters = [];
      refs.mapModal.classList.add("hidden");
      log("info", `进入 ${DATA.zones[state.zoneId].name}，开始挂机。`, "good");
      renderAll();
      save();
    });
  });
}

function spawnButtonHtml(zone, monsterId) {
  const monster = DATA.monsterById[monsterId];
  if (!monster) return "";
  const selected = zone.id === state.zoneId && monsterId === state.targetMonsterId;
  const drops = dropNamesForMonster(monsterId).slice(0, 4).join("、") || "按地图掉落";
  return `
    <button class="spawn-point ${selected ? "active" : ""}" data-zone="${zone.id}" data-spawn-monster="${monsterId}">
      <b>${escapeHtml(monster.name)}</b>
      <small>Lv.${monster.level} · ${escapeHtml(drops)}</small>
    </button>
  `;
}

function renderStats() {
  const s = calcStats();
  const baseRows = [
    ["strength", "力量", state.stats.strength],
    ["agility", "敏捷", state.stats.agility],
    ["vitality", "体力", state.stats.vitality],
    ["energy", "智力", state.stats.energy]
  ];
  const detailRows = [
    ["攻击力", `${s.attackMin} ~ ${s.attackMax}`], ["防御力", s.defense],
    ["攻击速度", s.speed], ["攻击成功率", s.success],
    ["防御成功率", s.defenseSuccess],
    ["生命值", `${state.hp} / ${maxLife()}`], ["魔法值", `${state.mp} / ${maxMana()}`]
  ];
  refs.statsGrid.innerHTML = `
    <div class="stat-panel primary-stats">
      ${baseRows.map(([key, label, value]) => `
        <div class="stat stat-add">
          <span>${label}</span>
          <b>${value}</b>
          <button data-stat="${key}" data-stat-add="1" ${state.points <= 0 ? "disabled" : ""}>+1</button>
        </div>
      `).join("")}
    </div>
    <div class="stat-panel combat-stats">
      ${detailRows.map(([k, v]) => `<div class="stat"><span>${k}</span><b>${v}</b></div>`).join("")}
    </div>
  `;
  refs.statsGrid.querySelectorAll("[data-stat-add]").forEach((btn) => {
    btn.addEventListener("click", () => addStatPoint(btn.dataset.stat, Number(btn.dataset.statAdd)));
  });
  refs.pointsText.textContent = state.points;
  if (refs.autoPointsToggle) refs.autoPointsToggle.checked = Boolean(state.autoAssignPoints);
  if (refs.resetPointsBtn) refs.resetPointsBtn.disabled = totalEarnedStatPoints() <= 0;
  syncAutoAssignPlanControls();
}

function renderEquipment() {
  refs.equipment.innerHTML = Object.entries(SLOT_NAMES).map(([slot, name]) => {
    const item = state.equipment[slot];
    const label = slot === "shield" && item && DATA.items[item.itemId]?.kind === "weapon" ? "副手" : name;
    return `<button class="slot slot-${slot} ${item ? "equipped" : ""}" data-equip-slot="${slot}" title="${item ? "点击卸下" : "空装备位"}"><small>${label}</small>${item ? renderItem(item) : "<span>空</span>"}</button>`;
  }).join("");
  refs.equipment.querySelectorAll("[data-equip-slot]").forEach((slotNode) => {
    slotNode.addEventListener("click", () => {
      unequipItem(slotNode.dataset.equipSlot);
      renderAll();
      save();
    });
  });
}

function renderEquipmentPanel() {
  refs.equipment.innerHTML = Object.entries(SLOT_NAMES).map(([slot, name]) => {
    const item = state.equipment[slot];
    const base = item ? DATA.items[item.itemId] : null;
    const label = slot === "shield" && item && base?.kind === "weapon" ? "Offhand" : name;
    const quality = equipmentSlotQuality(item, base);
    const title = item ? `${displayItemName(item, base)} - click to unequip` : `${label} - empty slot`;
    const icon = item ? itemIconUrl(item, base) : "";
    const iconHtml = icon
      ? `<img class="slot-item-icon" src="${escapeAttr(icon)}" alt="" draggable="false">`
      : `<span class="slot-item-icon empty"></span>`;
    const body = item
      ? `<span class="slot-item" data-item-uid="${item.uid}">${iconHtml}<span class="slot-item-name">${escapeHtml(displayItemName(item, base))}</span>${item.level ? `<b>+${item.level}</b>` : ""}</span>`
      : `<span class="slot-empty">${label}</span>`;
    return `
      <button class="slot slot-${slot} ${item ? "equipped" : ""} slot-quality-${quality}" data-equip-slot="${slot}" title="${escapeAttr(title)}">
        <small>${label}</small>
        ${body}
      </button>
    `;
  }).join("");
  refs.equipment.querySelectorAll("[data-equip-slot]").forEach((slotNode) => {
    slotNode.addEventListener("click", () => {
      unequipItem(slotNode.dataset.equipSlot);
      renderAll();
      save();
    });
  });
}

function equipmentSlotQuality(item, base) {
  if (!item) return "empty";
  const quality = item.quality || base?.quality || "normal";
  if (["normal", "blue", "excellent", "set", "epic", "mythic"].includes(quality)) return quality;
  return "normal";
}

function inventoryCellQuality(item, base) {
  if (!item) return "empty";
  if (isEquipment(base)) return equipmentSlotQuality(item, base);
  return dropVisualQuality(item, base);
}

function renderInventory() {
  const cells = [];
  for (let i = 0; i < 64; i++) {
    const item = state.inventory[i];
    const base = item ? DATA.items[item.itemId] : null;
    const quality = inventoryCellQuality(item, base);
    cells.push(`<button class="cell cell-quality-${quality} ${item ? "" : "empty"}" ${item ? `data-uid="${item.uid}" title="Equip/use with left click, sell with right click"` : ""}>${item ? renderItem(item) : ""}</button>`);
  }
  refs.inventory.innerHTML = cells.join("");
  refs.bagCount.textContent = `(${state.inventory.length}/64)`;
  refs.inventory.querySelectorAll("[data-uid]").forEach((cell) => {
    cell.addEventListener("click", () => {
      const item = state.inventory.find((it) => it.uid === cell.dataset.uid);
      if (!item) return;
      if (item.slot) equipItem(item.uid);
      renderAll();
      save();
    });
    cell.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      sellItem(cell.dataset.uid);
      renderAll();
      save();
    });
  });
}

function renderItem(item) {
  const base = DATA.items[item.itemId];
  const cls = item.quality === "excellent" ? "excellent" : base.kind === "jewel" ? "jewel" : base.kind === "potion" ? "material" : "";
  const level = item.level ? `<span class="item-level">+${item.level}</span>` : "";
  const count = item.count > 1 ? `<span class="count">${item.count}</span>` : "";
  const icon = itemIconUrl(item, base);
  const iconOnly = icon && base.kind === "jewel";
  const iconHtml = icon ? `<img class="item-icon" src="${escapeAttr(icon)}" alt="" draggable="false">` : "";
  const displayName = displayItemName(item, base);
  const nameHtml = iconOnly ? "" : `<span class="item-name ${cls}">${escapeHtml(displayName)}</span>`;
  return `<span class="item-stack ${icon ? "has-icon" : ""} ${iconOnly ? "icon-only" : ""}" data-item-uid="${item.uid}" title="${escapeAttr(displayName)}">${level}${iconHtml}${nameHtml}${count}</span>`;
}

function showItemTooltip(event) {
  if (!refs.itemTooltip) return;
  const itemTarget = event.target.closest("[data-item-uid]");
  const skillTarget = event.target.closest("[data-skill-id]");
  if (!itemTarget && !skillTarget) return;
  if (itemTarget) {
    const item = findRenderedItem(itemTarget.dataset.itemUid);
    if (!item) return;
    refs.itemTooltip.innerHTML = itemTooltipHtml(item);
  } else {
    const skill = DATA.skills.find((entry) => entry.id === skillTarget.dataset.skillId);
    if (!skill) return;
    refs.itemTooltip.innerHTML = skillTooltipHtml(skill);
  }
  refs.itemTooltip.style.display = "block";
  moveItemTooltip(event);
}

function moveItemTooltip(event) {
  if (!refs.itemTooltip || refs.itemTooltip.style.display !== "block") return;
  const offset = 18;
  const rect = refs.itemTooltip.getBoundingClientRect();
  const maxLeft = window.innerWidth - rect.width - 8;
  const maxTop = window.innerHeight - rect.height - 8;
  refs.itemTooltip.style.left = `${Math.max(8, Math.min(event.clientX + offset, maxLeft))}px`;
  refs.itemTooltip.style.top = `${Math.max(8, Math.min(event.clientY + offset, maxTop))}px`;
}

function hideItemTooltip(event) {
  if (!refs.itemTooltip) return;
  if (event.target.closest("[data-item-uid], [data-skill-id]")) return;
  refs.itemTooltip.style.display = "none";
}

function findRenderedItem(uid) {
  return Object.values(state.equipment).find((item) => item?.uid === uid)
    || state.inventory.find((item) => item?.uid === uid)
    || (state.offlinePendingItems || []).find((item) => item?.uid === uid);
}

function itemTooltipHtml(item) {
  const base = DATA.items[item.itemId];
  if (!base) return "";
  const quality = itemQualityMeta(item, base);
  if (!isEquipment(base)) {
    return `
      <div class="tooltip-title ${quality.className}">${escapeHtml(displayItemName(item, base))}</div>
      <div class="tooltip-section">${base.kind ? `<div>类型：${escapeHtml(base.kind)}</div>` : ""}${item.count > 1 ? `<div>数量：${item.count}</div>` : ""}</div>
    `;
  }

  const cleanDisplayTitle = `${item.level ? `+${item.level} ` : ""}${displayItemName(item, base)}`;
  const baseLines = equipmentBaseLines(item, base);
  const durabilityLines = base.durability ? [`耐久：${base.durability}/${base.durability}`] : [];
  const requirementLines = equipmentRequirementLines(base);
  const classHtml = equipmentClassHtml(base);
  const skillLines = equipmentSkillLines(base);
  const luckLines = equipmentLuckLines(item);
  const excellentLines = item.quality === "excellent" ? excellentLinesForItem(item, base) : [];
  const commonLines = equipmentCommonLines(item);
  const affixLines = itemAffixLines(item);
  const setStateLines = itemSetStateLines(item);
  const setBonusLines = officialEffectLines(base);
  const setPieces = equipmentSetPieces(base);
  const advancedLines = equipmentAdvancedLines(item);
  const sourceLines = [];

  return `
    <div class="tooltip-title ${quality.className}">${escapeHtml(cleanDisplayTitle)}</div>
    <div class="tooltip-subtitle">${escapeHtml(base.category || SLOT_NAMES[base.slot] || "")}</div>
    ${tooltipRows(baseLines, "tooltip-normal")}
    ${tooltipRows(durabilityLines, "tooltip-normal")}
    ${tooltipRows(requirementLines, "tooltip-normal")}
    ${classHtml}
    ${tooltipRows(skillLines, "tooltip-skill")}
    ${tooltipRows(luckLines, "tooltip-luck")}
    ${tooltipRows(commonLines, "tooltip-additional")}
    ${tooltipRows(affixLines, "tooltip-additional")}
    ${tooltipRows(excellentLines, "tooltip-excellent-line")}
    ${tooltipRows(advancedLines, "tooltip-advanced-line")}
    ${tooltipRows(setPieces, "tooltip-set-line")}
    ${tooltipRows(setStateLines, "tooltip-set-line")}
    ${tooltipRows(setBonusLines, "tooltip-set-line")}
    ${tooltipRows(sourceLines, "tooltip-gray")}
  `;
}

function skillTooltipHtml(skill) {
  const locked = state.level < skill.requiredLevel;
  const cooldown = Math.round((skill.cooldownMs || 0) / 1000);
  const rows = [
    `类型：${skill.skillType || skill.type}`,
    `需要等级：Lv.${skill.requiredLevel}`,
    `消耗魔法：${skill.mana}`,
    `冷却时间：${cooldown} 秒`,
    skill.type === "attack" ? `伤害倍率：${Math.round((skill.multiplier || 1) * 100)}%` : "",
    skill.type === "attack" ? "公式：攻击随机值 + 力量/敏捷系数 + 固定伤害，并受智力系数修正" : "",
    locked ? "当前状态：尚未解锁" : "当前状态：可释放"
  ].filter(Boolean);
  return `
    <div class="tooltip-title quality-blue">${escapeHtml(skill.name)}</div>
    ${tooltipRows(rows, "tooltip-normal")}
    ${skill.officialEffect ? tooltipRows([skill.officialEffect], "tooltip-blue") : ""}
    ${skill.learnBy ? tooltipRows([`学习来源：${skill.learnBy}`], "tooltip-luck") : ""}
  `;
}

function itemQualityMeta(item, base) {
  const kind = item.quality || base.quality || "normal";
  if (kind === "excellent") return { prefix: "卓越的 ", className: "quality-excellent", glow: true };
  if (kind === "set") return { prefix: "套装 ", className: "quality-set", glow: true };
  if (kind === "blue") return { prefix: "", className: "quality-blue", glow: false };
  if (item.additionalLevel) return { prefix: "", className: "quality-normal", glow: false };
  return { prefix: "", className: "quality-normal", glow: false };
}

function equipmentBaseLines(item, base) {
  if (base.kind === "accessory" && Array.isArray(base.baseAttributes) && base.baseAttributes.length) {
    return base.baseAttributes;
  }
  if (base.kind === "guardian") {
    return [
      base.petLife ? `守护物生命：${base.petLife}` : "",
      ...(base.effects || []).map((entry) => entry.label || "")
    ].filter(Boolean);
  }
  if (base.kind === "weapon") {
    return [
      `攻击力：${itemAttackMin(item, base)} ~ ${itemAttackMax(item, base)}`,
      base.speed ? `攻击速度：${base.speed}` : ""
    ].filter(Boolean);
  }
  if (["helm", "armor", "gloves", "pants", "boots", "shield"].includes(base.slot)) {
    return [
      `防御力：${itemDefense(item, base)}`,
      base.defenseRate ? `防御成功率：${base.defenseRate}` : ""
    ].filter(Boolean);
  }
  const lines = [];
  if (base.damageIncrease) lines.push(`伤害增加：${base.damageIncrease}%`);
  if (base.damageAbsorb) lines.push(`伤害吸收：${base.damageAbsorb}%`);
  if (base.moveSpeed) lines.push(`移动速度：${base.moveSpeed}`);
  if (base.lifeBonus) lines.push(`生命上限：${base.lifeBonus}`);
  if (base.manaBonus) lines.push(`魔力上限：${base.manaBonus}`);
  if (base.resistance) lines.push(`抗性：${base.resistance}`);
  if (base.attackBonus) lines.push(`攻击加成：${base.attackBonus}`);
  return lines;
}

function equipmentRequirementLines(base) {
  return [
    base.requiredStrength ? `需要力量：${base.requiredStrength}` : "",
    base.requiredAgility ? `需要敏捷：${base.requiredAgility}` : "",
    base.requiredEnergy ? `需要智力：${base.requiredEnergy}` : "",
    base.requiredCommand ? `需要统率：${base.requiredCommand}` : ""
  ].filter(Boolean);
}

function equipmentClassHtml(base) {
  return "";
}

function equipmentSkillLines(base) {
  return [
    base.skill ? `技能：${base.skill}` : "",
    base.skillName ? `技能：${base.skillName}` : "",
    base.skillAttack ? `技能攻击力：${base.skillAttack}` : ""
  ].filter(Boolean);
}

function equipmentLuckLines(item) {
  if (item.luck) return ["幸运：灵魂宝石强化成功率 +25%", "幸运：会心一击率 +5%"];
  return [];
}

function isLuckOptionText(text) {
  const normalized = String(text || "").replace(/\s+/g, "");
  if (!normalized) return false;
  if (/^幸运[(:：]/.test(normalized)) return true;
  if (normalized.includes("幸运：灵魂宝石") || normalized.includes("幸运:灵魂宝石")) return true;
  if (normalized.includes("幸运：会心") || normalized.includes("幸运:会心")) return true;
  return false;
}

function hasLuckOptionText(rows) {
  return splitTooltipOptionLines(rows || []).some(isLuckOptionText);
}

function sanitizeExcellentOptions(rows) {
  return splitTooltipOptionLines(rows || []).filter((text) => !isLuckOptionText(text));
}

function officialEffectLines(base) {
  return splitTooltipOptionLines([base?.officialEffect || ""])
    .filter((text) => text && text !== "无")
    .filter((text) => !isLuckOptionText(text))
    .filter((text) => !isExcellentOptionText(text, base));
}

function isExcellentOptionText(text, base = {}) {
  return Boolean(excellentOptionIdFromText(text, base));
}

function isNoiseTooltipText(text) {
  const normalized = String(text || "")
    .replace(/[\uE000-\uF8FF\uFFFD]/g, "")
    .replace(/[?？"'“”‘’.,，。:：;；|｜/\\\s]/g, "")
    .trim();
  return !normalized;
}

function equipmentSetPieces(base) {
  if (base.setId && DATA.sets?.[base.setId]) {
    return DATA.sets[base.setId].pieceIds
      .map((id) => DATA.items[id]?.name)
      .filter(Boolean);
  }
  if (Array.isArray(base.setPieces) && base.setPieces.length) return base.setPieces;
  if (Array.isArray(base.suitParts) && base.suitParts.length) return base.suitParts;
  if (base.setName && base.name) return [base.name];
  return [];
}

function equipmentCommonLines(item) {
  if (item.additionalLevel) {
    const addValue = effectiveAdditionalLevel(item);
    return [item.slot === "weapon" ? `追加攻击力 +${addValue}` : `追加防御力 +${addValue}`];
  }
  return [];
}

function equipmentAdvancedLines(item) {
  return [
    item.regenerationOption,
    item.elementOption,
    item.socketOption,
    item.pvpOption
  ].filter(Boolean);
}

function excellentLinesForItem(item, base) {
  const ids = new Set(normalizeExcellentOptionIds(item, base));
  if (!ids.size) {
    assignedExcellentOptionIdsFromText(item.excellentOptions, base).forEach((id) => ids.add(id));
  }
  if (ids.size) return [...ids].map((id) => excellentTextForId(id, item, base));
  return sanitizeExcellentOptions(item.excellentOptions || []);
}

function normalizeExcellentOptionIds(item, base = DATA.items[item?.itemId] || {}) {
  const poolIds = new Set(excellentOptionPool(base).map((option) => option.id));
  const allOptionIds = new Set((DATA.excellentOptions?.options || []).map((option) => option.id));
  officialExcellentOptionPool(base).forEach((option) => allOptionIds.add(option.id));
  return [...new Set(item?.excellentOptionIds || [])]
    .filter((id) => poolIds.has(id) || allOptionIds.has(id));
}

function assignedExcellentOptionIdsFromText(rows, base = {}) {
  const ids = [...new Set(sanitizeExcellentOptions(rows || [])
    .map((text) => excellentOptionIdFromText(text, base))
    .filter(Boolean))];
  const poolIds = excellentOptionPool(base).map((option) => option.id);
  const looksLikeWholePool = poolIds.length > 0 && poolIds.every((id) => ids.includes(id));
  return looksLikeWholePool ? [] : ids;
}

function splitTooltipOptionLines(rows) {
  return (rows || []).flatMap((row) => String(row || "")
    .replace(/[\uE000-\uF8FF\uFFFD]/g, "\n")
    .replace(/[?？]+/g, "\n")
    .replace(/幸运[:：]/g, "\n幸运：")
    .replace(/卓越一击/g, "\n卓越一击")
    .replace(/卓越攻击/g, "\n卓越攻击")
    .replace(/攻击力\(魔法攻击力\)/g, "\n攻击力(魔法攻击力)")
    .replace(/攻击力\/魔法攻击力/g, "\n攻击力/魔法攻击力")
    .replace(/攻击\(魔法\)速度/g, "\n攻击(魔法)速度")
    .replace(/攻击速度/g, "\n攻击速度")
    .replace(/击杀怪物/g, "\n击杀怪物")
    .replace(/杀死怪物/g, "\n杀死怪物")
    .replace(/杀怪掉出/g, "\n杀怪掉出")
    .replace(/最大生命值/g, "\n最大生命值")
    .replace(/最大魔法值/g, "\n最大魔法值")
    .replace(/伤害减少/g, "\n伤害减少")
    .replace(/伤害反射/g, "\n伤害反射")
    .replace(/防御成功率/g, "\n防御成功率")
    .split(/\n+/)
    .map((text) => text.trim())
    .filter((text) => !isNoiseTooltipText(text))
    .filter(Boolean)
  );
}

function itemAffixLines(item) {
  return (item.affixes || []).map((affix) => {
    const meta = DATA.affixes?.[affix.affixId];
    return affix.label || (meta ? `${meta.label} ${affix.value ? `+${affix.value}` : ""}` : "");
  }).filter(Boolean);
}

function itemSetStateLines(item) {
  const base = DATA.items[item.itemId];
  if (!base?.setId) return [];
  const set = DATA.sets?.[base.setId];
  if (!set) return [];
  const count = equippedSetCounts()[base.setId] || 0;
  const lines = [`${set.name}：已穿戴 ${count}/${set.pieceCount}`];
  (set.bonuses || []).forEach((bonus) => {
    const active = count >= Number(bonus.requiredPieces || 0);
    const desc = (bonus.affixes || []).map((affix) => DATA.affixes?.[affix.affixId]?.label || affix.affixId).join("、");
    lines.push(`${active ? "已激活" : "未激活"} ${bonus.requiredPieces}件：${desc || bonus.note || "套装阶段"}`);
  });
  return lines;
}

function tooltipSection(title, rows, className) {
  return `
    <div class="tooltip-section">
      <div class="tooltip-section-title">${title}</div>
      ${rows.map((row) => `<div class="${className}">${escapeHtml(row)}</div>`).join("")}
    </div>
  `;
}

function tooltipRows(rows, className) {
  if (!rows.length) return "";
  return `<div class="tooltip-section plain">${splitTooltipOptionLines(rows).map((row) => `<div class="tooltip-row ${className}">${escapeHtml(row)}</div>`).join("")}</div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function renderLoot() {
  const labels = { gold: "金币", equipment: "装备", excellent: "卓越", set: "套装", jewel: "宝石", material: "材料", autoSellNormal: "白装出售" };
  const potion = state.potion || {};
  refs.lootOptions.innerHTML = `
    ${Object.entries(labels).map(([key, label]) => `
      <label class="check"><input type="checkbox" data-loot="${key}" ${state.loot[key] ? "checked" : ""}>${label}</label>
    `).join("")}
    <div class="potion-settings">
      <label class="potion-check"><input type="checkbox" data-potion-toggle="autoHp" ${potion.autoHp ? "checked" : ""}>自动红药</label>
      <label class="potion-threshold">HP ≤ <input type="number" min="1" max="99" step="1" data-potion-percent="hpPercent" value="${escapeAttr(potion.hpPercent ?? 35)}">%</label>
      <label class="potion-check"><input type="checkbox" data-potion-toggle="autoMp" ${potion.autoMp ? "checked" : ""}>自动蓝药</label>
      <label class="potion-threshold">MP ≤ <input type="number" min="1" max="99" step="1" data-potion-percent="mpPercent" value="${escapeAttr(potion.mpPercent ?? 25)}">%</label>
    </div>
  `;
  refs.lootOptions.querySelectorAll("[data-loot]").forEach((box) => {
    box.addEventListener("change", () => {
      state.loot[box.dataset.loot] = box.checked;
      save();
    });
  });
}

function handlePotionSettingsChange(event) {
  const toggle = event.target.closest("[data-potion-toggle]");
  const percent = event.target.closest("[data-potion-percent]");
  if (!toggle && !percent) return;
  state.potion = state.potion || { autoHp: true, hpPercent: 35, autoMp: true, mpPercent: 25 };
  if (toggle) state.potion[toggle.dataset.potionToggle] = toggle.checked;
  if (percent) {
    state.potion[percent.dataset.potionPercent] = clamp(Number(percent.value) || 1, 1, 99);
    percent.value = state.potion[percent.dataset.potionPercent];
  }
  save();
}

function renderTestTools(force = false) {
  if (!refs.testTools) return;
  const speedOptions = [1, 2, 4, 8, 16];
  const signature = JSON.stringify(state.test);
  if (!force && refs.testTools.dataset.signature === signature) return;
  refs.testTools.dataset.signature = signature;
  refs.testTools.innerHTML = `
    <div class="test-speed">
      <span>全局加速</span>
      <div>${speedOptions.map((speed) => `<button data-test-speed="${speed}" class="${state.test.speed === speed ? "active" : ""}">${speed}x</button>`).join("")}</div>
    </div>
    <label class="check"><input type="checkbox" data-test-toggle="instantKill" ${state.test.instantKill ? "checked" : ""}>秒杀</label>
    <label class="check"><input type="checkbox" data-test-toggle="noDamage" ${state.test.noDamage ? "checked" : ""}>无伤</label>
    <label class="check"><input type="checkbox" data-test-toggle="forceRare" ${state.test.forceRare ? "checked" : ""}>强制稀有</label>
    <button data-test-action="gold">加金币</button>
    <button data-test-action="level">升10级</button>
    <button data-test-action="jewel">加宝石</button>
  `;
}

function handleTestToolsClick(event) {
  const speedBtn = event.target.closest("[data-test-speed]");
  if (speedBtn) {
    state.test.speed = Number(speedBtn.dataset.testSpeed);
    restartBattleLoop();
    renderTestTools(true);
    save();
    return;
  }
  const actionBtn = event.target.closest("[data-test-action]");
  if (actionBtn) runTestAction(actionBtn.dataset.testAction);
}

function handleTestToolsChange(event) {
  const box = event.target.closest("[data-test-toggle]");
  if (!box) return;
  state.test[box.dataset.testToggle] = box.checked;
  renderTestTools(true);
  save();
}

function runTestAction(action) {
  if (action === "gold") {
    state.gold += 100000;
    log("info", "测试：增加 100000 金币。", "good");
  } else if (action === "level") {
    state.level = Math.min(DATA.exp.maxLevel || 400, state.level + 10);
    state.points += DATA.knight.growth.pointsPerLevel * 10;
    state.hp = maxLife();
    state.mp = maxMana();
    log("info", `测试：等级提升到 Lv.${state.level}。`, "good");
  } else if (action === "jewel") {
    const jewel = Object.values(DATA.items).find((item) => item.kind === "jewel");
    if (jewel) addInventory(makeItem(jewel.id, { count: 20 }), false);
    log("info", "测试：增加 20 个宝石。", "rare");
  }
  renderAll();
  save();
}

function renderAutoSell() {
  if (!refs.autoSellOptions) return;
  const labels = {
    normal: "普通装备",
    blue: "精良装备",
    excellent: "卓越装备",
    set: "套装装备",
    epic: "史诗装备",
    mythic: "神话装备",
    jewel: "宝石",
    material: "材料",
    potion: "药水"
  };
  state.loot.autoSell = state.loot.autoSell || {};
  refs.autoSellOptions.innerHTML = Object.entries(labels).map(([key, label]) => `
    <label class="check auto-sell-check">
      <input type="checkbox" data-auto-sell="${key}" ${state.loot.autoSell[key] ? "checked" : ""}>
      ${label}
    </label>
  `).join("");
  refs.autoSellOptions.querySelectorAll("[data-auto-sell]").forEach((box) => {
    box.addEventListener("change", () => {
      state.loot.autoSell[box.dataset.autoSell] = box.checked;
      if (box.dataset.autoSell === "normal") state.loot.autoSellNormal = box.checked;
      save();
    });
  });
}

function renderSkills() {
  const now = Date.now();
  refs.skillList.innerHTML = DATA.skills.map((skill) => {
    const locked = state.level < skill.requiredLevel;
    const remainMs = skillCooldownRemainingMs(skill, now);
    const cooling = remainMs > 0;
    const noMana = !locked && state.mp < Number(skill.mana || 0);
    const cooldownPct = cooling ? clamp(remainMs / scaledMs(skill.cooldownMs || 1) * 100, 0, 100) : 0;
    const formula = skill.type === "attack"
      ? `${Math.round((skill.multiplier || 1) * 100)}% · Lv.${skill.requiredLevel}`
      : `持续 ${Math.round((skill.durationMs || 0) / 1000)} 秒`;
    return `
      <div class="skill ${locked ? "locked" : ""} ${cooling ? "cooling" : ""} ${noMana ? "no-mana" : ""}" data-skill-id="${skill.id}" style="--cd:${cooldownPct}%">
        <b>${escapeHtml(skill.name)}</b>
        <small>${locked ? `Lv.${skill.requiredLevel} 开启` : cooling ? `冷却 ${Math.ceil(remainMs / 1000)} 秒` : noMana ? `MP 不足 · 需要 ${skill.mana}` : `${skill.mana} MP · ${Math.round(skill.cooldownMs / 1000)}秒`}</small>
        <em>${escapeHtml(skill.skillType || skill.type)}</em>
        <span>${escapeHtml(formula)}</span>
        ${cooling ? `<i>${Math.ceil(remainMs / 1000)}</i>` : ""}
      </div>
    `;
  }).join("");
  refs.priorityText.textContent = `释放顺序：${DATA.battle.skillOrder.map((id) => DATA.skills.find((s) => s.id === id)?.name).filter(Boolean).join(" > ")} > 普通攻击`;
}

function skillCooldownRemainingMs(skill, now = Date.now()) {
  return Math.max(0, (state.skillCd?.[skill.id] || 0) - now);
}

function renderDebugPanel() {
  if (!refs.debugPanel) return;
  const zone = DATA.zones[state.zoneId];
  const skillOrder = DATA.battle.skillOrder.map((id) => DATA.skills.find((s) => s.id === id)?.name).filter(Boolean).join(" > ");
  refs.debugPanel.innerHTML = `
    <div class="debug-card">
      <b>当前刷怪点</b>
      <span>${escapeHtml(zone.name)} · ${state.targetMonsterId ? escapeHtml(DATA.monsterById[state.targetMonsterId]?.name || "") : "随机可刷怪物"}</span>
      <small>攻击间隔 ${DATA.battle.attackIntervalMs}ms，怪物反击 ${DATA.battle.monsterAttackIntervalMs}ms，基础暴击 ${Math.round(DATA.battle.critChance * 100)}%</small>
    </div>
    <div class="debug-card">
      <b>经典剑士公式</b>
      <span>最小攻击=力量/6+武器；最大攻击=力量/4+武器；防御=敏捷/3+装备；命中=等级*5+敏捷*3+力量/4。</span>
      <small>单手副武器可放入副手，按 55% 武器攻击参与计算；幸运一击锁定最大攻击，卓越一击再乘 1.2。</small>
    </div>
    <div class="debug-card">
      <b>卓越 / 幸运</b>
      <span>卓越随机 1-2 条；幸运提供会心 +5%、灵魂强化成功率 +25%。装备不叠加。</span>
      <small>卓越词条已实装：卓越一击、攻击、攻速、击杀回血回蓝、生命魔法、防御、减伤、反伤、防御成功率、金币。</small>
    </div>
    <div class="debug-card">
      <b>技能公式</b>
      <span>${escapeHtml(skillOrder)} > 普通攻击</span>
      <small>技能伤害 = (攻击随机值 + 力量/敏捷/智力系数 + 固定伤害) * 技能倍率 - 怪物防御。</small>
    </div>
    <div class="debug-drops">
      ${zone.monsters.map((id) => {
        const monster = DATA.monsterById[id];
        return `<div><b>${escapeHtml(monster?.name || id)}</b><span>${escapeHtml(dropNamesForMonster(id).join("、") || "地图装备池、宝石")}</span></div>`;
      }).join("")}
    </div>
  `;
}

function dropNamesForMonster(monsterId) {
  return (DATA.drops[monsterId] || [])
    .map((drop) => drop.name || DATA.items[drop.itemId]?.name || drop.itemId || drop.type)
    .filter(Boolean);
}

function renderShop() {
  const items = Object.values(DATA.items);
  const potionGoods = items
    .filter((item) => item.kind === "potion")
    .map((item) => item.id);
  const goods = [...potionGoods, ...items
    .filter((item) => item.kind !== "reference" && item.kind !== "potion" && (item.requiredLevel || 0) <= 15)
    .slice(0, 8)
    .map((item) => item.id)]
    .slice(0, 10);
  refs.shopList.innerHTML = goods.map((id) => {
    const item = DATA.items[id];
    const hasPrice = typeof item.price === "number";
    return `<div class="shop-item"><div><b>${item.name}</b><small>${hasPrice ? `${item.price} 金币` : "价格资料未提供"}</small></div>${shopBuyControlsHtml(item, hasPrice)}</div>`;
  }).join("");
  refs.shopList.querySelectorAll("[data-buy]").forEach((btn) => btn.addEventListener("click", () => buyItem(btn.dataset.buy, buyQuantityFromButton(btn))));
}

function renderRewards() {
  refs.rewardExp.textContent = state.rewards.exp.toLocaleString();
  refs.rewardGold.textContent = state.rewards.gold.toLocaleString();
  refs.rewardEquip.textContent = state.rewards.equip.toLocaleString();
  refs.rewardJewels.textContent = state.rewards.jewels.toLocaleString();
}

function renderOfflineSummary() {
  if (!refs.offlineSummary) return;
  const data = state.offlineSummary;
  const pendingCount = (state.offlinePendingItems || []).length;
  if (!data) {
    refs.offlineSummary.textContent = pendingCount ? `离线临时背包：${pendingCount} 件待处理，点击查看` : "离线收益：暂无";
    return;
  }
  if (!data.kills) {
    refs.offlineSummary.textContent = `离线收益：${formatTime(data.seconds)}，未达到结算击杀`;
    return;
  }
  const drops = data.drops || {};
  const dropText = drops.equipment || drops.jewels ? `，${Number(drops.equipment || 0)} 装备，${Number(drops.jewels || 0)} 宝石/材料` : "";
  const pendingText = pendingCount ? `，临时背包 ${pendingCount} 件待处理` : "";
  refs.offlineSummary.textContent = `离线收益：${formatTime(data.seconds)}，击杀 ${data.kills}，${data.exp.toLocaleString()} 经验，${data.gold.toLocaleString()} 金币${dropText}${pendingText}`;
}

function showOfflineModalOnce() {
  if (offlineModalShown || !refs.offlineModal || !refs.offlineModalBody) return;
  const data = state.offlineSummary;
  if (!data || data.seconds < 60) return;
  offlineModalShown = true;
  openOfflineModal();
}

function openOfflineModal() {
  if (!refs.offlineModal || !refs.offlineModalBody || !state.offlineSummary) return;
  refs.offlineModalBody.innerHTML = offlineModalHtml(state.offlineSummary);
  refs.offlineModal.classList.remove("hidden");
}

function offlineModalHtml(data) {
  const levelText = data.levelAfter > data.levelBefore
    ? `Lv.${data.levelBefore} → Lv.${data.levelAfter}`
    : `Lv.${data.levelAfter}`;
  const capText = data.capped ? "已达到离线收益上限" : "正常结算";
  const pendingItems = state.offlinePendingItems || [];
  return `
    <div class="offline-total">
      <span>${escapeHtml(data.zoneName || "当前地图")}</span>
      <b>${formatTime(data.seconds)}</b>
      <small>${capText}</small>
    </div>
    <div class="offline-reward-grid">
      <div><span>击杀</span><b>${Number(data.kills || 0).toLocaleString()}</b></div>
      <div><span>经验</span><b>${Number(data.exp || 0).toLocaleString()}</b></div>
      <div><span>金币</span><b>${Number(data.gold || 0).toLocaleString()}</b></div>
      <div><span>等级</span><b>${levelText}</b></div>
      <div><span>装备</span><b>${Number(data.drops?.equipment || 0).toLocaleString()}</b></div>
      <div><span>宝石/材料</span><b>${Number(data.drops?.jewels || 0).toLocaleString()}</b></div>
    </div>
    <div class="offline-detail-list">
      <div><span>有效结算时间</span><b>${formatTime(data.effectiveSeconds || data.seconds)}</b></div>
      <div><span>平均击杀效率</span><b>${Number(data.killsPerMinute || 0).toLocaleString()} 只/分钟</b></div>
      <div><span>单只平均经验</span><b>${Number(data.avgExp || 0).toLocaleString()}</b></div>
      <div><span>单只平均金币</span><b>${Number(data.avgGold || 0).toLocaleString()}</b></div>
      <div><span>获得属性点</span><b>${Number(data.pointsGained || 0).toLocaleString()}</b></div>
      ${data.drops?.items?.length ? `<div><span>入包记录</span><b>${escapeHtml(data.drops.items.join("、"))}${Number(data.drops.equipment || 0) + Number(data.drops.jewels || 0) > data.drops.items.length ? " 等" : ""}</b></div>` : ""}
    </div>
    ${offlinePendingBagHtml(pendingItems)}
  `;
}

function offlinePendingBagHtml(items) {
  if (!items.length) {
    return `<div class="offline-temp-bag empty"><b>离线临时背包</b><span>暂无待处理物品</span></div>`;
  }
  const qualityButtons = EQUIPMENT_QUALITY_ORDER.map((quality) => {
    const count = items.filter((item) => isEquipment(DATA.items[item.itemId]) && (item.quality || "normal") === quality).length;
    return `<button data-offline-sell-quality="${quality}" ${count ? "" : "disabled"}>售${qualityLabel(quality)}(${count})</button>`;
  }).join("");
  const rows = items.map((item) => {
    const base = DATA.items[item.itemId] || {};
    const quality = inventoryCellQuality(item, base);
    return `
      <label class="offline-temp-item cell-quality-${quality}">
        <input type="checkbox" data-offline-keep="${escapeAttr(item.uid)}" checked>
        ${renderItem(item)}
        <small>${escapeHtml(qualityLabel(item.quality || base.quality || base.kind || "normal"))}</small>
      </label>
    `;
  }).join("");
  return `
    <div class="offline-temp-bag">
      <div class="offline-temp-head">
        <b>离线临时背包 <span>(${items.length})</span></b>
        <small>勾选要保留的物品，收取失败会继续暂存</small>
      </div>
      <div class="offline-temp-actions">
        <button data-offline-action="select-all">全选</button>
        <button data-offline-action="select-none">取消</button>
        <button data-offline-action="claim-selected">收取勾选</button>
        <button data-offline-action="sell-unselected">出售未勾选</button>
      </div>
      <div class="offline-temp-sell">${qualityButtons}</div>
      <div class="offline-temp-list">${rows}</div>
    </div>
  `;
}

function renderLog() {
  refs.logBox.innerHTML = (state.logs[activeLog] || []).map((entry) => {
    const text = entry.html || escapeHtml(entry.text);
    return `<p class="${entry.tone || ""}">[${escapeHtml(entry.time)}] ${text}</p>`;
  }).join("");
}

function renderRunTime() {
  const elapsed = state.running ? (Date.now() - runStartedAt) / 1000 : 0;
  refs.runTime.textContent = formatTime(elapsed);
  const hours = Math.max(1 / 60, elapsed / 3600);
  refs.effText.textContent = `${Math.floor(state.rewards.exp / hours).toLocaleString()} 经验/小时`;
}

function formatTime(totalSeconds) {
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  const m = Math.floor(totalSeconds / 60 % 60).toString().padStart(2, "0");
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function hydrateItemIcon(item) {
  if (!item) return item;
  const base = DATA.items[item.itemId];
  const next = { ...item };
  next.name = cleanBaseItemName(base?.name || next.name);
  if (base) next.slot = next.slot || base.slot;
  if (hasLuckOptionText(next.excellentOptions)) {
    next.luck = true;
  }
  if (next.quality === "excellent" || base?.quality === "excellent") {
    next.quality = "excellent";
    const ids = new Set(normalizeExcellentOptionIds(next, base));
    if (!ids.size) {
      assignedExcellentOptionIdsFromText(next.excellentOptions, base).forEach((id) => ids.add(id));
    }
    next.excellentOptionIds = [...ids];
    next.excellentOptions = next.excellentOptionIds.map((id) => excellentTextForId(id, next, base));
  }
  const icon = itemIconUrl(item, base);
  return icon ? { ...next, icon } : next;
}

boot().catch((error) => {
  document.body.innerHTML = `<pre style="padding:20px;color:#ffd27a">${error.stack}</pre>`;
});
