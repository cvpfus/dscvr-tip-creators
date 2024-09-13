import axios from "axios";
import { GRAPHQL_API_URL } from "../constants/index.js";
import { DSCVR_USER } from "../queries/index.js";

export const getUserInfo = (username) => {
  const variables = {
    username,
  };

  return axios.post(GRAPHQL_API_URL, {
    query: DSCVR_USER,
    variables,
  });
};
