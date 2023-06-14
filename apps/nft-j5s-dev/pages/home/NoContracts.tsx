import Image from "next/image";
export const NoContracts = () => {
  const exampleContractUrl = process.env.NEXT_PUBLIC_EXAMPLE_CONTRACT_ADDRESS;
  return (
    <section className="text-gray-600 body-font">
      <div className="container px-5 py-24 mx-auto">
        <div className="xl:w-1/2 lg:w-3/4 w-full mx-auto text-center">
          <div
            role="status"
            className="mb-4 flex justify-center text-center items-center ml-1"
          >
            <Image src="/rico.png" width={80} height={80} alt="woof" />
            <span className="sr-only">Rico</span>
          </div>
          <p className="leading-relaxed text-sm">Woof!</p>
          <h2 className="text-sm text-indigo-500 tracking-widest font-medium title-font mb-1 uppercase">
            Looks like you don&apos;t have any contracts yet.
          </h2>

          <div className="flex justify-center ">
            <span className="inline-block h-1 w-10 rounded bg-indigo-500 mt-8 mb-6"></span>
          </div>
          <p className="text-gray-500">
            Click the Deploy New Contract button above. You can also view an{" "}
            <a
              href={exampleContractUrl}
              className="text-blue-500 hover:underline"
            >
              example contract
            </a>{" "}
            from{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://j5s.dev"
              className="text-blue-500 hover:underline"
            >
              https://j5s.dev
            </a>{" "}
            (the creator of this site)
          </p>
        </div>
      </div>
    </section>
  );
};
