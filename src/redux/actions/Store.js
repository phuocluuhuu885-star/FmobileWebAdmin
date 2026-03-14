import {
  FECTH_STORE_FAILURE,
  FECTH_STORE_REQUEST,
  FECTH_STORE_SUCCESS,
} from "../constants";

export const fetchStoreRequest = (token) => {
  return {
    type: FECTH_STORE_REQUEST,
    payload: { token },
  };
};
export const fetchStoreSuccess = (data) => {
  return {
    type: FECTH_STORE_SUCCESS,
    payload: data,
  };
};
export const fetchStoreFailure = (error) => {
  return {
    type: FECTH_STORE_FAILURE,
    payload: error,
  };
};
