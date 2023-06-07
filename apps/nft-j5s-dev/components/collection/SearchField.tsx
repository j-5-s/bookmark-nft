import { ChangeEvent, useState, FormEvent } from "react";
import { useRouter } from "next/router";

type Props = {
  defaultValue?: string;
  network?: string;
};

export const SearchField = ({ defaultValue = "", network }: Props) => {
  const router = useRouter();
  const [search, setSearch] = useState(defaultValue);
  const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    let path = `/address/${search}`;
    if (network) {
      path += "?network=${network}";
    }
    router.push(path);
  };

  const updateSearch = (evt: ChangeEvent<HTMLInputElement>) => {
    setSearch(evt.target.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="relative flex-grow w-full">
        <input
          onChange={updateSearch}
          value={search}
          type="text"
          id="search"
          name="search"
          placeholder="Address"
          className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
        />
      </div>
    </form>
  );
};
