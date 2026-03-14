import {
  FECTH_BANNER_REQUEST,
  FECTH_BANNER_SUCCESS,
  FECTH_BANNER_FAILURE,
} from "../constants";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const bannerReducer = (state = initialState, action) => {
  switch (action.type) {
    case FECTH_BANNER_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FECTH_BANNER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.payload,
      };
    case FECTH_BANNER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default bannerReducer;
