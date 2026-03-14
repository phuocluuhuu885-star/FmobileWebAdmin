import {
  FECTH_DETAIL_PRODUCT_REQUEST,
  FECTH_DETAIL_PRODUCT_FAILURE,
  FECTH_DETAIL_PRODUCT_SUCCESS,
} from "../constants";

export const fetchProductDetailRequest = ( id) => {
  return {
    type: FECTH_DETAIL_PRODUCT_REQUEST,
    payload: {  id },
  };
};

export const fetchProductDetailFail = (error) => {
  return {
    type: FECTH_DETAIL_PRODUCT_FAILURE,
    payload: error,
  };
};

export const fetchProductDetailSuccess = (data) => {
  return {
    type: FECTH_DETAIL_PRODUCT_SUCCESS,
    payload: data,
  };
};
