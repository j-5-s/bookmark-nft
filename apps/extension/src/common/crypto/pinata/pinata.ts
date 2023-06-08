// Function to convert base64 to binary
function base64ToBlob(base64Data: string, contentType: string): Blob {
  const base64Image = base64Data.split(";base64,").pop();
  if (!base64Image) {
    throw new Error("error decoding base64 image");
  }
  const byteCharacters = atob(base64Image);
  const byteArrays: Uint8Array[] = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType });
}

type PinataData = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate: boolean;
};

type PinataProps = {
  jsonData?: string;
  base64Image?: string;
  pinataApiKey: string;
  pinataSecretApiKey: string;
};
// Function to upload JSON and image
export async function uploadToPinata(props: PinataProps): Promise<PinataData> {
  const { jsonData, base64Image, pinataApiKey, pinataSecretApiKey } = props;
  const ts = new Date().getTime();
  const formData = new FormData();
  if (jsonData) {
    formData.append(
      "file",
      new Blob([jsonData], { type: "application/json" }),
      `data.${ts}.json`
    );
  }
  if (base64Image) {
    const binaryImage = base64ToBlob(base64Image, "image/jpeg");
    formData.append("file", binaryImage, `screenshot.${ts}.jpg`);
  }

  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    // use data as needed
    return data as PinataData;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Usage example
// const jsonData = JSON.stringify({ name: 'My JSON Data' });
// const base64Image = fs.readFileSync('image.txt', 'utf8'); // Assuming the base64 image is stored in a file called 'image.txt'

// uploadToPinata(jsonData, base64Image);
