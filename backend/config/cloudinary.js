// ======================================================
// FILE: config/cloudinary.js
// STYLENTRA CLOUDINARY CONFIGURATION
// ======================================================

import { v2 as cloudinary } from "cloudinary";

// ======================================================
// VALIDATE ENVIRONMENT VARIABLES
// ======================================================

const requiredEnvVariables = [
    "CLOUDINARY_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_SECRET_KEY"
];

requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
        throw new Error(`Missing Environment Variable: ${key}`);
    }
});

// ======================================================
// CLOUDINARY CONFIGURATION
// ======================================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
    secure: true,
});

// ======================================================
// VERIFY CLOUDINARY CONNECTION
// ======================================================

const connectCloudinary = async () => {
    try {
        await cloudinary.api.ping();

        console.log(`
==================================================
☁️ CLOUDINARY CONNECTED SUCCESSFULLY
==================================================
Cloud Name : ${process.env.CLOUDINARY_NAME}
Status     : ACTIVE
SSL        : ENABLED
==================================================
`);
    } catch (error) {
        throw new Error(`Cloudinary Connection Failed: ${error.message}`);
    }
};

// ======================================================
// COMMON UPLOAD OPTIONS
// ======================================================

const getUploadOptions = (folder = "stylentra") => ({
    folder,
    resource_type: "image",
    quality: "auto",
    fetch_format: "auto",
    flags: "progressive",
    overwrite: false,
    unique_filename: true,
    allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "avif"
    ],
    transformation: [
        {
            width: 1200,
            crop: "limit"
        }
    ]
});

// ======================================================
// SINGLE IMAGE UPLOAD
// ======================================================

const uploadImage = async (
    filePath,
    folder = "stylentra"
) => {
    try {
        const result = await cloudinary.uploader.upload(
            filePath,
            getUploadOptions(folder)
        );

        return {
            success: true,
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// ======================================================
// MULTIPLE IMAGE UPLOAD
// ======================================================

const uploadMultipleImages = async (
    files = [],
    folder = "stylentra"
) => {
    try {
        const images = [];

        for (const file of files) {
            const uploaded = await uploadImage(
                file.path,
                folder
            );

            if (!uploaded.success) {
                throw new Error(uploaded.message);
            }

            images.push(uploaded);
        }

        return {
            success: true,
            images
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// ======================================================
// DELETE IMAGE
// ======================================================

const deleteImage = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId, {
            invalidate: true
        });

        return {
            success: true,
            message: "Image Deleted Successfully"
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

// ======================================================
// EXPORTS
// ======================================================

export {
    cloudinary,
    connectCloudinary,
    uploadImage,
    uploadMultipleImages,
    deleteImage
};