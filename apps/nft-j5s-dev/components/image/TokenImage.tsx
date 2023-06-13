import { useEffect, useState } from "react";
import { NFTMetadata } from "../../types";
import NextImage from "next/image";
import { getImageURIFromIPFS } from "../util";
interface ITokenImage {
  data?: NFTMetadata | null;
  width: number;
}

interface IImageData {
  uri: string | null;
  height?: number;
  width?: number;
}

export const TokenImage = (props: ITokenImage) => {
  const { data, width: widthProp } = props;
  const { name, image, attributes } = data || {};

  const imgUrl = getImageURIFromIPFS(image);
  const dimensions = attributes?.find(
    (attr) => attr.trait_type === "Content Size"
  );
  const [width, height] = dimensions?.value.split("x") || [];

  const [imgData, setImageData] = useState<IImageData>({
    uri: imgUrl,
    width: width ? parseInt(width, 10) : undefined,
    height: height ? parseInt(height, 10) : undefined,
  });

  const aspectRatio =
    imgData.width && imgData.height
      ? imgData.width / imgData.height
      : undefined;

  useEffect(() => {
    if (width && height && !imgData?.width && !imgData?.height) {
      setImageData({
        uri: imgUrl,
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      });
    } else if (data && (!imgData?.width || !imgData.height)) {
      const img = new Image();

      img.src = imgData.uri || "";
      img.onload = () => {
        setImageData({
          ...imgData,
          width: img.width,
          height: img.height,
        });
      };
    }
  }, [imgData, width, height, data, imgUrl]);

  if (!imgData.uri || !aspectRatio) return null;
  const w = widthProp;
  const h = w / aspectRatio;
  return <NextImage src={imgData.uri} width={w} height={h} alt={name} />;
};
