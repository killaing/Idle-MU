const LIBRARIES = [
  {
    id: "equipment",
    icon: "装备",
    title: "装备数据库",
    paths: [
      "Data/Item/Weapons.json",
      "Data/Item/Armor.json",
      "Data/Item/Accessories.json",
      "Data/Item/Sets.json",
      "Data/Item/SetItems.json",
      "Data/Item/ExcellentOptions.json",
      "Data/Item/ItemAffixes.json",
      "Data/Item/TooltipRules.json",
      "Data/Item/ClassBranches.json"
    ],
    columns: ["id", "name", "kind", "slot", "quality", "requiredLevel", "dropLevel", "attackMin", "attackMax", "defense"]
  },
  {
    id: "monster",
    icon: "怪物",
    title: "怪物数据库",
    paths: ["Data/Monster/MonsterList.json", "Data/Monster/Spawn.json"],
    columns: ["id", "sourceId", "name", "map", "level", "hp", "attackMin", "attackMax", "defense", "exp"]
  },
  {
    id: "map",
    icon: "地图",
    title: "地图数据库",
    paths: ["Data/Map/Lorencia.json"],
    columns: ["id", "name", "levelRange", "monsters"]
  },
  {
    id: "drop",
    icon: "掉落",
    title: "掉落数据库",
    paths: ["Data/Monster/DropTable.json", "Data/Monster/DropTable.summary.json", "Data/Config/DropRates.json"],
    columns: ["id", "name", "map", "levelRange", "itemId", "weight", "note"]
  },
  {
    id: "skill",
    icon: "技能",
    title: "技能数据库",
    paths: ["Data/Character/Skills.json"],
    columns: ["id", "name", "type", "requiredLevel", "mana", "cooldownMs", "priority", "multiplier", "skillType"]
  },
  {
    id: "pet",
    icon: "宠物",
    title: "宠物数据库",
    paths: ["Data/Item/Guardians.json", "Data/Item/GuardianAttributes.json"],
    columns: ["id", "name", "category", "slot", "quality", "requiredLevel", "petLife", "icon"]
  },
  {
    id: "jewel",
    icon: "宝石",
    title: "宝石数据库",
    paths: ["Data/Item/Jewels.json"],
    columns: ["id", "name", "kind", "quality", "stack", "price", "icon", "use"]
  },
  {
    id: "shop",
    icon: "商店",
    title: "商店数据库",
    paths: ["Data/Shop/Shops.json"],
    columns: ["id", "name", "map", "currency", "itemId", "price", "stock", "requiredLevel"]
  },
  {
    id: "codex",
    icon: "图鉴",
    title: "图鉴数据库",
    paths: ["Data/Guide/KnightEquipmentGuide.json", "Data/Guide/Codex.json"],
    columns: ["id", "name", "category", "type", "targetId", "reward", "note"]
  },
  {
    id: "config",
    icon: "参数",
    title: "游戏参数数据库",
    paths: [
      "Data/Character/Knight.json",
      "Data/Character/LevelExp.json",
      "Data/Character/ClassFormulas.json",
      "Data/Config/AutoLoot.json",
      "Data/Config/Battle.json",
      "Data/Config/Offline.json"
    ],
    columns: ["id", "name", "key", "value", "enabled", "maxLevel", "formula", "attackIntervalMs"]
  }
];

const EMBEDDED_PATHS = [
  "Data/Item/Weapons.json",
  "Data/Item/Armor.json",
  "Data/Item/Accessories.json",
  "Data/Item/Sets.json",
  "Data/Item/SetItems.json",
  "Data/Item/Jewels.json",
  "Data/Item/Guardians.json",
  "Data/Item/GuardianAttributes.json",
  "Data/Item/ExcellentOptions.json",
  "Data/Item/ItemAffixes.json",
  "Data/Item/TooltipRules.json",
  "Data/Item/ClassBranches.json",
  "Data/Map/Lorencia.json",
  "Data/Monster/MonsterList.json",
  "Data/Monster/Spawn.json",
  "Data/Monster/DropTable.json",
  "Data/Character/Skills.json",
  "Data/Character/LevelExp.json",
  "Data/Character/ClassFormulas.json",
  "Data/Character/Knight.json",
  "Data/Config/AutoLoot.json",
  "Data/Config/Battle.json",
  "Data/Config/DropRates.json",
  "Data/Config/Offline.json",
  "Data/Guide/KnightEquipmentGuide.json",
  "Data/Shop/Shops.json",
  "Data/Guide/Codex.json"
];

const FIELD_LABELS = {
  id: "唯一编号",
  sourceId: "原始编号",
  name: "显示名称",
  category: "分类",
  kind: "资源类型",
  slot: "装备部位",
  quality: "品质",
  classes: "可用职业",
  requiredLevel: "需要等级",
  dropLevel: "掉落等级",
  requiredStrength: "需要力量",
  requiredAgility: "需要敏捷",
  requiredEnergy: "需要智力",
  requiredCommand: "需要统率",
  attackMin: "最小攻击",
  attackMax: "最大攻击",
  defense: "防御力",
  defenseMin: "最小防御",
  defenseMax: "最大防御",
  durability: "耐久",
  speed: "速度",
  dropMaps: "掉落地图",
  officialEffect: "官方效果",
  map: "地图",
  level: "等级",
  hp: "生命值",
  attackMin: "最小攻击",
  attackMax: "最大攻击",
  defenseSuccessRate: "防御成功率",
  exp: "经验",
  goldMin: "最少金币",
  goldMax: "最多金币",
  image: "图片路径",
  detailUrl: "资料链接",
  levelRange: "等级范围",
  monsters: "怪物列表",
  itemId: "物品编号",
  weight: "掉落权重",
  type: "类型",
  mana: "魔法消耗",
  cooldownMs: "冷却时间",
  priority: "优先级",
  multiplier: "伤害倍率",
  skillType: "技能类型",
  learnBy: "学习方式",
  petLife: "宠物生命",
  icon: "图标路径",
  effects: "效果列表",
  stack: "堆叠上限",
  price: "价格",
  currency: "货币",
  stock: "库存",
  targetId: "目标编号",
  earringSide: "耳环左右",
  reward: "奖励",
  note: "备注",
  key: "参数名",
  value: "参数值",
  enabled: "是否启用",
  maxLevel: "最高等级",
  formula: "公式"
};

const FIELD_HELP = {
  id: "每条资源的唯一名字，代码和掉落表会用它来互相引用。建议只用英文、数字和下划线。",
  sourceId: "从外部资料站导入时保留的原始编号，通常不用改。",
  name: "游戏里给玩家看的名字，可以直接写中文。",
  kind: "资源大类，例如 weapon、armor、jewel、guardian。会影响游戏如何识别它。",
  category: "更细的分类，例如单手剑、铠甲、宝石材料。",
  slot: "装备穿戴位置，例如 weapon、armor、helm、boots、ring。",
  quality: "品质标记，例如 normal、blue、excellent、set、epic、mythic。",
  classes: "哪些职业能使用。多个职业请用 JSON 数组，例如 [\"剑士\", \"魔剑士\"]。",
  requiredLevel: "角色达到这个等级后才能使用。",
  dropLevel: "用于掉落筛选和地图产出，大致表示这件资源属于哪个等级段。",
  requiredStrength: "穿戴或使用需要的力量。",
  requiredAgility: "穿戴或使用需要的敏捷。",
  requiredEnergy: "穿戴或使用需要的智力/能量。",
  attackMin: "武器或怪物的最低攻击值。",
  attackMax: "武器或怪物的最高攻击值。",
  defense: "防具、怪物或宠物提供的防御值。",
  durability: "装备耐久度。",
  speed: "攻击速度或动作速度，具体效果由游戏逻辑决定。",
  dropMaps: "这个物品会在哪些地图出现。多个地图请用 JSON 数组。",
  officialEffect: "展示用效果说明，不一定自动生效；真正生效通常还要看代码或效果字段。",
  map: "资源所在或主要出现的地图名称。",
  level: "怪物等级或资源等级。",
  hp: "怪物生命值，越高越耐打。",
  exp: "击杀怪物后获得的经验。",
  goldMin: "击杀后最少掉落金币。",
  goldMax: "击杀后最多掉落金币。",
  image: "图片文件路径。建议使用项目内相对路径。",
  levelRange: "地图区域适合的等级段，例如 20 - 52。",
  monsters: "地图区域会刷新的怪物 id 列表。这里填的是怪物的 id，不是中文名。",
  itemId: "掉落或商店出售的物品 id，必须能在装备、宝石、宠物等数据库里找到。",
  weight: "权重越大越容易出现。它不是百分比，而是和同一组其他权重一起计算。",
  mana: "释放技能消耗的魔法值。",
  cooldownMs: "技能冷却时间，单位是毫秒。1000 毫秒 = 1 秒。",
  priority: "自动战斗使用技能的优先级，通常数字越小越先判断。",
  multiplier: "技能伤害倍率，1.2 表示 120%。",
  learnBy: "技能如何获得，例如初始自带、NPC 购买、掉落。",
  petLife: "守护宠物自身生命值。",
  effects: "宠物或装备效果列表。复杂字段建议切到 JSON 编辑。",
  stack: "背包里最多叠加多少个。",
  price: "商店购买价格或资源价值。",
  currency: "购买使用的货币，例如 gold。",
  stock: "商店库存。留空或 -1 可表示不限量，取决于后续商店逻辑。",
  enabled: "true 表示启用，false 表示关闭。",
  formula: "计算公式，改错会影响升级或属性计算。",
  note: "给自己看的备注，不参与战斗计算。"
};

const LIBRARY_NOTES = {
  equipment: "装备库管理武器、防具、套装、词条和提示规则。新手优先改 name、requiredLevel、attack/defense、dropMaps。",
  monster: "怪物库管理怪物数值和刷新。新手优先改 name、map、level、hp、attackMin、attackMax、exp。",
  map: "地图库管理区域和区域里的怪物 id。monsters 填的是怪物 id，不是中文名。",
  drop: "掉落库管理怪物掉什么、掉落权重和全局爆率。weight 越大越容易掉。",
  skill: "技能库管理技能等级、蓝耗、冷却和伤害倍率。cooldownMs 单位是毫秒。",
  pet: "宠物库管理守护物、宠物属性和效果。",
  jewel: "宝石库管理强化、合成、材料类道具。",
  shop: "商店库管理 NPC 商店出售内容。itemId 要填写物品数据库里的 id。",
  codex: "图鉴库管理收集目标和奖励，可先从空记录开始逐步补。",
  config: "参数库管理战斗、离线、自动拾取、升级公式等全局规则。修改公式前建议先备份。"
};

const QUICK_TEMPLATES = {
  "Data/Shop/Shops.json": {
    id: "shop_item_new",
    name: "新商品",
    map: "勇者大陆",
    currency: "gold",
    itemId: "",
    price: 100,
    stock: -1,
    requiredLevel: 1,
    note: ""
  },
  "Data/Guide/Codex.json": {
    id: "codex_new",
    name: "新图鉴",
    category: "装备",
    type: "collect",
    targetId: "",
    reward: "",
    note: ""
  }
};

const EQUIPMENT_PATHS = new Set([
  "Data/Item/Weapons.json",
  "Data/Item/Armor.json",
  "Data/Item/Accessories.json",
  "Data/Item/Guardians.json",
  "Data/Item/Jewels.json"
]);

const TOOLTIP_FIELD_OPTIONS = [
  "name",
  "quality",
  "category",
  "classes",
  "requiredLevel",
  "requiredStrength",
  "requiredAgility",
  "attackMin,attackMax",
  "defense",
  "durability",
  "speed",
  "officialEffect",
  "excellentAttributes",
  "luckyAttributes",
  "dropMaps",
  "dropMonsters"
];

const state = {
  rootHandle: null,
  serverConnected: false,
  serverRoot: "",
  activeLibraryId: "equipment",
  activePath: "",
  selectedIndex: -1,
  query: "",
  viewMode: "table",
  files: new Map()
};

const $ = (id) => document.getElementById(id);
const els = {
  nav: $("libraryNav"),
  connect: $("connectFolderBtn"),
  reload: $("reloadBtn"),
  title: $("libraryTitle"),
  path: $("libraryPath"),
  summary: $("summaryStrip"),
  search: $("searchInput"),
  fileSelect: $("fileSelect"),
  viewMode: $("viewMode"),
  table: $("recordTable"),
  count: $("recordCount"),
  dirty: $("dirtyState"),
  form: $("fieldForm"),
  editorPanel: document.querySelector(".editor-panel"),
  editorTitle: $("editorTitle"),
  recordIndex: $("recordIndex"),
  jsonEditor: $("jsonEditor"),
  applyJson: $("applyJsonBtn"),
  formatJson: $("formatJsonBtn"),
  relation: $("relationPanel"),
  add: $("addRecordBtn"),
  duplicate: $("duplicateRecordBtn"),
  delete: $("deleteRecordBtn"),
  saveFile: $("saveFileBtn"),
  saveAll: $("saveAllBtn"),
  export: $("exportBtn"),
  rebuild: $("rebuildEmbeddedBtn"),
  toast: $("toast")
};

init();

function init() {
  renderNav();
  bindEvents();
  loadAllFromHttp();
}

function bindEvents() {
  els.connect.addEventListener("click", connectFolder);
  els.reload.addEventListener("click", reloadData);
  els.search.addEventListener("input", () => {
    state.query = els.search.value.trim().toLowerCase();
    state.selectedIndex = -1;
    render();
  });
  els.fileSelect.addEventListener("change", () => {
    state.activePath = els.fileSelect.value;
    state.selectedIndex = -1;
    render();
  });
  els.viewMode.addEventListener("change", () => {
    state.viewMode = els.viewMode.value;
    renderEditor();
  });
  els.add.addEventListener("click", addRecord);
  els.duplicate.addEventListener("click", duplicateRecord);
  els.delete.addEventListener("click", deleteRecord);
  els.saveFile.addEventListener("click", saveActiveFile);
  els.saveAll.addEventListener("click", saveAllFiles);
  els.export.addEventListener("click", exportActiveFile);
  els.rebuild.addEventListener("click", rebuildEmbeddedData);
  els.applyJson.addEventListener("click", applyJsonEdit);
  els.formatJson.addEventListener("click", formatJsonEdit);
}

function renderNav() {
  els.nav.innerHTML = "";
  for (const lib of LIBRARIES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = lib.id === state.activeLibraryId ? "active" : "";
    btn.innerHTML = `<span>${lib.icon} ${lib.title}</span><small>${lib.paths.length}</small>`;
    btn.addEventListener("click", () => {
      state.activeLibraryId = lib.id;
      state.activePath = "";
      state.selectedIndex = -1;
      renderNav();
      render();
    });
    els.nav.append(btn);
  }
}

async function connectFolder() {
  if (await connectStudioServer(true)) {
    await reloadData();
    return;
  }
  if (!window.showDirectoryPicker) {
    toast("当前浏览器不支持目录写入。请用 Start-MU-Idle-Studio.cmd 启动 Studio。", "error");
    return;
  }
  state.rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  await reloadData();
  toast("已连接项目目录，可以直接保存 JSON 文件。", "ok");
}

async function reloadData() {
  if (state.serverConnected) {
    await loadAllFromServer();
  } else if (state.rootHandle) {
    await loadAllFromFolder();
  } else {
    await loadAllFromHttp();
  }
}

async function connectStudioServer(showMessage = false) {
  try {
    const res = await fetch("/__studio/status", { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Studio server unavailable");
    state.serverConnected = true;
    state.serverRoot = data.root || "";
    if (showMessage) toast(`已连接本地项目：${state.serverRoot}`, "ok");
    return true;
  } catch {
    state.serverConnected = false;
    state.serverRoot = "";
    return false;
  }
}

async function loadAllFromHttp() {
  await connectStudioServer(false);
  if (state.serverConnected) return loadAllFromServer();
  for (const path of allKnownPaths()) {
    try {
      const res = await fetch(`${path}?studio=${Date.now()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setFile(path, data, false, false);
    } catch {
      setFile(path, emptyDataFor(path), false, true);
    }
  }
  render();
}

async function loadAllFromServer() {
  for (const path of allKnownPaths()) {
    try {
      const res = await fetch(`/__studio/read?path=${encodeURIComponent(path)}`, { cache: "no-store" });
      const payload = await res.json();
      if (payload.ok) {
        setFile(path, payload.data, false, false);
      } else if (payload.missing) {
        setFile(path, emptyDataFor(path), false, true);
      } else {
        setFile(path, emptyDataFor(path), false, true, payload.error || "Read failed");
      }
    } catch (error) {
      setFile(path, emptyDataFor(path), false, true, String(error.message || error));
    }
  }
  render();
}

async function loadAllFromFolder() {
  for (const path of allKnownPaths()) {
    try {
      const handle = await getFileHandle(path, false);
      if (!handle) {
        setFile(path, emptyDataFor(path), false, true);
        continue;
      }
      const file = await handle.getFile();
      const text = await file.text();
      setFile(path, JSON.parse(text), false, false);
    } catch (error) {
      setFile(path, emptyDataFor(path), false, true, String(error.message || error));
    }
  }
  render();
}

function allKnownPaths() {
  return [...new Set(LIBRARIES.flatMap((lib) => lib.paths).concat(EMBEDDED_PATHS))];
}

function setFile(path, data, dirty, missing, error = "") {
  state.files.set(path, {
    path,
    data,
    dirty,
    missing,
    error,
    original: JSON.stringify(data)
  });
}

function activeLibrary() {
  return LIBRARIES.find((lib) => lib.id === state.activeLibraryId) || LIBRARIES[0];
}

function activeFile() {
  const lib = activeLibrary();
  if (!state.activePath || !lib.paths.includes(state.activePath)) {
    state.activePath = lib.paths[0];
  }
  return state.files.get(state.activePath) || { path: state.activePath, data: emptyDataFor(state.activePath), dirty: false, missing: true };
}

function render() {
  const lib = activeLibrary();
  const file = activeFile();
  els.title.textContent = lib.title;
  els.connect.textContent = state.serverConnected ? "已连接本地项目" : "打开项目目录";
  els.path.textContent = state.serverConnected
    ? `本地项目 / ${file.path}`
    : state.rootHandle
      ? `项目目录 / ${file.path}`
      : `预览模式 / ${file.path}`;
  els.fileSelect.innerHTML = "";
  for (const path of lib.paths) {
    const option = document.createElement("option");
    const meta = state.files.get(path);
    option.value = path;
    option.textContent = `${path}${meta?.missing ? "（未创建）" : ""}${meta?.dirty ? " *" : ""}`;
    els.fileSelect.append(option);
  }
  els.fileSelect.value = file.path;
  updateDirtyState();
  renderSummary(lib);
  renderTable();
  renderEditor();
  renderRelations();
}

function renderSummary(lib) {
  const metrics = [
    ["当前文件", recordList(activeFile().data).length],
    ["本库文件", lib.paths.length],
    ["未保存", lib.paths.filter((path) => state.files.get(path)?.dirty).length],
    ["缺失文件", lib.paths.filter((path) => state.files.get(path)?.missing).length]
  ];
  els.summary.innerHTML = metrics.map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join("")
    + `<div class="metric library-note"><strong>提示</strong><span>${escapeHtml(LIBRARY_NOTES[lib.id] || "")}</span></div>`;
}

function renderTable() {
  const lib = activeLibrary();
  const rows = filteredRows();
  els.count.textContent = `${rows.length} 条记录`;
  els.table.innerHTML = "";
  const head = document.createElement("thead");
  head.innerHTML = `<tr>${lib.columns.map((col) => `<th title="${escapeHtml(col)}">${escapeHtml(fieldLabel(col))}</th>`).join("")}</tr>`;
  const body = document.createElement("tbody");
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.className = row.index === state.selectedIndex ? "selected" : "";
    tr.innerHTML = lib.columns.map((col) => `<td title="${escapeHtml(displayValue(row.record[col]))}">${escapeHtml(displayValue(row.record[col]))}</td>`).join("");
    tr.addEventListener("click", () => {
      state.selectedIndex = row.index;
      renderTable();
      renderEditor();
    });
    body.append(tr);
  }
  els.table.append(head, body);
}

function filteredRows() {
  const records = recordList(activeFile().data);
  return records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => !state.query || JSON.stringify(record).toLowerCase().includes(state.query));
}

function renderEditor() {
  const records = recordList(activeFile().data);
  const selected = records[state.selectedIndex];
  els.editorPanel.classList.toggle("json-mode", state.viewMode === "json");
  els.editorTitle.textContent = selected ? displayRecordTitle(selected) : "选择一条记录";
  els.recordIndex.textContent = selected ? `#${state.selectedIndex + 1}` : "";
  els.form.innerHTML = "";
  els.jsonEditor.value = selected ? JSON.stringify(selected, null, 2) : JSON.stringify(activeFile().data, null, 2);
  els.duplicate.disabled = !selected;
  els.delete.disabled = !selected;
  if (!selected) return;
  for (const [key, value] of Object.entries(selected)) {
    const label = document.createElement("label");
    const isComplex = value && typeof value === "object";
    label.innerHTML = `
      <span class="field-title">
        <b>${escapeHtml(fieldName(key))}</b>
        <code>${escapeHtml(key)}</code>
        <em>${escapeHtml(valueType(value))}</em>
      </span>
      <small>${escapeHtml(FIELD_HELP[key] || "项目自定义字段。不了解时可以先保持原值。")}</small>
    `;
    const input = document.createElement(isComplex || String(value).length > 80 ? "textarea" : "input");
    input.value = isComplex ? JSON.stringify(value, null, 2) : String(value ?? "");
    input.addEventListener("change", () => updateField(key, input.value, isComplex));
    label.append(input);
    els.form.append(label);
  }
  renderRelations();
}

function updateField(key, value, forceJson) {
  const records = recordList(activeFile().data);
  const record = records[state.selectedIndex];
  if (!record) return;
  try {
    record[key] = coerceValue(value, record[key], forceJson);
    markDirty();
    renderTable();
    renderEditor();
  } catch (error) {
    toast(`字段 ${key} 解析失败：${error.message}`, "error");
  }
}

function coerceValue(value, oldValue, forceJson) {
  if (forceJson) return JSON.parse(value || "null");
  if (typeof oldValue === "number") return Number(value);
  if (typeof oldValue === "boolean") return value === "true" || value === "1" || value === "是";
  if (value === "null") return null;
  return value;
}

function addRecord() {
  const file = activeFile();
  const records = ensureRecordArray(file);
  const sample = QUICK_TEMPLATES[file.path] || records[0] || {};
  const record = {};
  for (const key of Object.keys(sample)) record[key] = defaultValueFor(sample[key]);
  record.id = record.id || `${activeLibrary().id}_${Date.now().toString(36)}`;
  record.name = record.name || "新资源";
  records.unshift(record);
  state.selectedIndex = 0;
  markDirty();
  render();
}

function duplicateRecord() {
  const file = activeFile();
  const records = ensureRecordArray(file);
  const selected = records[state.selectedIndex];
  if (!selected) return;
  const clone = structuredClone(selected);
  clone.id = `${clone.id || activeLibrary().id}_${Date.now().toString(36)}`;
  if (clone.name) clone.name = `${clone.name} 副本`;
  records.splice(state.selectedIndex + 1, 0, clone);
  state.selectedIndex += 1;
  markDirty();
  render();
}

function deleteRecord() {
  const records = recordList(activeFile().data);
  const selected = records[state.selectedIndex];
  if (!selected) return;
  if (!confirm(`删除 ${displayRecordTitle(selected)}？`)) return;
  records.splice(state.selectedIndex, 1);
  state.selectedIndex = Math.min(state.selectedIndex, records.length - 1);
  markDirty();
  render();
}

function applyJsonEdit() {
  try {
    const parsed = JSON.parse(els.jsonEditor.value);
    const file = activeFile();
    if (state.selectedIndex >= 0 && Array.isArray(file.data)) {
      file.data[state.selectedIndex] = parsed;
    } else {
      file.data = parsed;
    }
    markDirty();
    render();
    toast("JSON 已应用。", "ok");
  } catch (error) {
    toast(`JSON 解析失败：${error.message}`, "error");
  }
}

function formatJsonEdit() {
  try {
    els.jsonEditor.value = JSON.stringify(JSON.parse(els.jsonEditor.value), null, 2);
  } catch (error) {
    toast(`JSON 解析失败：${error.message}`, "error");
  }
}

function markDirty(path = state.activePath) {
  const file = state.files.get(path);
  if (!file) return;
  file.dirty = true;
  file.missing = false;
}

function updateDirtyState() {
  const file = activeFile();
  const dirtyCount = [...state.files.values()].filter((entry) => entry.dirty).length;
  if (file.dirty) {
    els.dirty.textContent = "当前文件未保存";
    els.dirty.className = "dirty";
    return;
  }
  if (file.missing) {
    els.dirty.textContent = "文件未创建";
    els.dirty.className = "dirty";
    return;
  }
  if (dirtyCount) {
    els.dirty.textContent = `${dirtyCount} 个关联文件未保存`;
    els.dirty.className = "dirty";
    return;
  }
  els.dirty.textContent = "已同步";
  els.dirty.className = "ok";
}

function selectedRecord() {
  return recordList(activeFile().data)[state.selectedIndex] || null;
}

function renderRelations() {
  const record = selectedRecord();
  if (!els.relation) return;
  if (!record) {
    els.relation.innerHTML = `<div class="relation-empty">选择一条记录后，可在这里编辑地图、怪物、掉落和悬浮卡联动。</div>`;
    return;
  }

  if (EQUIPMENT_PATHS.has(activeFile().path)) {
    renderItemRelations(record);
    return;
  }

  if (activeFile().path === "Data/Monster/MonsterList.json") {
    renderMonsterRelations(record);
    return;
  }

  els.relation.innerHTML = `<div class="relation-empty">当前数据库没有专属联动面板，可继续使用上方字段或 JSON 编辑。</div>`;
}

function renderItemRelations(item) {
  const maps = mapOptions();
  const monsters = monsterOptions();
  const linkedMonsterIds = new Set(monsters.filter((monster) => itemDropsFromMonster(item.id, monster.id)).map((monster) => monster.id));
  const activeMaps = new Set(Array.isArray(item.dropMaps) ? item.dropMaps : []);
  const activeTooltipFields = new Set(itemTooltipFields(item));

  els.relation.innerHTML = `
    <section class="relation-section">
      <div class="relation-title">
        <strong>掉落地图联动</strong>
        <small>勾选后写入当前物品的 dropMaps 字段</small>
      </div>
      <div class="check-grid compact" data-relation="maps">
        ${maps.map((map) => checkMarkup("map", map.name, map.name, activeMaps.has(map.name), `${map.levelRange || ""} ${map.count} 怪`)).join("")}
      </div>
    </section>
    <section class="relation-section">
      <div class="relation-title">
        <strong>具体怪物掉落</strong>
        <small>勾选后同步写入 Data/Monster/DropTable.json</small>
      </div>
      <div class="relation-tools">
        <input type="search" data-relation-search="monster" placeholder="搜索怪物、地图、等级">
        <button type="button" data-relation-action="select-map-monsters">勾选已选地图怪物</button>
      </div>
      <div class="check-grid monster-grid" data-relation="monsters">
        ${monsters.map((monster) => checkMarkup("monster", monster.id, monsterLabel(monster), linkedMonsterIds.has(monster.id), monster.id)).join("")}
      </div>
    </section>
    <section class="relation-section">
      <div class="relation-title">
        <strong>悬浮卡字段</strong>
        <small>勾选要在物品悬浮提示中展示的属性</small>
      </div>
      <div class="check-grid compact" data-relation="tooltip">
        ${TOOLTIP_FIELD_OPTIONS.map((field) => checkMarkup("tooltip", field, fieldLabel(field), activeTooltipFields.has(field), FIELD_HELP[field] || field)).join("")}
      </div>
      ${tooltipPreview(item)}
    </section>
  `;

  bindItemRelationEvents(item);
}

function renderMonsterRelations(monster) {
  const items = allDropItems();
  const dropEntries = monsterDropEntries(monster.id);
  const linkedItemIds = new Set(dropEntries.map((entry) => entry.itemId));

  els.relation.innerHTML = `
    <section class="relation-section">
      <div class="relation-title">
        <strong>怪物掉落物品</strong>
        <small>勾选后同步写入 Data/Monster/DropTable.json，并回写物品 dropMonsters</small>
      </div>
      <div class="relation-tools">
        <input type="search" data-relation-search="item" placeholder="搜索装备、宝石、宠物、部位、品质">
      </div>
      <div class="check-grid item-grid" data-relation="items">
        ${items.map((item) => checkMarkup("item", item.id, itemLabel(item), linkedItemIds.has(item.id), item.path)).join("")}
      </div>
    </section>
    <section class="relation-section">
      <div class="relation-title">
        <strong>当前掉落预览</strong>
        <small>${dropEntries.length} 个物品</small>
      </div>
      <div class="drop-preview">
        ${dropEntries.length ? dropEntries.map((entry) => `<span>${escapeHtml(itemNameById(entry.itemId) || entry.itemId)} · 权重 ${escapeHtml(entry.weight ?? 1)}</span>`).join("") : "<span>暂无掉落</span>"}
      </div>
    </section>
  `;

  bindMonsterRelationEvents(monster);
}

function bindItemRelationEvents(item) {
  els.relation.querySelectorAll('input[data-kind="map"]').forEach((input) => {
    input.addEventListener("change", () => {
      const selected = checkedValues("map");
      item.dropMaps = selected;
      markDirty();
      updateDirtyState();
      renderTable();
      renderRelations();
    });
  });

  els.relation.querySelectorAll('input[data-kind="monster"]').forEach((input) => {
    input.addEventListener("change", () => {
      setMonsterDrop(input.value, item, input.checked);
      syncItemMonsterNames(item);
      updateDirtyState();
      renderTable();
      renderRelations();
    });
  });

  els.relation.querySelectorAll('input[data-kind="tooltip"]').forEach((input) => {
    input.addEventListener("change", () => {
      setTooltipFields(item, checkedValues("tooltip"));
      markDirty();
      updateDirtyState();
      renderRelations();
    });
  });

  const monsterSearch = els.relation.querySelector('[data-relation-search="monster"]');
  if (monsterSearch) {
    monsterSearch.addEventListener("input", () => filterRelationChecks("monster", monsterSearch.value));
  }

  const selectMapMonsters = els.relation.querySelector('[data-relation-action="select-map-monsters"]');
  if (selectMapMonsters) {
    selectMapMonsters.addEventListener("click", () => {
      const selectedMaps = new Set(Array.isArray(item.dropMaps) ? item.dropMaps : []);
      for (const monster of monsterOptions()) {
        if (selectedMaps.has(monster.map)) setMonsterDrop(monster.id, item, true);
      }
      syncItemMonsterNames(item);
      updateDirtyState();
      renderTable();
      renderRelations();
    });
  }
}

function bindMonsterRelationEvents(monster) {
  els.relation.querySelectorAll('input[data-kind="item"]').forEach((input) => {
    input.addEventListener("change", () => {
      const item = itemById(input.value);
      if (!item) return;
      setMonsterDrop(monster.id, item.record, input.checked);
      syncItemMonsterNames(item.record);
      markDirty(item.path);
      updateDirtyState();
      renderRelations();
    });
  });

  const itemSearch = els.relation.querySelector('[data-relation-search="item"]');
  if (itemSearch) {
    itemSearch.addEventListener("input", () => filterRelationChecks("item", itemSearch.value));
  }
}

function checkMarkup(kind, value, label, checked, hint = "") {
  return `
    <label class="relation-check" data-filter="${escapeHtml(`${label} ${hint}`.toLowerCase())}">
      <input type="checkbox" data-kind="${escapeHtml(kind)}" value="${escapeHtml(value)}" ${checked ? "checked" : ""}>
      <span>${escapeHtml(label)}</span>
      ${hint ? `<small>${escapeHtml(hint)}</small>` : ""}
    </label>
  `;
}

function checkedValues(kind) {
  return [...els.relation.querySelectorAll(`input[data-kind="${kind}"]:checked`)].map((input) => input.value);
}

function filterRelationChecks(kind, query) {
  const normalized = query.trim().toLowerCase();
  els.relation.querySelectorAll(`input[data-kind="${kind}"]`).forEach((input) => {
    const label = input.closest(".relation-check");
    const haystack = label?.dataset.filter || "";
    if (label) label.hidden = normalized && !haystack.includes(normalized);
  });
}

function mapOptions() {
  const mapData = state.files.get("Data/Map/Lorencia.json")?.data;
  const zones = mapData?.zones || [];
  return zones.map((zone) => ({
    id: zone.id,
    name: zone.name || zone.id,
    levelRange: zone.levelRange || "",
    count: Array.isArray(zone.monsters) ? zone.monsters.length : 0
  }));
}

function monsterOptions() {
  const monsters = state.files.get("Data/Monster/MonsterList.json")?.data || [];
  return Array.isArray(monsters) ? monsters : [];
}

function monsterLabel(monster) {
  return `${monster.map || "未知地图"} / Lv.${monster.level ?? "?"} / ${monster.name || monster.id}`;
}

function allDropItems() {
  return [...EQUIPMENT_PATHS]
    .flatMap((path) => {
      const data = state.files.get(path)?.data;
      return (Array.isArray(data) ? data : []).map((record) => ({ ...record, path }));
    })
    .filter((item) => item.id);
}

function itemLabel(item) {
  return `${item.name || item.id} · ${item.category || item.kind || "物品"} · ${item.quality || "normal"}`;
}

function itemById(id) {
  for (const path of EQUIPMENT_PATHS) {
    const records = state.files.get(path)?.data;
    if (!Array.isArray(records)) continue;
    const record = records.find((item) => item.id === id);
    if (record) return { record, path };
  }
  return null;
}

function itemNameById(id) {
  return itemById(id)?.record?.name || "";
}

function dropTableFile() {
  let file = state.files.get("Data/Monster/DropTable.json");
  if (!file) {
    file = { path: "Data/Monster/DropTable.json", data: {}, dirty: false, missing: false };
    state.files.set(file.path, file);
  }
  if (!file.data || typeof file.data !== "object" || Array.isArray(file.data)) file.data = {};
  return file;
}

function monsterDropEntries(monsterId) {
  const data = dropTableFile().data;
  if (!Array.isArray(data[monsterId])) data[monsterId] = [];
  return data[monsterId];
}

function itemDropsFromMonster(itemId, monsterId) {
  return monsterDropEntries(monsterId).some((entry) => entry.itemId === itemId);
}

function setMonsterDrop(monsterId, item, enabled) {
  const file = dropTableFile();
  const entries = monsterDropEntries(monsterId);
  const index = entries.findIndex((entry) => entry.itemId === item.id);
  if (enabled && index < 0) {
    entries.push({
      type: "item",
      itemId: item.id,
      quality: item.quality || "normal",
      weight: 1,
      source: "muIdleStudio",
      sourceItem: item.name || item.id,
      sourceMonster: monsterNameById(monsterId),
      sourceCategory: item.category || item.kind || ""
    });
  }
  if (!enabled && index >= 0) entries.splice(index, 1);
  file.dirty = true;
  file.missing = false;
}

function monsterNameById(monsterId) {
  const monster = monsterOptions().find((entry) => entry.id === monsterId);
  if (!monster) return monsterId;
  return `[Lv.${monster.level ?? "?"}]${monster.name || monster.id}`;
}

function syncItemMonsterNames(item) {
  const names = monsterOptions()
    .filter((monster) => itemDropsFromMonster(item.id, monster.id))
    .map((monster) => monster.name || monster.id);
  item.dropMonsters = [...new Set(names)];
  markDirty(itemPathById(item.id) || state.activePath);
}

function itemPathById(id) {
  return itemById(id)?.path || "";
}

function itemTooltipFields(item) {
  if (item.tooltip && Array.isArray(item.tooltip.lines)) {
    return item.tooltip.lines.map((line) => line.field).filter(Boolean);
  }
  return ["name", "quality", "category", "requiredLevel", "attackMin,attackMax", "defense", "officialEffect"];
}

function setTooltipFields(item, fields) {
  item.tooltip = {
    templateId: "mu_studio_custom",
    lines: fields.map((field) => tooltipLineFor(field))
  };
}

function tooltipLineFor(field) {
  const label = fieldName(field);
  if (field === "name") return { field, label: "", color: "name", format: "{value}", showIf: "always" };
  if (field.includes(",")) {
    const [a, b] = field.split(",");
    return { field, label, color: "normal", format: `${label}: {${a}} ~ {${b}}`, showIf: a };
  }
  return { field, label, color: "normal", format: `${label}: {value}`, showIf: "exists" };
}

function tooltipPreview(item) {
  const fields = itemTooltipFields(item);
  const rows = fields.map((field) => {
    const value = tooltipValue(item, field);
    if (!value) return "";
    return `<div><b>${escapeHtml(fieldName(field))}</b><span>${escapeHtml(value)}</span></div>`;
  }).filter(Boolean).join("");
  return `
    <div class="tooltip-preview">
      <strong>悬浮卡预览</strong>
      ${rows || "<div><span>暂无展示字段</span></div>"}
    </div>
  `;
}

function tooltipValue(item, field) {
  if (field.includes(",")) {
    const [a, b] = field.split(",");
    const left = item[a];
    const right = item[b];
    if (left == null && right == null) return "";
    return `${left ?? "-"} ~ ${right ?? "-"}`;
  }
  return displayValue(item[field]);
}

async function saveActiveFile() {
  await saveFile(activeFile().path);
  render();
}

async function saveAllFiles() {
  const dirtyPaths = [...state.files.values()].filter((file) => file.dirty || file.missing).map((file) => file.path);
  for (const path of dirtyPaths) await saveFile(path, false);
  render();
  toast(`已保存 ${dirtyPaths.length} 个文件。`, "ok");
}

async function saveFile(path, showToast = true) {
  const file = state.files.get(path);
  if (!file) return;
  const text = JSON.stringify(file.data, null, 2) + "\n";
  if (state.serverConnected) {
    await writeTextFile(path, text);
    file.dirty = false;
    file.missing = false;
    file.original = JSON.stringify(file.data);
    if (showToast) toast(`已保存 ${path}`, "ok");
    return;
  }
  if (!state.rootHandle) {
    download(path.split("/").pop(), text, "application/json");
    if (showToast) toast("未连接项目目录，已改为下载 JSON。", "dirty");
    return;
  }
  await writeTextFile(path, text);
  file.dirty = false;
  file.missing = false;
  file.original = JSON.stringify(file.data);
  if (showToast) toast(`已保存 ${path}`, "ok");
}

function exportActiveFile() {
  const file = activeFile();
  download(file.path.split("/").pop(), JSON.stringify(file.data, null, 2) + "\n", "application/json");
}

async function rebuildEmbeddedData() {
  const payload = {};
  for (const path of EMBEDDED_PATHS) {
    const file = state.files.get(path);
    if (file && !file.missing) payload[path] = file.data;
  }
  const text = `window.MU_EMBEDDED_DATA = ${JSON.stringify(payload)};\n`;
  if (state.rootHandle) {
    await writeTextFile("Data/embedded-data.js", text);
    toast("已重建 Data/embedded-data.js。", "ok");
  } else {
    download("embedded-data.js", text, "text/javascript");
    toast("未连接项目目录，已下载 embedded-data.js。", "dirty");
  }
}

async function writeTextFile(path, text) {
  if (state.serverConnected) {
    const res = await fetch("/__studio/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, content: text })
    });
    const payload = await res.json();
    if (!payload.ok) throw new Error(payload.error || "Write failed");
    return;
  }
  const handle = await getFileHandle(path, true);
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

async function getFileHandle(path, create) {
  if (!state.rootHandle) return null;
  const parts = path.split("/");
  let dir = state.rootHandle;
  for (const part of parts.slice(0, -1)) {
    try {
      dir = await dir.getDirectoryHandle(part, { create });
    } catch (error) {
      if (!create) return null;
      throw error;
    }
  }
  try {
    return await dir.getFileHandle(parts[parts.length - 1], { create });
  } catch {
    return null;
  }
}

function recordList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.zones)) return data.zones;
  if (data && typeof data === "object") {
    if (Array.isArray(data.items)) return data.items;
    return Object.entries(data).map(([key, value]) => {
      if (value && typeof value === "object" && !Array.isArray(value)) return { id: key, ...value };
      return { key, value };
    });
  }
  return [];
}

function ensureRecordArray(file) {
  if (Array.isArray(file.data)) return file.data;
  if (file.data && Array.isArray(file.data.zones)) return file.data.zones;
  file.data = [];
  return file.data;
}

function emptyDataFor(path) {
  if (path.endsWith("Shops.json")) return [];
  if (path.endsWith("Codex.json")) return [];
  if (path.includes("DropTable.json") || path.includes("Spawn.json")) return {};
  if (path.includes("Config/") || path.includes("ClassFormulas") || path.includes("LevelExp") || path.includes("Knight")) return {};
  if (path.includes("Map/")) return { id: "new_map_world", name: "新地图世界", zones: [] };
  return [];
}

function defaultValueFor(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") return {};
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  return "";
}

function displayValue(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function displayRecordTitle(record) {
  return record.name || record.id || record.key || "未命名资源";
}

function fieldLabel(key) {
  return FIELD_LABELS[key] ? `${FIELD_LABELS[key]} (${key})` : key;
}

function fieldName(key) {
  return FIELD_LABELS[key] || key;
}

function valueType(value) {
  if (Array.isArray(value)) return "列表";
  if (value === null) return "空";
  if (typeof value === "object") return "对象";
  if (typeof value === "number") return "数字";
  if (typeof value === "boolean") return "开关";
  return "文本";
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toast(message, type = "") {
  els.toast.textContent = message;
  els.toast.className = `toast show ${type}`;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    els.toast.className = "toast";
  }, 2800);
}
