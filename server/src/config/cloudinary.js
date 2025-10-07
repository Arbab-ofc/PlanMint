import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dh40xs6az',
  api_key: process.env.CLOUDINARY_API_KEY || '454324886127794',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'CsuqvD1Qh0YhieN4MaO3m2gNnQ0'
});


export async function uploadToCloudinary(filePath, folder = 'planmint') {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}


export async function deleteFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}


export function extractPublicId(url) {
  if (!url) return null;
  
  try {
    
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    
    const pathParts = parts.slice(uploadIndex + 2);
    const publicIdWithExt = pathParts.join('/');
    
    
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

export default cloudinary;
