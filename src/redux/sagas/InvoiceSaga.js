import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import { FECTH_INVOICE_REQUEST } from "../constants";
import Cookies from "js-cookie";
import { fetchInvoiceFailure, fetchInvoiceSuccess } from "../actions/Invoice";

function* fetchInvoice(action) {
  const { token } = action.payload;
  try {
    const response = yield call(() =>
      axios.get(`${import.meta.env.VITE_BASE_URL}order/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    yield put(fetchInvoiceSuccess(response.data));
  } catch (error) {
    console.log("fetch invoice fail - invoice saga: ", error);
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchInvoiceFailure(errorData));
    } else {
      yield put(fetchInvoiceFailure(error.message));
    }
  }
}

export default function* watchFetchInvoice() {
  yield takeLatest(FECTH_INVOICE_REQUEST, fetchInvoice);
}
