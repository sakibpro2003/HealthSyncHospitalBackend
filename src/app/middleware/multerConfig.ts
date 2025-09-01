import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinaryConfig";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "medimart/uploads", 
    format: "webp", 
    public_id: file.originalname.split(".")[0],
  }),
});

const upload = multer({ storage });

export default upload;
