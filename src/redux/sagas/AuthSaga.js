import { put, takeLatest, call } from "redux-saga/effects";
import { fetchLoginFailure, fetchLoginSuccess } from "../actions/Auth";
import axios from "axios";
import { LOGIN_REQUEST } from "../constants";

function* fetchLogin(action) {
  try {
    const { email, password } = action.payload;

    const response = yield call(() =>
      axios.post(`${import.meta.env.VITE_BASE_URL}login`, { email, password })
    );

    yield put(fetchLoginSuccess(response.data));
  } catch (error) {
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchLoginFailure(errorData));
    } else {
      yield put(fetchLoginFailure(error.message));
    }
  }
}

export default function* watchFetchLogin() {
  yield takeLatest(LOGIN_REQUEST, fetchLogin);
}
