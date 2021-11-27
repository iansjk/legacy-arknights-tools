/* eslint-disable no-console */
import path from "path";
import { promises as fs } from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import slugify from "@sindresorhus/slugify";
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

const skillIconFilenameRegex = /skill_icon_(?<skillId>[^.]+)\.png/;
function skillIconPublicId(filename: string): string | null {
  const match = filename.match(skillIconFilenameRegex);
  if (!match?.groups?.skillId) {
    return null;
  }
  return `arknights/skills/${match.groups.skillId}`;
}

const avatarFilenameRegex = /(?<internalName>char_\d+_[a-z0-9]+)(?:_(?<eliteLevel>[12])\+?)?\.png/;
function operatorImagePublicId(filename: string): string | null {
  const match = filename.match(avatarFilenameRegex);
  if (
    !match?.groups?.internalName ||
    !getOperatorName(match.groups.internalName)
  ) {
    return null;
  }
  const { eliteLevel } = match.groups;
  const operatorName = getOperatorName(match.groups.internalName);
  const itemId = slugify(
    eliteLevel ? `${operatorName} elite ${eliteLevel}` : `${operatorName}`
  );
  return `arknights/operators/${itemId}`;
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
  const skillIconTask = {
    sourceDir: path.join(ACESHIP_BASEDIR, "img", "skills"),
    publicIdFn: skillIconPublicId,
  };
  const itemTask = {
    sourceDir: path.join(__dirname, "items"),
    publicIdFn: itemImagePublicId,
  };

  let newlyUploadedCount = 0;
  const tasks = [operatorImageTask, skillIconTask, itemTask].map(
    async (task) => {
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
    }
  );
  await Promise.all(tasks);
  console.info(`Uploaded ${newlyUploadedCount} new files, done.`);
})();
