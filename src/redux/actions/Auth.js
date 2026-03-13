import {
  CLEAR_DATA_TOKEN,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
} from "../constants";

export const fetchLoginRequest = (data) => {
  return {
    type: LOGIN_REQUEST,
    payload: data,
  };
};

export const fetchLoginSuccess = (data) => {
  return {
    type: LOGIN_SUCCESS,
    payload: data,
  };
};
export const fetchLoginFailure = (error) => {
  return {
    type: LOGIN_FAILURE,
    payload: error,
  };
};

export const fetchLogout = () => {
  return {
    type: CLEAR_DATA_TOKEN,
  };
};
