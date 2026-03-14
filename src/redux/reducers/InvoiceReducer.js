import {
  FECTH_INVOICE_REQUEST,
  FECTH_INVOICE_SUCCESS,
  FECTH_INVOICE_FAILURE,
} from "./../constants/index";

const initialState = {
  loading: false,
  data: null,
  error: null,
};

const invoiceReducer = (state = initialState, action) => {
  switch (action.type) {
    case FECTH_INVOICE_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FECTH_INVOICE_SUCCESS:
      return {
        ...state,
        loading: false,
        data: action.payload,
        error: null,
      };
    case FECTH_INVOICE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default invoiceReducer;
