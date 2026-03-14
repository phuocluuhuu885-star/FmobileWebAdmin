import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import { FECTH_CATEGORY_REQUEST } from "../constants";
import {
  fetchCategoryFailure,
  fetchCategorySuccess,
} from "../actions/Category";

function* fetchCategory() {
  try {
    let apiUrl = `${import.meta.env.VITE_BASE_URL}category/get-list`;

    const response = yield call(() => axios.get(apiUrl));
    yield put(fetchCategorySuccess(response.data));
  } catch (error) {
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchCategoryFailure(errorData));
    } else {
      yield put(fetchCategoryFailure(error.message));
    }
  }
}

export default function* watchFetchCategory() {
  yield takeLatest(FECTH_CATEGORY_REQUEST, fetchCategory);
}
