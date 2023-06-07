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
        console.log("loaded");
        console.log(this);
        setImgSrc(src);
      };
    }
  }, [src]);
  console.log(src);
  return (
    <div>
      <img src={imgSrc} />
    </div>
  );
};
