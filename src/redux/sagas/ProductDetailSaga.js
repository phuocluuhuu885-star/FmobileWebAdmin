import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import { FECTH_DETAIL_PRODUCT_REQUEST } from "../constants";
import Cookies from "js-cookie";
import {
  fetchProductDetailFail,
  fetchProductDetailSuccess,
} from "../actions/DetailProduct";

function* fetchProductDetail(action) {
  const { id } = action.payload;
  try {
    const response = yield call(() =>
      axios.get(`${import.meta.env.VITE_BASE_URL}products/detail-product/${id}`)
    );
    yield put(fetchProductDetailSuccess(response.data));
  } catch (error) {
    console.log("fetch customer fail - customer saga: ", error);
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchProductDetailFail(errorData));
    } else {
      yield put(fetchProductDetailFail(error.message));
    }
  }
}

export default function* watchFetchProductDetail() {
  yield takeLatest(FECTH_DETAIL_PRODUCT_REQUEST, fetchProductDetail);
}
