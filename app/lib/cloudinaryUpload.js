// app/lib/cloudinaryUpload.js

export async function uploadToCloudinary(file, type = "image") {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", preset);
  formData.append("folder", "PISHOPA");

  // Detect upload endpoint
  const resourceType = type === "video" ? "video" : "image";

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error(`${resourceType} upload failed`);
  }

  const data = await res.json();

  return data.secure_url;
}