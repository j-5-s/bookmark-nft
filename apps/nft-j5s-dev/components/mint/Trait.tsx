import cs from "classnames";

type TraitProps = {
  trait: {
    trait_type: string;
    value: string | number;
  };
  border?: boolean;
};
export const Trait = (props: TraitProps) => {
  const { trait, border = true } = props;
  const { trait_type } = trait;
  let { value } = trait;

  if (trait_type === "Timestamp") {
    value = new Date(value as number).toLocaleString();
  }
  if (trait_type === "Text") {
    return (
      <div
        className={cs("flex border-gray-200 py-2 flex-col", {
          "border-b": border,
        })}
      >
        <span className=" text-xs">Text Content</span>
        <textarea
          rows={4}
          disabled
          className="ml-auto text-gray-400 text-xs w-full border border-gray-200 bg-gray-100 p-2 rounded"
          value={value}
        />
      </div>
    );
  }

  return (
    <div
      className={cs("flex border-gray-200 py-2 items-center", {
        "border-b": border,
      })}
    >
      <span className="w-1/4  text-xs">{trait_type}</span>
      <span className="ml-auto text-gray-900 text-xs max-w-md text-right">
        {value}
      </span>
    </div>
  );
};
