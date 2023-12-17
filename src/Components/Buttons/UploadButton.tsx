import { Dialog, Transition } from "@headlessui/react";
import { Plus } from "../Icons/Icons";
import { Button } from "./Buttons";
import { Fragment, useRef, useState } from "react";

export default function UploadButton({
  refetch,
}: {
  refetch: () => Promise<unknown>;
}) {
  const cancelButtonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);

  const handleClick = () => {
    setOpen(true);
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadedVideo(event.target.files[0] ?? null);
    }
  };

  const handleSubmit = () => {
    type UploadResponse = {
      secure_url: string;
    };
    const videoData = {
      id: video.id,
      userId: sessionData?.user.id ?? "",
      title: video.title ?? undefined,
      description: video.description ?? undefined,
      thumbnailUrl: video.thumbnailUrl ?? undefined,
    };

    const formData = new FormData();
    formData.append("upload_preset", "user_uploads");
    formData.append("file", croppedImage ?? "");
    fetch(
      "https://api.cloudinary.com/v1_1/" + cloudinaryName + "/image/upload",
      {
        method: "POST",
        body: formData,
      },
    )
      .then((response) => response.json() as Promise<UploadResponse>)
      .then((data) => {
        if (
          user.title !== video.title ||
          user.description !== video.description ||
          data.secure_url !== undefined
        ) {
          const newVideoData = {
            ...videoData,
            ...(data.secure_url && { thumbnailUrl: data.secure_url }),
          };
          if (user.title !== video.title) newVideoData.title = user.title;
          if (user.description !== video.description)
            newVideoData.description = user.description;

          addVideoUpdateMutation.mutate(newVideoData, {
            onSuccess: () => {
              void refetch();
              setOpen(false);
            },
          });
        }
      })
      .catch((error) => {
        console.log("An error occured: ", error);
      });
  };

  return (
    <>
      <Button
        variant="primary"
        size="2xl"
        className="ml-2 flex"
        onClick={() => handleClick()}
      >
        <Plus className="mr-2 h-5 w-5 shrink-0 stroke-white" />
        Upload
      </Button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative "
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Upload Video
                      </Dialog.Title>
                      <div className="col-span-full">
                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                          <div className="text-center">
                            {uploadedVideo ? (
                              <p>Your video has been attached.</p>
                            ) : (
                              <div>
                                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                  <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500"
                                  >
                                    <span>Upload a Video</span>
                                    <input
                                      id="file-upload"
                                      name="file-upload"
                                      type="file"
                                      className="sr-only"
                                      onChange={onFileChange}
                                    />
                                  </label>
                                  <p className="pl-1">or drag and drop</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className=" relative mt-5 flex flex-row-reverse gap-2 sm:mt-4 ">
                    <Button
                      type="reset"
                      variant="primary"
                      size="lg"
                      onClick={() => handleSubmit()}
                    >
                      Upload
                    </Button>
                    <Button
                      variant="secondary-gray"
                      size="lg"
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
