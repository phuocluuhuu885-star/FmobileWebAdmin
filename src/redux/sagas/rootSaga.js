import { all, call } from "redux-saga/effects";

import watchFetchLogin from "./AuthSaga";
import watchFetchCustomer from "./customerSaga";

// Tạm thời chưa import AuthSaga, MyProfileSaga... nếu bạn chưa copy sang
 function* rootSaga() {
  yield all([
      watchFetchLogin(),
      watchFetchCustomer()
  ]);
}
export default rootSaga;