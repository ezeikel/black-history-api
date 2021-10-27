import cloudinary from "cloudinary";

// TODO: remove hardcoded values and read from .env instead
cloudinary.v2.config({
  cloud_name: "black-history",
  api_key: "587685821236624",
  api_secret: "xHtsSFHgmkRH1-4jT4Mjt1uosfg",
});

const processUpload = async ({
  file,
  folder,
  tags,
}: {
  file: {
    createReadStream: () => void;
    fileType?: string;
  };
  folder: string;
  tags: string[];
}) => {
  const { createReadStream, fileType } = file;

  const readableStream = createReadStream();

  let resultUrl = "";
  let resultSecureUrl = "";
  let publicId = "";

  // TODO: fix any
  const cloudinaryUpload = async ({ stream }: { stream: any }) => {
    // TODO: proper conditioning needed here
    const uploadConfig =
      fileType === "image"
        ? {
            folder,
            tags,
            overwrite: true,
            transformation: {
              width: 1080,
              crop: "limit",
              format: "jpg",
            },
          }
        : {
            resource_type: "video",
            folder,
            tags,
            overwrite: true,
          };

    try {
      await new Promise((resolve, reject) => {
        const streamLoad = cloudinary.v2.uploader.upload_stream(
          uploadConfig,
          (error, result) => {
            if (result) {
              // console.log({ result });
              resultUrl = result.url;
              resultSecureUrl = result.secure_url;
              publicId = result.public_id;
              resolve({ resultSecureUrl, publicId });
            } else {
              reject(error);
            }
          },
        );

        stream.pipe(streamLoad);
      });
    } catch (err) {
      throw new Error(`Failed to upload file! Err:${err.message}`);
    }
  };

  await cloudinaryUpload({ stream: readableStream });
  return { resultUrl, resultSecureUrl, publicId };
};

export default processUpload;
