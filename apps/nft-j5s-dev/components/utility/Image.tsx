import { useState, useEffect } from "react";

type Props = {
  src: string;
};

export const ImageComponent = (props: Props) => {
  const { src } = props;
  const [imgSrc, setImgSrc] = useState<string>("");
  useEffect(() => {
    if (src) {
      const img = new Image();
      img.src = src;
      img.onload = function () {
        setImgSrc(src);
      };
    }
  }, [src]);
  return (
    <div>
      <img src={imgSrc} />
    </div>
  );
};
