import axios from "axios";
import type { Blog, PaginationState } from "../types/blog";



interface FilterPaginationDataProps {
  create_new_arr?: boolean;
  state: PaginationState | null;
  data: Blog[];
  page: number;
  countRoute: string;
  access_token?: string | null;
  data_to_send?: Record<string, unknown>;
}


export const filterPaginationData = async ({
  create_new_arr = false,
  state,
  data,
  page,
  countRoute,
  access_token,
  data_to_send={},
}:FilterPaginationDataProps) => {
  let obj;

  if (state !== null && !create_new_arr) {
    obj = {
      ...state,
      results: [...state.results, ...data],
      page: page,
    };
  } else {
    try {
      const { data: responseData } = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + countRoute,
        data_to_send,
        access_token
          ? { headers: { Authorization: `Bearer ${access_token}` } }
          : undefined,
      );

      const { totalDocs } = responseData;

      obj = {
        results: data,
        page: 1,
        totalDocs,
      };
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  return obj;
};
