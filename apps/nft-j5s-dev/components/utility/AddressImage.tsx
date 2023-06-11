import { useEnsName, useEnsAvatar } from "wagmi";
type AddressProps = {
  address?: string | `0x${string}`;
};

export const AddressImage = (props: AddressProps) => {
  const { address } = props;

  const { data } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1,
  });

  const name = data;
  const { data: ensAvatarSrc } = useEnsAvatar({
    name: name,
    chainId: 1,
  });

  return (
    <div className="w-20 h-20 rounded-full  inline-flex items-center justify-center bg-gray-200 text-gray-400">
      {ensAvatarSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ensAvatarSrc} alt="user" className="rounded-full " />
      )}
      {!ensAvatarSrc && (
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="w-10 h-10"
          viewBox="0 0 24 24"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )}
    </div>
  );
};
