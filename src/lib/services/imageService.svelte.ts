import { supabase } from "./supabase";

function sanitizeFileName(fileName: string): string {
    // Replace spaces with underscores and remove any special characters
    return fileName
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .toLowerCase();
}

export async function uploadImage(file: File, propertyId: string) {
    console.log("Uploading image for property:", propertyId, file);

    // Create a sanitized filename
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `properties/${propertyId}/${sanitizedFileName}`;

    const { data, error } = await supabase.storage
        .from("property-images")
        .upload(filePath, file);

    if (error) {
        console.error("Error uploading to Supabase:", error);
        return {
            success: false,
            error: error.message,
        };
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
        .from("property-images")
        .getPublicUrl(filePath);

    return {
        success: true,
        url: urlData.publicUrl,
    };
}

export async function uploadImages(files: File[], propertyId: string) {
    console.log("Uploading images for property:", propertyId, files);

    try {
        // Upload all files in parallel
        const results = await Promise.all(
            files.map((file) => uploadImage(file, propertyId)),
        );

        // Check if all uploads were successful
        const allSuccessful = results.every((result) => result.success);

        return {
            success: allSuccessful,
            urls: results.map((result) => result.url),
        };
    } catch (error) {
        console.error("Error uploading images:", error);
        return {
            success: false,
            urls: [],
            error: "Failed to upload one or more images",
        };
    }
}

export async function getPropertyImages(propertyId: string) {
    // List all files in the property's directory
    const { data: files, error } = await supabase.storage
        .from("property-images")
        .list(`properties/${propertyId}`);

    if (error) {
        console.error("Error listing property images:", error);
        return {
            success: false,
            error: error.message,
            urls: [],
        };
    }

    // Get public URLs for all files
    const urls = files.map((file) => {
        const { data } = supabase.storage
            .from("property-images")
            .getPublicUrl(`properties/${propertyId}/${file.name}`);
        return data.publicUrl;
    });

    return {
        success: true,
        urls,
        files, // Include original file metadata if needed
    };
}