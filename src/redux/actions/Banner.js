import {
  FECTH_BANNER_REQUEST,
  FECTH_BANNER_SUCCESS,
  FECTH_BANNER_FAILURE,
} from "../constants";

export const fetchBannerRequest = () => {
  return {
    type: FECTH_BANNER_REQUEST,
  };
};

export const fetchBannerSuccess = (data) => {
  return {
    type: FECTH_BANNER_SUCCESS,
    payload: data,
  };
};
export const fetchBannerFailure = (error) => {
  return {
    type: FECTH_BANNER_FAILURE,
    payload: error,
  };
};
