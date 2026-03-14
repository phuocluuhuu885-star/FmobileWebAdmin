import { put, takeLatest } from "redux-saga/effects";
import { setSelectedOption } from "../actions/SelectOption";

function* handleSetSelectedOption(action) {
  yield put(setSelectedOption(action.payload));
}

export function* watchSetSelectedOption() {
  yield takeLatest("SET_SELECTED_OPTION_ASYNC", handleSetSelectedOption);
}
