import { type NextPage } from "next";
import { useRouter } from "next/router";
import {
  ErrorMessage,
  Layout,
  LoadingMessage,
  PlaylistPage,
} from "~/Components/Components";
import { api } from "~/utils/api";

const Playlist: NextPage = () => {
  const router = useRouter();
  const { playlistId } = router.query;
  const { data, isLoading, error } = api.playlist.getPlaylistById.useQuery(
    playlistId as string,
  );

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error ?? !data) {
      <ErrorMessage
        message="No Playlists are available"
        description="Create a playlist."
      />;
    } else {
      return <></>;
    }
  };
  const playlist = data?.playlist;

  return (
    <Layout>
      {!playlist ? (
        <Error />
      ) : (
        <PlaylistPage
          playlist={{
            id: data.playlist?.id ?? "",
            title: data.playlist?.title ?? "",
            description: data.playlist?.description ?? "",
            videoCount: data.videos.length ?? 0,
            playlistThumbnail: data.videos[0]?.thumbnailUrl ?? "",
            createdAt: data.playlist?.createdAt ?? new Date(),
          }}
          videos={data.videos.map((video) => ({
            id: video?.id ?? "",
            title: video?.title ?? "",
            thumbnailUrl: video?.thumbnailUrl ?? "",
            createdAt: video?.createdAt ?? new Date(),
            views: video?.views ?? 0,
          }))}
          authors={data.authors.map((author) => ({
            id: author?.id ?? "",
            name: author?.name ?? "",
            image: author?.image ?? "",
          }))}
          user={{
            id: data.user?.id ?? "",
            name: data.user?.name ?? "",
            image: data.user?.image ?? "",
            followers: data.user?.followers ?? 0,
          }}
        />
      )}
    </Layout>
  );
};

export default Playlist;
