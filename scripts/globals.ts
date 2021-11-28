import path from "path";

import { items as enItemTable } from "./ArknightsGameData/en_US/gamedata/excel/item_table.json";
import { items as cnItemTable } from "./ArknightsGameData/zh_CN/gamedata/excel/item_table.json";
import cnCharacterTable from "./ArknightsGameData/zh_CN/gamedata/excel/character_table.json";

export const ARKNIGHTS_DATA_DIR = path.join(__dirname, "../src/data");
export interface Ingredient {
  id: string;
  name: string;
  tier: number;
  quantity: number;
  sortId: number;
}

export interface InternalItemRequirement {
  id: string;
  count: number;
}

const operatorNameOverride: Record<string, string> = {
  ShiraYuki: "Shirayuki",
  Гум: "Gummy",
  Зима: "Zima",
  Истина: "Istina",
  Роса: "Rosa",
};

const itemNameOverride: Record<string, string> = {
  "30145": "Crystalline Electroassembly",
};

export function getOperatorName(operatorId: string): string | null {
  if (operatorId === "char_1001_amiya2") {
    return "Amiya (Guard)";
  }
  const entry = cnCharacterTable[operatorId as keyof typeof cnCharacterTable];
  if (entry === undefined || entry.isNotObtainable) {
    return null;
  }
  const { appellation } = entry;
  return Object.prototype.hasOwnProperty.call(operatorNameOverride, appellation)
    ? operatorNameOverride[appellation]
    : appellation;
}

export function getItemName(itemId: string): string {
  const entry = enItemTable[itemId as keyof typeof enItemTable];
  const cnName = cnItemTable[itemId as keyof typeof cnItemTable].name;
  let name = itemNameOverride[itemId] ?? entry?.name;
  if (name == null) {
    if (cnName != null) {
      console.warn(`No item name translation found for ID '${itemId}'`);
      name = cnName;
    } else {
      throw new Error(`Couldn't find item name for ID '${itemId}'`);
    }
  }
  return name;
}

export function getEliteLMDCost(
  rarity: number,
  eliteLevel: number
): Ingredient {
  let quantity = -1;
  if (rarity === 3) {
    quantity = 10000;
  } else if (rarity === 4) {
    quantity = eliteLevel === 2 ? 60000 : 15000;
  } else if (rarity === 5) {
    quantity = eliteLevel === 2 ? 120000 : 20000;
  } else if (rarity === 6) {
    quantity = eliteLevel === 2 ? 180000 : 30000;
  }
  return {
    id: "4001",
    name: "LMD",
    tier: 4,
    quantity,
    sortId: 10004,
  };
}

const ITEM_TIERS = Object.fromEntries(
  Object.keys(cnItemTable).map((id) => [
    id,
    cnItemTable[id as keyof typeof cnItemTable].rarity + 1,
  ])
);

function getItemTier(id: string): number {
  return ITEM_TIERS[id];
}

export function toIngredient({
  id,
  count,
}: {
  id: string;
  count: number;
}): Ingredient {
  return {
    id,
    name: getItemName(id),
    tier: getItemTier(id),
    quantity: count,
    sortId: cnItemTable[id as keyof typeof cnItemTable].sortId,
  };
}

export function toTitleCase(string: string): string {
  return [...string.toLowerCase()]
    .map((char, i) => (i === 0 ? char.toUpperCase() : char))
    .join("");
}

export function professionToClass(profession: string): string {
  switch (profession) {
    case "PIONEER":
      return "Vanguard";
    case "WARRIOR":
      return "Guard";
    case "SPECIAL":
      return "Specialist";
    case "TANK":
      return "Defender";
    case "SUPPORT":
      return "Supporter";
    default:
      return toTitleCase(profession);
  }
}
