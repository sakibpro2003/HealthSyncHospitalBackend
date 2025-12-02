import multer from "multer";
import type { Express } from "express";
import cloudinary from "../utils/cloudinaryConfig";
import config from "../config";

const upload = multer({
  storage: multer.memoryStorage(),
});

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  const options = {
    folder: config.cloudinary_folder,
    resource_type: "image" as const,
    format: "webp",
    public_id: file.originalname.split(".")[0],
  };

  return await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result?.secure_url) {
        reject(error ?? new Error("Image upload failed"));
        return;
      }

      resolve(result.secure_url);
    });

    stream.end(file.buffer);
  });
};

export default upload;
