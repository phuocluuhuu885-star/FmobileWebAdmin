import { put, takeLatest, call } from "redux-saga/effects";
import { fetchProductFailure, fetchProductSuccess } from "../actions/Product";
import axios from "axios";
import { FECTH_PRODUCT_REQUEST } from "../constants";

function* fetchProduct(action) {
  const { category, store } = action.payload;
  try {
    let apiUrl = `${
      import.meta.env.VITE_BASE_URL
    }products/all-product?sort=-1&`;

    if (category) {
      apiUrl += `category=${category}&`;
    }

    if (store) {
      apiUrl += `store=${store}&`;
    }

    const response = yield call(() => axios.get(apiUrl));
    yield put(fetchProductSuccess(response.data));
  } catch (error) {
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchProductFailure(errorData));
    } else {
      yield put(fetchProductFailure(error.message));
    }
  }
}

export default function* watchFetchProduct() {
  yield takeLatest(FECTH_PRODUCT_REQUEST, fetchProduct);
}
