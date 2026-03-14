import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import {
  fetchMyProfileFailure,
  fetchMyProfileSuccess,
} from "../actions/MyProfile";
import { FECTH_MY_INFO_REQUEST } from "../constants";

function* fetchMyProfile(action) {
  const { uid, token } = action.payload;
  try {
    const response = yield call(() =>
      axios.get(`${import.meta.env.VITE_BASE_URL}user/detail-profile/${uid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    yield put(fetchMyProfileSuccess(response.data));
  } catch (error) {
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchMyProfileFailure(errorData));
    } else {
      yield put(fetchMyProfileFailure(error.message));
    }
  }
}

export default function* watchFetchMyProfile() {
  yield takeLatest(FECTH_MY_INFO_REQUEST, fetchMyProfile);
}
