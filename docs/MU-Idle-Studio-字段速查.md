# MU Idle Studio 字段速查

这个文件给不熟代码的人看。Studio 里每个字段都会同时显示中文名和原始字段名，原始字段名不要随便改，因为游戏代码靠它读取数据。

## 通用字段

- `id`：唯一编号。掉落表、商店、地图都会用它引用资源。建议用英文、数字、下划线。
- `name`：游戏里显示的中文名。
- `category`：分类，例如单手剑、铠甲、宝石材料。
- `kind`：资源大类，例如 `weapon`、`armor`、`jewel`、`guardian`。
- `quality`：品质，例如 `normal`、`blue`、`excellent`、`set`、`epic`、`mythic`。
- `note`：备注，只给自己看。

## 装备字段

- `slot`：装备部位，例如 `weapon`、`armor`、`helm`、`boots`、`ring`。
- `classes`：可用职业，例如 `["剑士", "魔剑士"]`。
- `requiredLevel`：需要等级。
- `dropLevel`：掉落等级段。
- `attackMin` / `attackMax`：最小/最大攻击。
- `defense`：防御力。
- `dropMaps`：掉落地图列表，例如 `["勇者大陆", "冰风谷"]`。

## 怪物字段

- `map`：怪物所在地图。
- `level`：怪物等级。
- `hp`：生命值。
- `attackMin` / `attackMax`：怪物攻击区间。
- `defense`：怪物防御。
- `exp`：击杀经验。
- `goldMin` / `goldMax`：金币掉落范围。
- `image`：怪物图片路径。

## 地图字段

- `levelRange`：地图区域等级范围，例如 `20 - 52`。
- `monsters`：这个区域刷新的怪物 `id` 列表，不是中文名。

## 掉落字段

- `itemId`：掉落物品的 `id`。
- `weight`：掉落权重。权重越高越容易掉，但不是百分比。

## 技能字段

- `mana`：魔法消耗。
- `cooldownMs`：冷却时间，单位是毫秒。`1000` 等于 1 秒。
- `multiplier`：伤害倍率，`1.2` 表示 120%。
- `priority`：自动战斗释放优先级。

## 商店字段

- `currency`：货币，例如 `gold`。
- `itemId`：出售物品的 `id`。
- `price`：价格。
- `stock`：库存，`-1` 可作为不限量模板。

## 安全建议

改数值前，优先改 `name`、等级、攻击、防御、经验、价格这些直观字段。  
复杂字段例如数组、对象、公式，建议先复制一份原内容再改。
