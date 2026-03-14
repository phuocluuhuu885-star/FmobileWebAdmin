import {
  FECTH_CATEGORY_FAILURE,
  FECTH_CATEGORY_REQUEST,
  FECTH_CATEGORY_SUCCESS,
} from "../constants";

export const fetchCategoryRequest = () => {
  return {
    type: FECTH_CATEGORY_REQUEST,
  };
};
export const fetchCategorySuccess = (data) => {
  return {
    type: FECTH_CATEGORY_SUCCESS,
    payload: data,
  };
};
export const fetchCategoryFailure = (error) => {
  return {
    type: FECTH_CATEGORY_FAILURE,
    payload: error,
  };
};
