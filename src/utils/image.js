export function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const maxWidth = 1200;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };

      image.onerror = reject;
      image.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function resizeImageFile(file) {
  if (!file) {
    return null;
  }

  const lowerName = file.name.toLowerCase();
  if (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif")
  ) {
    throw new Error("HEIC_PHOTO");
  }

  const dataUrl = await resizeImage(file);
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const safeName = lowerName.replace(/\.[^.]+$/, "") || "memory-photo";

  return new File([blob], `${safeName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
