import {
    FECTH_STORE_FAILURE,
    FECTH_STORE_REQUEST,
    FECTH_STORE_SUCCESS,
  } from "../constants";
  
  const initialState = {
    loading: false,
    data: null,
    error: null,
  };
  
  const storeReducer = (state = initialState, action) => {

    switch (action.type) {
      case FECTH_STORE_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case FECTH_STORE_SUCCESS:
        return {
          ...state,
          loading: false,
          error: null,
          data: action.payload,
        };
      case FECTH_STORE_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default storeReducer;
  