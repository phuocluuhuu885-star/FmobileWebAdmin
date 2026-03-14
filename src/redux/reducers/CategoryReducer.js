import {
  FECTH_CATEGORY_SUCCESS,
  FECTH_CATEGORY_REQUEST,
  FECTH_CATEGORY_FAILURE,
} from "../constants";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case FECTH_CATEGORY_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FECTH_CATEGORY_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.payload,
      };
    case FECTH_CATEGORY_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default categoryReducer;
