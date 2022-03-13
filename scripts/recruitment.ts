import fs from "fs";
import path from "path";
import { Combination } from "js-combinatorics";
import { ARKNIGHTS_DATA_DIR, professionToClass, toTitleCase } from "./globals";
import { recruitDetail } from "./ArknightsGameData/en_US/gamedata/excel/gacha_table.json";
import characterTable from "./ArknightsGameData/en_US/gamedata/excel/character_table.json";

const nameOverrides: Record<string, string> = {
  "THRM-EX": "Thermal-EX",
};

const RECRUITMENT_TAGS = [
  "Top Operator",
  "Senior Operator",
  "Starter",
  "Robot",
  "Melee",
  "Ranged",
  "Caster",
  "Defender",
  "Guard",
  "Medic",
  "Sniper",
  "Specialist",
  "Supporter",
  "Vanguard",
  "AoE",
  "Crowd-Control",
  "DP-Recovery",
  "DPS",
  "Debuff",
  "Defense",
  "Fast-Redeploy",
  "Healing",
  "Nuker",
  "Shift",
  "Slow",
  "Summon",
  "Support",
  "Survival",
];

const operatorNameToId: Record<
  string,
  keyof typeof characterTable
> = Object.fromEntries(
  Object.entries(characterTable).map(([id, opData]) => [
    opData.name,
    id as keyof typeof characterTable,
  ])
);

const recruitMessageHeader =
  "<@rc.title>Recruitment Rules</>\n\n<@rc.em>Only when you choose this tag can you have a chance to obtain a ★★★★★★ Operator</>\n<@rc.em>Top Operator</>\n\n<@rc.subtitle>※All Possible Operators※</>\n<@rc.eml>Operators displayed in green cannot be obtained through Headhunting. You can get them through Recruitment</>\n\n";
const recruitmentStrings = recruitDetail
  .replace(recruitMessageHeader, "")
  .split(/★+/);
const recruitableOperators = recruitmentStrings.map((line) =>
  line
    .replace(/\n|-{2,}/g, "")
    .split(/(?:\s\/\s)|(?:<@rc\.eml>([^/]+)<\/>)/)
    .filter((item) => !!item && item.trim())
);

const recruitment = recruitableOperators.flatMap((opNames, rarity) =>
  opNames
    .filter((name) => !!name)
    .map((opName) => {
      const opData = characterTable[operatorNameToId[opName]];
      const tags = [
        ...(opData.tagList ?? []),
        toTitleCase(opData.position),
        professionToClass(opData.profession),
      ];
      if (rarity === 1) {
        tags.push("Robot");
      } else if (rarity === 6) {
        tags.push("Top Operator");
      }
      if (rarity >= 5) {
        tags.push("Senior Operator");
      }
      return {
        name: nameOverrides[opName] ?? opName,
        rarity,
        tags,
      };
    })
);

const tagSets = Array(3)
  .fill(0)
  .flatMap((_, i) => [...new Combination<string>(RECRUITMENT_TAGS, i + 1)]);
const recruitmentResults = tagSets
  .map((tagSet) => ({
    tags: tagSet.sort(),
    operators: recruitment
      .filter((recruitable) =>
        tagSet.every(
          (tag) =>
            recruitable.tags.includes(tag) &&
            (recruitable.rarity < 6 || tagSet.includes("Top Operator"))
        )
      )
      .sort((op1, op2) => op2.rarity - op1.rarity),
  }))
  .filter((recruitData) => recruitData.operators.length > 0)
  .map((result) => {
    // for guaranteed tags, we only care about 1*, 4*, 5*, and 6*.
    // we include 1* if
    // - the otherwise highest rarity is 5 (1* and 5* can't coexist), or
    // - the Robot tag is available
    const lowestRarity = Math.min(
      ...result.operators.map((op) => op.rarity).filter((rarity) => rarity > 1)
    );
    if (lowestRarity > 1 && lowestRarity < 4) {
      return {
        ...result,
        guarantees: [],
      };
    }

    const guarantees = Number.isFinite(lowestRarity) ? [lowestRarity] : [];
    if (
      (result.operators.find((op) => op.rarity === 1) && lowestRarity >= 5) ||
      result.tags.includes("Robot")
    ) {
      guarantees.push(1);
    }
    return {
      ...result,
      guarantees,
    };
  });

const recruitmentJson = Object.fromEntries(
  recruitmentResults.map((recruit) => [recruit.tags, recruit])
);
fs.writeFileSync(
  path.join(ARKNIGHTS_DATA_DIR, "recruitment.json"),
  JSON.stringify(recruitmentJson, null, 2)
);
