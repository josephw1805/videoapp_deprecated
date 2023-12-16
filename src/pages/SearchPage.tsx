import Head from "next/head";
import {
  ErrorMessage,
  Layout,
  LoadingMessage,
  SincleColumnVideo,
} from "../Components/Components";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const searchQuery = router.query.q;

  const { data, isLoading, error } = api.video.getVideosBySearch.useQuery(
    searchQuery as string,
  );
  const errorTypes = error ?? !data ?? data.videos.length === 0;

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (errorTypes) {
      return (
        <ErrorMessage
          message="No Videos"
          description="Sorry try another search result."
        />
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <Head>
        <title>VidChill</title>
        <meta
          name="description"
          content=" Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on VidChill."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        {errorTypes ? (
          <Error />
        ) : (
          <SincleColumnVideo
            videos={
              data?.videos.map((video) => ({
                id: video?.id ?? "",
                title: video?.title ?? "",
                thumbnailUrl: video?.thumbnailUrl ?? "",
                createdAt: video?.createdAt ?? new Date(),
                views: video?.views ?? 0,
              })) ?? []
            }
            users={
              data?.users.map((user) => ({
                name: user?.name ?? "",
                image: user?.image ?? "",
              })) ?? []
            }
          />
        )}
      </Layout>
    </>
  );
};

export default SearchPage;
