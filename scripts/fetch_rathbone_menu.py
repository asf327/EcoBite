#!/usr/bin/env python3
"""Fetch and flatten Rathbone's live Sodexo menu for a given date."""

from __future__ import annotations

import argparse
import csv
import json
import ssl
import sys
from datetime import date
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


API_URL = "https://api-prd.sodexomyway.net/v0.2/data/menu/{location_id}/{menu_id}?date={menu_date}"
API_KEY = "68717828-b754-420d-9488-4c37cb7d7ef7"
LOCATION_ID = "97451005"
MENU_ID = "151204"
DEFAULT_DATE = "2026-04-23"

CSV_COLUMNS = [
    "menu_date",
    "meal_period",
    "station",
    "course",
    "meal_name",
    "description",
    "calories",
    "calories_from_fat",
    "fat_g",
    "sat_fat_g",
    "sodium_mg",
    "carbohydrates_g",
    "fiber_g",
    "sugar_g",
    "added_sugar_g",
    "protein_g",
    "cholesterol_mg",
    "potassium_mg",
    "iron_mg",
    "calcium_mg",
    "vitamin_a_mcg",
    "vitamin_c_mcg",
    "vitamin_d_mg",
    "portion",
    "portion_size",
    "diet_tags",
    "allergen_tags",
    "is_plant_based",
    "is_vegetarian",
    "is_vegan",
    "is_mindful",
    "source_location_id",
    "source_menu_id",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=DEFAULT_DATE, help="Menu date in YYYY-MM-DD")
    parser.add_argument(
        "--output-dir",
        default="data",
        help="Directory where JSON and CSV files will be written",
    )
    return parser.parse_args()


def parse_number(value: str | None) -> str:
    if value is None:
        return ""
    cleaned = (
        value.replace("mg", "")
        .replace("mcg", "")
        .replace("g", "")
        .strip()
    )
    return cleaned


def tags_for_item(item: dict) -> str:
    tags = []
    if item.get("isPlantBased"):
        tags.append("plantbased")
    if item.get("isVegan"):
        tags.append("vegan")
    if item.get("isVegetarian"):
        tags.append("vegetarian")
    if item.get("isMindful"):
        tags.append("mindful")
    return ";".join(tags)


def allergens_for_item(item: dict) -> str:
    allergens = []
    for allergen in item.get("allergens", []):
        if str(allergen.get("contains", "")).lower() == "true":
            allergens.append(str(allergen.get("name", "")).strip().lower())
    return ";".join(sorted(set(filter(None, allergens))))


def flatten_menu(menu_date: str, payload: list[dict]) -> list[dict]:
    rows: list[dict] = []
    for meal_period in payload:
        meal_name = meal_period.get("name", "")
        for group in meal_period.get("groups", []):
            station = group.get("name", "")
            for item in group.get("items", []):
                row = {
                    "menu_date": menu_date,
                    "meal_period": meal_name,
                    "station": station,
                    "course": item.get("course", ""),
                    "meal_name": item.get("formalName", ""),
                    "description": item.get("description", ""),
                    "calories": parse_number(item.get("calories")),
                    "calories_from_fat": parse_number(item.get("caloriesFromFat")),
                    "fat_g": parse_number(item.get("fat")),
                    "sat_fat_g": parse_number(item.get("saturatedFat")),
                    "sodium_mg": parse_number(item.get("sodium")),
                    "carbohydrates_g": parse_number(item.get("carbohydrates")),
                    "fiber_g": parse_number(item.get("dietaryFiber")),
                    "sugar_g": parse_number(item.get("sugar")),
                    "added_sugar_g": parse_number(item.get("addedSugar")),
                    "protein_g": parse_number(item.get("protein")),
                    "cholesterol_mg": parse_number(item.get("cholesterol")),
                    "potassium_mg": parse_number(item.get("potassium")),
                    "iron_mg": parse_number(item.get("iron")),
                    "calcium_mg": parse_number(item.get("calcium")),
                    "vitamin_a_mcg": parse_number(item.get("vitaminA")),
                    "vitamin_c_mcg": parse_number(item.get("vitaminC")),
                    "vitamin_d_mg": parse_number(item.get("vitaminD")),
                    "portion": item.get("portion", ""),
                    "portion_size": item.get("portionSize", ""),
                    "diet_tags": tags_for_item(item),
                    "allergen_tags": allergens_for_item(item),
                    "is_plant_based": str(bool(item.get("isPlantBased"))).lower(),
                    "is_vegetarian": str(bool(item.get("isVegetarian"))).lower(),
                    "is_vegan": str(bool(item.get("isVegan"))).lower(),
                    "is_mindful": str(bool(item.get("isMindful"))).lower(),
                    "source_location_id": LOCATION_ID,
                    "source_menu_id": MENU_ID,
                }
                rows.append(row)
    return rows


def fetch_payload(menu_date: str) -> list[dict]:
    request = Request(
        API_URL.format(location_id=LOCATION_ID, menu_id=MENU_ID, menu_date=menu_date),
        headers={"API-Key": API_KEY, "Content-Type": "application/json"},
        method="GET",
    )
    try:
        with urlopen(request) as response:
            return json.loads(response.read().decode("utf-8"))
    except URLError as exc:
        reason = str(exc.reason)
        if "CERTIFICATE_VERIFY_FAILED" in reason:
            with urlopen(request, context=ssl._create_unverified_context()) as response:
                return json.loads(response.read().decode("utf-8"))
        raise SystemExit(f"Network error while fetching menu: {exc.reason}") from exc
    except HTTPError as exc:
        raise SystemExit(f"HTTP error while fetching menu: {exc.code}") from exc


def write_outputs(menu_date: str, payload: list[dict], rows: list[dict], output_dir: Path) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    raw_dir = output_dir / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    json_path = raw_dir / f"rathbone_menu_{menu_date}.json"
    csv_path = output_dir / f"rathbone_menu_{menu_date}.csv"

    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    return json_path, csv_path


def main() -> int:
    args = parse_args()
    try:
        date.fromisoformat(args.date)
    except ValueError:
        raise SystemExit("Date must be in YYYY-MM-DD format.")

    payload = fetch_payload(args.date)
    rows = flatten_menu(args.date, payload)
    json_path, csv_path = write_outputs(args.date, payload, rows, Path(args.output_dir))

    print(f"Wrote {len(rows)} rows to {csv_path}")
    print(f"Wrote raw JSON to {json_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
