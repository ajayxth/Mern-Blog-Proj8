import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { s3 } from "../server.js";

export const CreateUploadUrl = async () => {
  const date = new Date();

  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  const command = new PutObjectCommand({
    Bucket: "blogo-mern",
    Key: imageName,
    ContentType: "image/jpeg",
  });

  const uploadURL = await getSignedUrl(s3, command, {
    expiresIn: 1000,
  });

  return uploadURL;
};