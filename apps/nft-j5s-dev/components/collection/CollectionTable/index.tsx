type CollectionTableProps = {
  tokens?: bigint[];
  renderRow: (tokenId: bigint) => React.ReactNode;
};
export const CollectionTable = (props: CollectionTableProps) => {
  const { tokens, renderRow } = props;
  return (
    <table className="table-auto w-full text-left whitespace-no-wrap">
      <thead>
        <tr>
          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100 rounded-tl rounded-bl">
            ID
          </th>
          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
            URL
          </th>

          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
            Name
          </th>
          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
            Date
          </th>
          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
            IPFS
          </th>
          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
            Creator
          </th>
          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
            Clone
          </th>
          <th className="px-4 py-3 title-font tracking-wider font-medium text-gray-900 text-sm bg-gray-100">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="text-xs">
        {tokens?.map((tokenId) => renderRow(tokenId))}
      </tbody>
    </table>
  );
};
