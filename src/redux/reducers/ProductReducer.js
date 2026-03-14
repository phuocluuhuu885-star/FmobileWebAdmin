import {
  FECTH_PRODUCT_FAILURE,
  FECTH_PRODUCT_REQUEST,
  FECTH_PRODUCT_SUCCESS,
} from "../constants";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const productReducer = (state = initialState, action) => {
  switch (action.type) {
    case FECTH_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FECTH_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.payload,
      };
    case FECTH_PRODUCT_FAILURE:
      return {
        ...state,
        loading: true,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default productReducer;
