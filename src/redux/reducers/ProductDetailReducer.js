import {
  FECTH_DETAIL_PRODUCT_REQUEST,
  FECTH_DETAIL_PRODUCT_FAILURE,
  FECTH_DETAIL_PRODUCT_SUCCESS,
} from "../constants/index";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const productDetailReducer = (state = initialState, action) => {
  switch (action.type) {
    case FECTH_DETAIL_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FECTH_DETAIL_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case FECTH_DETAIL_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default productDetailReducer;
