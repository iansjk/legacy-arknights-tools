import fs from "fs";
import path from "path";

import axios from "axios";
import puppeteer from "puppeteer";
import { items as cnItemTable } from "./ArknightsGameData/zh_CN/gamedata/excel/item_table.json";
import cnBuildingData from "./ArknightsGameData/zh_CN/gamedata/excel/building_data.json";
import { stages as enStageTable } from "./ArknightsGameData/en_US/gamedata/excel/stage_table.json";
import { stages as cnStageTable } from "./ArknightsGameData/zh_CN/gamedata/excel/stage_table.json";
import {
  ARKNIGHTS_DATA_DIR,
  getItemName,
  InternalItemRequirement,
  toIngredient,
} from "./globals";

const {
  workshopFormulas,
  manufactFormulas: manufactureFormulas,
} = cnBuildingData;

interface FormulaEntry {
  goldCost?: number;
  count: number;
  costs: InternalItemRequirement[];
}

// maximum item sanity cost multiplier when considering a stage as being "efficient"
// e.g. if Sugar Substitute costs 4x+ sanity per item farming it from the "most efficient" stage
// compared to the sanity per item from the "least sanity" stage, then don't display a most efficient stage
// (since it'd take way too long to get the item from the prospective most efficient stage)
const EFFICIENT_STAGE_MAX_ITEM_SANITY_COST_MULTIPLIER = 4;

const WHITELISTED_ITEMS = new Set([
  "LMD",
  "Drill Battle Record",
  "Frontline Battle Record",
  "Tactical Battle Record",
  "Strategic Battle Record",
  "Orirock",
  "Orirock Cube",
  "Orirock Cluster",
  "Orirock Concentration",
  "Sugar Substitute",
  "Sugar",
  "Sugar Pack",
  "Sugar Lump",
  "Ester",
  "Polyester",
  "Polyester Pack",
  "Polyester Lump",
  "Oriron Shard",
  "Oriron",
  "Oriron Cluster",
  "Oriron Block",
  "Diketon",
  "Polyketon",
  "Aketon",
  "Keton Colloid",
  "Damaged Device",
  "Device",
  "Integrated Device",
  "Optimized Device",
  "Grindstone",
  "Manganese Ore",
  "Loxic Kohl",
  "RMA70-12",
  "Coagulating Gel",
  "Incandescent Alloy",
  "Crystalline Component",
  "White Horse Kohl",
  "Manganese Trihydrate",
  "Grindstone Pentahydrate",
  "RMA70-24",
  "Polymerized Gel",
  "Incandescent Alloy Block",
  "Crystalline Circuit",
  "Polymerization Preparation",
  "Bipolar Nanoflake",
  "D32 Steel",
  "Crystalline Electroassembly",
  "Skill Summary - 1",
  "Skill Summary - 2",
  "Skill Summary - 3",
  "Chip Catalyst",
  "Caster Chip",
  "Caster Chip Pack",
  "Caster Dualchip",
  "Vanguard Chip",
  "Vanguard Chip Pack",
  "Vanguard Dualchip",
  "Defender Chip",
  "Defender Chip Pack",
  "Defender Dualchip",
  "Sniper Chip",
  "Sniper Chip Pack",
  "Sniper Dualchip",
  "Guard Chip",
  "Guard Chip Pack",
  "Guard Dualchip",
  "Supporter Chip",
  "Supporter Chip Pack",
  "Supporter Dualchip",
  "Medic Chip",
  "Medic Chip Pack",
  "Medic Dualchip",
  "Specialist Chip",
  "Specialist Chip Pack",
  "Specialist Dualchip",
]);

const PENGUIN_STATS_MATRIX_URL =
  "https://penguin-stats.io/PenguinStats/api/v2/result/matrix";

const items = Object.keys(cnItemTable)
  .filter((id) => WHITELISTED_ITEMS.has(getItemName(id)))
  .map((id) => {
    const entry = cnItemTable[id as keyof typeof cnItemTable];
    const name = getItemName(id);
    const tier = entry.rarity + 1;
    const { sortId } = entry;
    const baseObj = {
      id,
      name,
      tier,
      sortId,
    };
    const workshopFormulaId = entry.buildingProductList.find(
      ({ roomType }) => roomType === "WORKSHOP"
    )?.formulaId;
    const manufactureFormulaId = entry.buildingProductList.find(
      ({ roomType }) => roomType === "MANUFACTURE"
    )?.formulaId;

    if (workshopFormulaId || manufactureFormulaId) {
      const formula: FormulaEntry = workshopFormulaId
        ? workshopFormulas[workshopFormulaId as keyof typeof workshopFormulas]
        : manufactureFormulas[
            manufactureFormulaId as keyof typeof manufactureFormulas
          ];
      const ingredients = formula.costs.map(toIngredient);
      if (typeof formula.goldCost !== "undefined" && formula.goldCost > 0) {
        ingredients.unshift({
          id: "4001",
          name: "LMD",
          tier: 4,
          quantity: formula.goldCost,
          sortId: 10004,
        });
      }
      return Object.assign(baseObj, { ingredients, yield: formula.count });
    }
    return baseObj;
  });

const crystalItems = {
  "Crystal Component": "Crystalline Component",
  "Crystal Circuit": "Crystalline Circuit",
  "Crystal Electronic Unit": "Crystalline Electroassembly",
};

Object.entries(crystalItems).forEach(([oldName, newName]) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const newEntry = items.find((item) => item.name === newName)!;
  items.push({
    ...newEntry,
    name: oldName,
    id: oldName,
  });
});

const LUZARK_LP_SOLVER_URL =
  "https://colab.research.google.com/drive/1lHwJDG7WCAr3KMlxY-HLyD8-yG3boazq";
const SANITY_VALUE_CELL_ID = "feRucRPwWGZo";
const STAGE_INFO_CELL_ID = "znmVNbnNWIre";
const stageRegex = /^Activity (?<stageName>[A-Z0-9-]+) \([^)]+\).*Efficiency 100\.000%/;
const itemRegex = /^(?<itemName>[^:]+): (?<sanityValue>[0-9.]+) sanity value/;

async function fetchLuzarkLPSolverOutput(): Promise<{
  efficientStageNames: string[];
  itemSanityValues: Record<string, number>;
}> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(LUZARK_LP_SOLVER_URL);
  await Promise.all([
    page.waitForSelector(`#cell-${SANITY_VALUE_CELL_ID}`),
    page.waitForSelector(`#cell-${STAGE_INFO_CELL_ID}`),
  ]);

  const stagesOutputElement = await page.$(
    `#cell-${STAGE_INFO_CELL_ID} .output pre`
  );
  const stagesOutputText: string = await page.evaluate(
    (el) => el.innerText,
    stagesOutputElement
  );
  const efficientStageNames = stagesOutputText
    .split("\n")
    .map((line) => {
      const result = line.match(stageRegex);
      if (result && result.groups?.stageName) {
        return result.groups.stageName;
      }
      return null;
    })
    .filter((item) => item != null) as string[];

  const sanityValuesOutputElement = await page.$(
    `#cell-${SANITY_VALUE_CELL_ID} .output pre`
  );
  const sanityValuesOutputText: string = await page.evaluate(
    (el) => el.innerText,
    sanityValuesOutputElement
  );
  const itemSanityValues = Object.fromEntries(
    sanityValuesOutputText
      .split("\n")
      .map((line) => {
        const result = line.match(itemRegex);
        if (result && result.groups?.itemName && result.groups?.sanityValue) {
          return [
            result.groups.itemName,
            parseFloat(result.groups.sanityValue),
          ];
        }
        return [];
      })
      .filter((pair) => pair.length > 0)
  );
  await browser.close();
  return { efficientStageNames, itemSanityValues };
}

interface PenguinStatsMatrixCell {
  stageId: string;
  itemId: string;
  quantity: number;
  times: number;
  start: number;
  end: number;
}

interface PenguinStatsResponse {
  matrix: PenguinStatsMatrixCell[];
}

interface StageItem {
  sanityCost: number;
  dropRate: number;
  stageId: string;
}

async function getStagesForItems({
  efficientStagesOnly = false,
  efficientStageNames = [],
}: Partial<{
  efficientStagesOnly: boolean;
  efficientStageNames: string[];
}>): Promise<Record<string, StageItem>> {
  const itemStageMap: Record<string, StageItem> = {};
  let params = { itemFilter: items.map((item) => item.id).join(",") };
  if (efficientStagesOnly && efficientStageNames) {
    params = Object.assign(params, {
      stageFilter: efficientStageNames.join(","),
    });
  }
  const response = await axios.get<PenguinStatsResponse>(
    PENGUIN_STATS_MATRIX_URL,
    { params }
  );
  const { matrix } = response.data;
  matrix
    .filter((cell) =>
      Object.prototype.hasOwnProperty.call(enStageTable, cell.stageId)
    )
    .forEach((cell) => {
      const dropRate = cell.quantity / cell.times;
      const stageData = cnStageTable[cell.stageId as keyof typeof cnStageTable];
      const sanityCost = stageData.apCost / dropRate;
      if (
        !Object.prototype.hasOwnProperty.call(itemStageMap, cell.itemId) ||
        itemStageMap[cell.itemId].sanityCost > sanityCost
      ) {
        itemStageMap[cell.itemId] = {
          sanityCost,
          dropRate,
          stageId: cell.stageId,
        };
      }
    });
  return itemStageMap;
}

interface FarmingStage {
  itemSanityCost: number;
  stageSanityCost: number;
  dropRate: number;
  stageName: string;
}

function buildFarmingStage(itemId: string, stageItem: StageItem): FarmingStage {
  const stageData =
    cnStageTable[stageItem.stageId as keyof typeof cnStageTable];
  const itemName = getItemName(itemId);
  const dropRate =
    itemName.endsWith("Chip") || itemName.endsWith("Chip Pack")
      ? 0.5
      : Math.round((stageItem.dropRate + Number.EPSILON) * 100) / 100;

  return {
    stageSanityCost: stageData.apCost,
    stageName: stageData.code,
    itemSanityCost:
      Math.round((stageItem.sanityCost + Number.EPSILON) * 100) / 100,
    dropRate,
  };
}

(async () => {
  const {
    efficientStageNames,
    itemSanityValues,
  } = await fetchLuzarkLPSolverOutput();

  const [itemEfficientStages, itemFastestStages] = await Promise.all([
    getStagesForItems({
      efficientStagesOnly: true,
      efficientStageNames,
    }),
    getStagesForItems({ efficientStagesOnly: false }),
  ]);

  const itemsWithStages = items.map((baseItem) => {
    const stages: Record<string, FarmingStage> = {};
    if (Object.prototype.hasOwnProperty.call(itemFastestStages, baseItem.id)) {
      stages.leastSanity = buildFarmingStage(
        baseItem.id,
        itemFastestStages[baseItem.id]
      );
    }
    if (
      Object.prototype.hasOwnProperty.call(itemEfficientStages, baseItem.id)
    ) {
      const mostEfficientStage = buildFarmingStage(
        baseItem.id,
        itemEfficientStages[baseItem.id]
      );
      if (stages.leastSanity) {
        if (
          mostEfficientStage.itemSanityCost <=
          stages.leastSanity.itemSanityCost *
            EFFICIENT_STAGE_MAX_ITEM_SANITY_COST_MULTIPLIER
        ) {
          stages.mostEfficient = mostEfficientStage;
          // if the least sanity stage and the most efficient stage are the same,
          // display the stage only once as "most efficient"
          if (stages.leastSanity.stageName === stages.mostEfficient.stageName) {
            delete stages.leastSanity;
          }
        }
      }
    }
    return {
      ...baseItem,
      stages: Object.keys(stages).length > 0 ? stages : undefined,
      sanityValue: itemSanityValues[baseItem.name],
    };
  });

  fs.writeFileSync(
    path.join(ARKNIGHTS_DATA_DIR, "items.json"),
    JSON.stringify(itemsWithStages, null, 2)
  );
})();
