import {
  FECTH_STAFF_FAILURE,
  FECTH_STAFF_REQUEST,
  FECTH_STAFF_SUCCESS,
} from "../constants";

export const fetchStaffRequest = (role, token) => {
  return {
    type: FECTH_STAFF_REQUEST,
    payload: { role, token },
  };
};

export const fetchStaffFail = (error) => {
  return {
    type: FECTH_STAFF_FAILURE,
    payload: error,
  };
};

export const fetchStaffSuccess = (data) => {
  return {
    type: FECTH_STAFF_SUCCESS,
    payload: data,
  };
};
