import axios from "axios";

export const uploadImage = async (img) => {
  const { data } = await axios.get(
    import.meta.env.VITE_SERVER_DOMAIN + "/blog/generate-upload-url",
  );

  const { uploadURL } = data;

  await axios({
    method: "PUT",
    url: uploadURL,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    data: img,
  });

  const imgUrl = uploadURL.split("?")[0];

  return imgUrl;
};
