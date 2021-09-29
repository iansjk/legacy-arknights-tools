/* eslint-disable no-console */
import path from "path";
import { promises as fs } from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import slugify from "../src/utils";
import { getOperatorName } from "./globals";

dotenv.config({
  path: path.join(__dirname, "../.env.development"),
});

const {
  GATSBY_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;
cloudinary.config({
  cloud_name: GATSBY_CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const ACESHIP_BASEDIR = path.join(__dirname, "aceship");

// exclude "sktok_..." skill icons, as these are for NPCs/summons/traps
const skillIconFilenameRegex = /skill_icon_(?<skillId>sk((chr)|(com))[^.]+)\.png/;
function skillIconPublicId(filename: string): string | null {
  const match = filename.match(skillIconFilenameRegex);
  if (!match?.groups?.skillId) {
    return null;
  }
  return `arknights/skills/${match.groups.skillId}`;
}

const operatorAvatarFilenameRegex = /(?<internalName>char_\d+_[a-z0-9]+)(?:_(?<eliteLevel>[12])\+?)?\.png/;
function operatorImagePublicId(filename: string): string | null {
  const match = filename.match(operatorAvatarFilenameRegex);
  if (
    !match?.groups?.internalName ||
    !getOperatorName(match.groups.internalName)
  ) {
    return null;
  }
  const { eliteLevel } = match.groups;
  const operatorName = getOperatorName(match.groups.internalName);
  const operatorSlug = slugify(
    eliteLevel ? `${operatorName} elite ${eliteLevel}` : `${operatorName}`
  );
  return `arknights/operators/${operatorSlug}`;
}

const summonAvatarFilenameRegex = /^(?<summonId>token_\d+_[^.]+)\.png$/;
function summonImagePublicId(filename: string): string | null {
  const match = filename.match(summonAvatarFilenameRegex);
  if (!match?.groups?.summonId) {
    return null;
  }
  return `arknights/summons/${match.groups.summonId}`;
}

const itemImageFilenameRegex = /(?<itemSlug>.*)\.png/;
function itemImagePublicId(filename: string): string | null {
  const match = filename.match(itemImageFilenameRegex);
  if (!match?.groups?.itemSlug) {
    return null;
  }
  return `arknights/items/${match.groups.itemSlug}`;
}

interface CloudinaryResponse {
  next_cursor: string;
  resources: CloudinaryResource[];
}

interface CloudinaryResource {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  backup: boolean;
  access_mode: string;
  url: string;
  secure_url: string;
}

(async () => {
  let publicIds: string[] = [];
  let nextCursor: string | null = null;
  const baseParams = {
    type: "upload",
    resource_type: "image",
    prefix: "arknights",
    max_results: 500,
  };
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const response: CloudinaryResponse = await cloudinary.api.resources(
      nextCursor ? { ...baseParams, next_cursor: nextCursor } : baseParams
    );
    nextCursor = response.next_cursor;
    publicIds = [...publicIds, ...response.resources.map((r) => r.public_id)];
    if (!nextCursor) {
      break;
    }
  }
  const existingPublicIds = new Set(publicIds);
  console.info(
    `Found ${existingPublicIds.size} existing images in Cloudinary.`
  );

  const operatorImageTask = {
    sourceDir: path.join(ACESHIP_BASEDIR, "img", "avatars"),
    publicIdFn: operatorImagePublicId,
  };
  const summonImageTask = {
    sourceDir: path.join(ACESHIP_BASEDIR, "img", "avatars"),
    publicIdFn: summonImagePublicId,
  };
  const skillIconTask = {
    sourceDir: path.join(ACESHIP_BASEDIR, "img", "skills"),
    publicIdFn: skillIconPublicId,
  };
  const itemTask = {
    sourceDir: path.join(__dirname, "items"),
    publicIdFn: itemImagePublicId,
  };

  let newlyUploadedCount = 0;
  const tasks = [
    operatorImageTask,
    summonImageTask,
    skillIconTask,
    itemTask,
  ].map(async (task) => {
    const files = await fs.readdir(task.sourceDir);
    return Promise.all(
      files.map(async (filename) => {
        const publicId = task.publicIdFn(filename);
        if (publicId && !existingPublicIds.has(publicId)) {
          console.info(
            `Image "${publicId}" not found in Cloudinary, uploading...`
          );
          await cloudinary.uploader.upload(
            path.join(task.sourceDir, filename),
            { public_id: publicId }
          );
          newlyUploadedCount += 1;
        }
      })
    );
  });
  await Promise.all(tasks);
  console.info(`Uploaded ${newlyUploadedCount} new files, done.`);
})();
