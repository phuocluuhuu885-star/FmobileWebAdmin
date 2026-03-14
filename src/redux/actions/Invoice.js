import {
  FECTH_INVOICE_REQUEST,
  FECTH_INVOICE_SUCCESS,
  FECTH_INVOICE_FAILURE,
} from "../constants";

export const fetchInvoiceRequest = (token) => {
  return {
    type: FECTH_INVOICE_REQUEST,
    payload: { token },
  };
};

export const fetchInvoiceSuccess = (data) => {
  return {
    type: FECTH_INVOICE_SUCCESS,
    payload: data,
  };
};

export const fetchInvoiceFailure = (error) => {
  return {
    type: FECTH_INVOICE_FAILURE,
    payload: error,
  };
};
