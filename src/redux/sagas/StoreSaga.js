import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import { FECTH_STORE_REQUEST } from "../constants";
import { fetchStoreFailure, fetchStoreSuccess } from "../actions/Store";

function* fetchStore(action) {
  const { token } = action.payload;
  try {
    let apiUrl = `${import.meta.env.VITE_BASE_URL}store/all-store`;

    const response = yield call(() =>
      axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    yield put(fetchStoreSuccess(response.data));
  } catch (error) {
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchStoreFailure(errorData));
    } else {
      yield put(fetchStoreFailure(error.message));
    }
  }
}

export default function* watchFetchStore() {
  yield takeLatest(FECTH_STORE_REQUEST, fetchStore);
}
