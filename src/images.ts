import { slugify } from "./utils";

const BASE_OPTIONS = "f_auto,q_auto";
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/samidare/image/upload/${BASE_OPTIONS}/v1/arknights`;

export const operatorImageSrc = (name: string, elite?: number): string =>
  `${CLOUDINARY_BASE_URL}/operators/${slugify(name)}${
    typeof elite !== "undefined" &&
    (elite > 1 || (name === "Amiya" && elite === 1))
      ? `-${slugify(`elite ${elite}`)}`
      : ""
  }`;

export const itemImageSrc = (itemName: string): string =>
  `${CLOUDINARY_BASE_URL}/items/${slugify(itemName)}`;

export const itemBgSrc = (tier: number): string =>
  `${CLOUDINARY_BASE_URL}/item-bgs/tier${tier}`;

export const skillImageSrc = (iconId: string | null, skillId: string): string =>
  `${CLOUDINARY_BASE_URL}/skills/${iconId ?? skillId}`;

export const eliteImageSrc = (eliteLevel: 0 | 1 | 2): string =>
  `${CLOUDINARY_BASE_URL}/elite/${eliteLevel}`;

export const masteryImageSrc = (masteryLevel: 0 | 1 | 2 | 3): string =>
  `${CLOUDINARY_BASE_URL}/mastery/${masteryLevel}`;
