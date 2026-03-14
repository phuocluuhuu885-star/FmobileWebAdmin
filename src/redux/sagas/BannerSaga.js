import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import { FECTH_BANNER_REQUEST } from "../constants";
import { fetchBannerFailure, fetchBannerSuccess } from "../actions/Banner";

function* fetchBanner() {
  try {
    let apiUrl = `${import.meta.env.VITE_BASE_URL}banner/get-list`;
    const response = yield call(() => axios.get(apiUrl));
    yield put(fetchBannerSuccess(response.data));
  } catch (error) {
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchBannerFailure(errorData));
    } else {
      yield put(fetchBannerFailure(error.message));
    }
  }
}

export default function* watchFetchBanner() {
  yield takeLatest(FECTH_BANNER_REQUEST, fetchBanner);
}
