import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const startCloudinary = async()=>{
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

export const uploadToCloudinary = async (localFilePath, folder = "KingsMove") => {
  try {
    // console.log("Cloudinary configured:", cloudinary.config());
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: "auto",
    });
    // Remove local file after upload
    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    // Remove local file if upload fails
    fs.unlinkSync(localFilePath);
    throw error;
  }
};

// Helper to extract publicId from a Cloudinary URL
function extractPublicIdFromUrl(url) {
  // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/file.jpg
  // Extract: folder/file (without extension)
  try {
    const matches = url.match(/\/upload\/[^\/]+\/(.+)$/);
    if (!matches || !matches[1]) return null;
    let publicId = matches[1];
    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");
    return publicId;
  } catch {
    return null;
  }
}

export const deleteFromCloudinary = async (cloudinaryUrl, resourceType = "image") => {
  const publicId = extractPublicIdFromUrl(cloudinaryUrl);
  if (!publicId) throw new Error("Invalid Cloudinary URL");
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw error;
  }
};
