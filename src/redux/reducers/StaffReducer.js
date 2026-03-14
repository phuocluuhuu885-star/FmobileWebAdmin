import {
  FECTH_STAFF_FAILURE,
  FECTH_STAFF_REQUEST,
  FECTH_STAFF_SUCCESS,
} from "../constants/index";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const staffReducer = (state = initialState, action) => {
  switch (action.type) {
    case FECTH_STAFF_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FECTH_STAFF_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case FECTH_STAFF_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default staffReducer;
