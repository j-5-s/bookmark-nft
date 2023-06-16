import { ExclamationTriangle } from "./icons/exclamation-triangle";
import { Loader } from "./icons/loader";
type FullPageMessagingProps = {
  error?: string;
  loading?: boolean;
  message?: string;
};
export const FullPageMessaging = (props: FullPageMessagingProps) => {
  const { error, loading, message } = props;
  return (
    <div className="text-gray-600 body-font py-24">
      <div className="container px-5 py-24 mx-auto">
        <div className="xl:w-1/2 lg:w-3/4 w-full mx-auto text-center">
          {error && <ExclamationTriangle />}
          {loading && <Loader />}
          {error && (
            <p className="leading-relaxed text-lg">
              Oops an error occurred: {error}
            </p>
          )}
          {message && <p className="leading-relaxed text-lg">{message}</p>}
          {loading && (
            <p className="leading-relaxed text-lg">
              Searching the blockchain...
            </p>
          )}
          <span className="inline-block h-1 w-10 rounded bg-indigo-500 mt-8 mb-6"></span>
        </div>
      </div>
    </div>
  );
};
