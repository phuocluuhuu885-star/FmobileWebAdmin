import { put, takeLatest, call } from "redux-saga/effects";
import axios from "axios";
import { FECTH_STAFF_REQUEST} from "../constants";
import Cookies from "js-cookie";
import { fetchStaffFail, fetchStaffSuccess } from "../actions/Staff";

function* fetchStaff(action) {
  const {role, token } = action.payload;
  try {
    const response = yield call(() =>
      axios.get(`${import.meta.env.VITE_BASE_URL}user/customers?role=${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    );
    yield put(fetchStaffSuccess(response.data));
  } catch (error) {
    if (error.response) {
      const response = error.response;
      const errorData = response.data;
      yield put(fetchStaffFail(errorData));
    } else {
      yield put(fetchStaffFail(error.message));
    }
  }
}

export default function* watchFetchStaff() {
  yield takeLatest(FECTH_STAFF_REQUEST, fetchStaff);
}
