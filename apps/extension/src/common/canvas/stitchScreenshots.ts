export interface ScreenshotData {
  dataUrl: string;
  scrollY: number;
}

export async function stitchScreenshots(
  screenshotsOriginal: ScreenshotData[],
  pixelRatio: number,
  format = "jpeg"
): Promise<string> {
  const screenshots = screenshotsOriginal.filter(({ dataUrl }) => !!dataUrl);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Convert data URLs to Image objects and create array of promises that
  // resolve when each image has been loaded
  const loadImages = screenshots.map(({ dataUrl }) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  });

  try {
    const images = await Promise.all(loadImages);
    const width = images[0].width;
    const height =
      screenshots[screenshots.length - 1].scrollY * pixelRatio +
      images[images.length - 1].height;

    // Set the canvas size and draw each image onto the canvas
    canvas.width = width / pixelRatio;
    canvas.height = height / pixelRatio;
    ctx?.scale(1 / pixelRatio, 1 / pixelRatio);

    images.forEach((img, i) => {
      const yPosition = screenshots[i].scrollY * pixelRatio;
      ctx?.drawImage(img, 0, yPosition);
    });

    // Convert the canvas to a data URL
    const dataUrl = canvas.toDataURL(`image/${format}`);
    const preview = new Image();
    preview.src = dataUrl;
    return dataUrl;
  } catch (error) {
    throw new Error(`Failed to load one or more images: ${error}`);
  }
}
