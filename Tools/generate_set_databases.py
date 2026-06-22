import csv
import json
import re
import shutil
from collections import defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "mu_sets_full_output_fixed" / "set_item_relations_full.csv"
WEAPONS = ROOT / "Data" / "Item" / "Weapons.json"
ARMOR = ROOT / "Data" / "Item" / "Armor.json"
OUT_ITEM = ROOT / "Data" / "Item" / "SetItems.json"
OUT_SET = ROOT / "Data" / "Item" / "Sets.json"
OUT_AFFIX = ROOT / "Data" / "Item" / "ItemAffixes.json"
OUT_ICON_DIR = ROOT / "Assets" / "SetIcons"
PLACEHOLDER = "%" + "d"


SLOT_BY_TYPE = {
    6: ("armor", "shield", "盾牌"),
    7: ("armor", "helm", "头盔"),
    8: ("armor", "armor", "铠甲"),
    9: ("armor", "pants", "护腿"),
    10: ("armor", "gloves", "护手"),
    11: ("armor", "boots", "靴子"),
}

SET_PREFIXES = [
    "哈德的强化", "哈德的",
    "瑞恩的强化", "瑞恩的",
    "赫兰德的强化", "赫兰德的",
    "海德拉的强化", "海德拉的",
    "菲斯特的强化", "菲斯特的",
    "汉斯的强化", "汉斯的",
    "始祖的", "强化的", "愤怒的", "勇猛的", "保护的", "防御剑士",
]

COPY_FIELDS = [
    "requiredLevel", "dropLevel", "requiredStrength", "requiredAgility",
    "requiredEnergy", "requiredCommand", "durability", "speed",
    "statMin", "statMax", "attackMin", "attackMax",
    "defenseMin", "defenseMax", "defense", "defenseRate",
    "dropMaps", "price",
]


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def parse_item_code(row):
    raw = row.get("item_id", "") or row.get("item_code", "")
    match = re.search(r"(\d+)-(\d+)", raw)
    if not match:
        return 0, int(row["item_seq"])
    return int(match.group(1)), int(match.group(2))


def slot_for(row, item_type):
    name = row["item_name"]
    if item_type in SLOT_BY_TYPE:
        return SLOT_BY_TYPE[item_type]
    if item_type == 13:
        if "项链" in name:
            return "armor", "pendant", "项链"
        if "指环" in name or "戒指" in name:
            return "armor", "ring", "戒指"
    return "weapon", "weapon", "武器"


def strip_set_prefix(name):
    text = name.strip()
    changed = True
    while changed:
        changed = False
        for prefix in SET_PREFIXES:
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
                changed = True
    text = re.sub(r"^剑士\d*代\s*", "", text).strip()
    text = re.sub(r"^剑士(觉醒|奥义|先祖|咆哮|天界|红焰|远古)之", "", text).strip()
    text = re.sub(r"^传奇.*?剑士\s*", "", text).strip()
    text = re.sub(r"^传奇.*?骑士\s*", "", text).strip()
    text = text.replace("(信念)", "").strip()
    text = text.replace("之盔", "盔").replace("之铠", "铠").replace("之靴", "靴").strip()
    return text


def trim_source_text(text):
    text = text or ""
    text = re.split(r"套装属性", text, maxsplit=1)[0] + (" 套装属性" if "套装属性" in text else "")
    text = re.split(r"\s*道具出处|\s*效果图|Powered by|登录 注册", text, maxsplit=1)[0]
    return text


def clean_template(text):
    text = trim_source_text(text)
    text = re.sub(r"\{\{[^}]+\}\}", "", text)
    text = text.replace(f"{PLACEHOLDER} ~ {PLACEHOLDER}", "")
    text = text.replace(f"[{PLACEHOLDER}/{PLACEHOLDER}]", "")
    text = text.replace(PLACEHOLDER, "")
    text = re.sub(r":\s+(?=\(\d+\))", "：", text)
    text = re.sub(r"：\s+(?=\(\d+\))", "：", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip(" ：")


def explicit_level(row):
    text = f"{row.get('set_name', '')} {row.get('item_code', '')}"
    named = re.search(r"(\d+)级", text)
    if named:
        return int(named.group(1))
    direct = re.search(r"需求等级[：:]\s*(\d+)", text)
    return int(direct.group(1)) if direct else None


def explicit_extra_affixes(text):
    affixes = []
    patterns = [
        ("力量增加", "strengthFlat"),
        ("敏捷增加", "agilityFlat"),
        ("体力增加", "vitalityFlat"),
        ("智力增加", "energyFlat"),
        ("所有属性增加", "allStatsFlat"),
    ]
    for label, effect in patterns:
        match = re.search(label + r"\s*\+\((\d+)/(\d+)\)", text or "")
        if match:
            affixes.append({
                "affixId": f"extra_{effect}_{match.group(1)}_{match.group(2)}",
                "effect": effect,
                "values": [int(match.group(1)), int(match.group(2))],
                "label": f"{label} +({match.group(1)}/{match.group(2)})",
                "source": "explicitText",
            })
    return affixes


def build_base_lookup():
    bases = load_json(WEAPONS) + load_json(ARMOR)
    lookup = {}
    for item in bases:
        names = {
            item["name"],
            item["name"].replace("之", ""),
            item["name"].replace("护手", "手").replace("护腿", "腿"),
        }
        for name in names:
            lookup[name] = item
    return lookup


def copy_known_numeric_fields(source):
    if not source:
        return {}
    return {field: source[field] for field in COPY_FIELDS if field in source}


def item_icon_path(row, item_id):
    source = ROOT / row["icon_local"]
    suffix = source.suffix or ".png"
    target = OUT_ICON_DIR / f"{item_id}{suffix.lower()}"
    if source.exists():
        OUT_ICON_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        return str(target.relative_to(ROOT)).replace("\\", "/")
    return ""


def build_item(row, base_lookup):
    item_type, item_index = parse_item_code(row)
    kind, slot, slot_label = slot_for(row, item_type)
    base_name = strip_set_prefix(row["item_name"])
    matched = base_lookup.get(base_name) or base_lookup.get(base_name.replace("之", ""))
    item_id = f"set_{row['runtime_set_id']}_{item_type}_{item_index}_{row['item_seq']}"
    numeric = copy_known_numeric_fields(matched)
    level = explicit_level(row)
    if level is not None:
        numeric["requiredLevel"] = level
        numeric["dropLevel"] = level

    return {
        "id": item_id,
        "sourceItemId": f"{item_type}-{item_index}",
        "sourceSetId": row["source_set_id"],
        "setId": row["runtime_set_id"],
        "setName": row["set_name"],
        "setPieceSeq": int(row["item_seq"]),
        "name": row["item_name"],
        "baseItemName": base_name,
        "baseItemId": matched.get("id") if matched else "",
        "kind": matched.get("kind", kind) if matched else kind,
        "slot": matched.get("slot", slot) if matched else slot,
        "category": matched.get("category", f"剑士套装{slot_label}") if matched else f"剑士套装{slot_label}",
        "quality": "set",
        "classes": matched.get("classes", ["剑士"]) if matched else ["剑士"],
        "icon": item_icon_path(row, item_id),
        "itemUrl": row["item_url"],
        "sourceIconUrl": row["icon_url"],
        "sourceTemplate": clean_template(row.get("item_code", "")),
        "numericSource": "matchedBaseItem" if matched else "unresolvedTemplate",
        "affixIds": ["luck_crit_5", "luck_upgrade_25"],
        "guaranteedLuck": True,
        "explicitExtraAffixes": explicit_extra_affixes(row.get("item_code", "")),
        "officialEffect": f"{row['set_name']}散件。基础数值来源：{matched['name'] if matched else '参考资料为占位模板，待精确录入'}。",
        **numeric,
    }


def set_bonuses(rows):
    piece_count = len(rows)
    bonuses = []
    for required in (2, 3, 4):
        if piece_count >= required:
            bonuses.append({
                "requiredPieces": required,
                "affixes": [{"affixId": f"set_piece_count_{required}", "effect": "setPiecesActive", "value": required}],
                "note": "参考资料未给出明确数值，暂仅记录激活阶段。",
            })
    bonuses.append({
        "requiredPieces": piece_count,
        "affixes": [{"affixId": "set_full_active", "effect": "setFullActive", "value": 1}],
        "note": "参考资料未给出明确数值，暂仅记录满套激活。",
    })
    return bonuses


def build_affixes():
    return {
        "version": 1,
        "affixes": [
            {"id": "luck_crit_5", "family": "luck", "label": "幸运：会心一击率 +5%", "effect": "critChance", "defaultValue": 0.05, "stacking": "add"},
            {"id": "luck_upgrade_25", "family": "luck", "label": "幸运：灵魂宝石成功率 +25%", "effect": "upgradeChance", "defaultValue": 0.25, "stacking": "add"},
            {"id": "excellent_rate_10", "family": "excellent", "label": "卓越一击概率 +10%", "effect": "excellentDamageRate", "defaultValue": 0.10, "stacking": "add"},
            {"id": "excellent_attack_2p", "family": "excellent", "label": "攻击力 +2%", "effect": "attackPercent", "defaultValue": 0.02, "stacking": "add"},
            {"id": "excellent_speed_7", "family": "excellent", "label": "攻击速度 +7", "effect": "attackSpeed", "defaultValue": 7, "stacking": "add"},
            {"id": "set_piece_count_2", "family": "set", "label": "套装 2 件激活", "effect": "setPiecesActive", "defaultValue": 2, "stacking": "flag"},
            {"id": "set_piece_count_3", "family": "set", "label": "套装 3 件激活", "effect": "setPiecesActive", "defaultValue": 3, "stacking": "flag"},
            {"id": "set_piece_count_4", "family": "set", "label": "套装 4 件激活", "effect": "setPiecesActive", "defaultValue": 4, "stacking": "flag"},
            {"id": "set_full_active", "family": "set", "label": "套装满件激活", "effect": "setFullActive", "defaultValue": 1, "stacking": "flag"},
        ],
    }


def main():
    with SOURCE.open("r", encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.DictReader(fh))

    base_lookup = build_base_lookup()
    sets_by_id = {}
    rows_by_set = defaultdict(list)
    for row in rows:
        rows_by_set[row["runtime_set_id"]].append(row)

    items = []
    for sid, set_rows in rows_by_set.items():
        first = set_rows[0]
        sets_by_id[sid] = {
            "id": sid,
            "sourceSetId": first["source_set_id"],
            "name": first["set_name"],
            "class": "剑士",
            "pieceCount": len(set_rows),
            "pieceIds": [],
            "bonuses": set_bonuses(set_rows),
            "sourceUrl": first.get("set_url", ""),
        }
        for row in set_rows:
            item = build_item(row, base_lookup)
            items.append(item)
            sets_by_id[sid]["pieceIds"].append(item["id"])

    OUT_ITEM.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_SET.write_text(json.dumps({"version": 1, "source": str(SOURCE.relative_to(ROOT)), "sets": list(sets_by_id.values())}, ensure_ascii=False, indent=2), encoding="utf-8")
    OUT_AFFIX.write_text(json.dumps(build_affixes(), ensure_ascii=False, indent=2), encoding="utf-8")
    matched = sum(1 for item in items if item["numericSource"] == "matchedBaseItem")
    print(f"wrote {len(items)} set items, {len(sets_by_id)} sets, {matched} matched numeric base items")


if __name__ == "__main__":
    main()
