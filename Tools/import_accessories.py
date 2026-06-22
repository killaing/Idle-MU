import csv
import hashlib
import json
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "\u5251\u58eb\u88c5\u5907\u5e93"
TARGET_JSON = ROOT / "Data" / "Item" / "Accessories.json"
TARGET_ICON_ROOT = ROOT / "Assets" / "Equipment" / "Accessories"

SOURCES = [
    {
        "dir": "output(\u5168\u804c\u4e1a\u6212\u6307\uff09",
        "slot": "ring",
        "category": "\u5168\u804c\u4e1a\u6212\u6307",
        "icon_dir": "ring",
    },
    {
        "dir": "output(\u5168\u804c\u4e1a\u9879\u94fe\uff09",
        "slot": "pendant",
        "category": "\u5168\u804c\u4e1a\u9879\u94fe",
        "icon_dir": "pendant",
    },
    {
        "dir": "output(\u5168\u804c\u4e1a\u8033\u73af\uff09",
        "slot": "earring",
        "category": "\u5168\u804c\u4e1a\u8033\u73af",
        "icon_dir": "earring",
    },
]


def load_json_value(value, fallback):
    if value is None or value == "":
        return fallback
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return fallback


def clean_lines(lines):
    return [
        str(line).strip()
        for line in (lines or [])
        if str(line).strip() and str(line).strip() != "\uf10d"
    ]


def first_int(text, default=0):
    match = re.search(r"(\d+)", text or "")
    return int(match.group(1)) if match else default


def parse_range(text):
    match = re.search(r"(\d+)\s*[~\-]\s*(\d+)", text or "")
    if not match:
        return None
    return int(match.group(1)), int(match.group(2))


def parse_base_stats(lines):
    stats = {}
    for line in lines:
        if "\u9700\u6c42\u7b49\u7ea7" in line:
            stats["requiredLevel"] = first_int(line)
            stats["dropLevel"] = stats["requiredLevel"]
        if "\u9700\u6c42\u529b\u91cf" in line:
            stats["requiredStrength"] = first_int(line)
        if "\u9700\u6c42\u654f\u6377" in line:
            stats["requiredAgility"] = first_int(line)
        if "\u9700\u6c42\u667a\u529b" in line:
            stats["requiredEnergy"] = first_int(line)
        if "\u8010\u4e45" in line:
            stats["durability"] = first_int(line)
        if "\u9632\u5fa1\u529b" in line or "\u5c5e\u6027\u9632\u5fa1\u529b" in line:
            stats["defense"] = first_int(line)
            stats["defenseMin"] = stats["defense"]
            stats["defenseMax"] = stats["defense"]
        if "\u653b\u51fb\u529b" in line or "\u9b54\u6cd5\u653b\u51fb\u529b" in line or "\u8bc5\u5492\u529b" in line:
            value_range = parse_range(line)
            if value_range:
                stats["attackMin"], stats["attackMax"] = value_range
                stats["statMin"], stats["statMax"] = value_range
    return stats


def parse_effects(lines):
    effects = []
    for line in lines:
        number = first_int(line, None)
        if number is None:
            continue
        if "\u6700\u5927\u751f\u547d" in line:
            effects.append({"effect": "lifeFlat", "value": number, "label": line})
        elif "\u6700\u5927\u9b54\u6cd5" in line:
            effects.append({"effect": "manaFlat", "value": number, "label": line})
        elif "\u653b\u51fb\u901f\u5ea6" in line:
            effects.append({"effect": "attackSpeed", "value": number, "label": line})
        elif "\u63d0\u9ad8\u6240\u6709\u5c5e\u6027" in line:
            effects.append({"effect": "allStatsFlat", "value": number, "label": line})
        elif "\u6280\u80fd\u653b\u51fb\u529b" in line:
            effects.append({"effect": "skillDamageFlat", "value": number, "label": line})
    return effects


def quality_for(row):
    if str(row.get("name", "")).startswith("\u5353\u8d8a\u7684"):
        return "excellent"
    if clean_lines(load_json_value(row.get("excellent_attributes"), [])):
        return "excellent"
    return "normal"


def safe_icon_name(item_id):
    return f"{item_id}.png"


def item_id_for(slot, row):
    seed = "|".join([
        slot,
        row.get("mu_id", ""),
        row.get("number", ""),
        row.get("name", ""),
        row.get("detail_url", ""),
    ])
    digest = hashlib.sha1(seed.encode("utf-8")).hexdigest()[:10]
    return f"accessory_{slot}_{row.get('mu_id') or 'unknown'}_{digest}"


def normalize_row(row, source):
    base_lines = clean_lines(load_json_value(row.get("base_attributes"), []))
    lucky_lines = clean_lines(load_json_value(row.get("lucky_attributes"), []))
    excellent_lines = clean_lines(load_json_value(row.get("excellent_attributes"), []))
    class_limit = clean_lines(load_json_value(row.get("class_limit"), ["\u5168\u804c\u4e1a"]))
    monster_drops = clean_lines(load_json_value(row.get("monster_drops"), []))
    item_id = item_id_for(source["slot"], row)
    icon_path = copy_icon(row, source, item_id)
    stats = parse_base_stats(base_lines)
    official_lines = base_lines + lucky_lines + excellent_lines[:12]
    item = {
        "id": item_id,
        "source": f"\u5251\u58eb\u88c5\u5907\u5e93/{source['dir']}",
        "sourceMuId": row.get("mu_id", ""),
        "sourceNumber": row.get("number", ""),
        "name": row.get("name", "").strip(),
        "international": row.get("international", "").strip(),
        "korean": row.get("korean", "").strip(),
        "category": source["category"],
        "classes": class_limit or ["\u5168\u804c\u4e1a"],
        "requiredLevel": stats.pop("requiredLevel", 1),
        "dropLevel": stats.pop("dropLevel", 1),
        "requiredStrength": stats.pop("requiredStrength", 0),
        "requiredAgility": stats.pop("requiredAgility", 0),
        "requiredEnergy": stats.pop("requiredEnergy", 0),
        "requiredCommand": 0,
        "durability": stats.pop("durability", 0),
        "speed": 0,
        "dropMaps": [],
        "dropMonsters": monster_drops,
        "officialEffect": "?".join(official_lines) if official_lines else "\u65e0",
        "kind": "accessory",
        "slot": source["slot"],
        "quality": quality_for(row),
        "icon": icon_path,
        "detailUrl": row.get("detail_url", ""),
        "baseAttributes": base_lines,
        "excellentAttributes": excellent_lines,
        "luckyAttributes": lucky_lines,
        "effects": parse_effects(excellent_lines),
    }
    item.update(stats)
    if source["slot"] == "earring":
        side_text = f"{row.get('name', '')} {row.get('international', '')} {row.get('korean', '')}"
        if "\u5de6" in side_text or "\uc88c" in side_text:
            item["earringSide"] = "left"
        elif "\u53f3" in side_text or "\uc6b0" in side_text:
            item["earringSide"] = "right"
    return item


def copy_icon(row, source, item_id):
    icon_file = row.get("icon_file") or ""
    if not icon_file:
        return ""
    icon_name = Path(icon_file.replace("\\", "/")).name
    src = SOURCE_ROOT / source["dir"] / "icons_64x64" / icon_name
    if not src.exists():
        return ""
    target_dir = TARGET_ICON_ROOT / source["icon_dir"]
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / safe_icon_name(item_id)
    shutil.copy2(src, target)
    return target.relative_to(ROOT).as_posix()


def read_source(source):
    csv_path = SOURCE_ROOT / source["dir"] / "\u88c5\u5907\u6570\u636e.csv"
    with csv_path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [normalize_row(row, source) for row in csv.DictReader(handle)]


def main():
    items = []
    for source in SOURCES:
        items.extend(read_source(source))
    items.sort(key=lambda item: (item["slot"], item.get("requiredLevel", 0), item["name"]))
    TARGET_JSON.parent.mkdir(parents=True, exist_ok=True)
    TARGET_JSON.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(items)} accessories to {TARGET_JSON}")


if __name__ == "__main__":
    main()
