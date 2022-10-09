import processUpload from "./processUpload";

const processFile = async ({ file, tags }: { file: any; tags: string[] }) => {
  let fileType;
  const { createReadStream, mimetype } = await file;

  switch (mimetype) {
    case "image/png":
    case "image/jpg":
    case "image/jpeg":
    case "image/heic":
      fileType = "image";
      break;
    case "video/mp4":
    case "video/quicktime":
      fileType = "video";
      break;
    default:
      fileType = "image";
      break;
  }

  const folder = `uploads/media/${fileType}s`;
  const { resultSecureUrl, publicId } = await processUpload({
    file: { createReadStream, fileType },
    tags,
    folder,
  });

  return {
    url: resultSecureUrl,
    publicId,
  };
};

export default processFile;
