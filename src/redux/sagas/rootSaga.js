import { all, call } from "redux-saga/effects";
import watchFetchLogin from "./AuthSaga";
import watchFetchProduct from "./ProductSaga";
import watchFetchCustomer from "./customerSaga";
import watchFetchCategory from "./CategorySaga";
import watchFetchStore from "./StoreSaga";
import watchFetchProductDetail from "./ProductDetailSaga";
import watchFetchBanner from "./BannerSaga";
import { watchSetSelectedOption } from "./SelectOptionSaga";

function* rootSaga() {
  yield all([
    watchFetchLogin(),
    watchFetchProduct(),
    watchFetchCustomer(),
    watchFetchCategory(),
    watchFetchStore(),
    watchFetchProductDetail(),
    watchFetchBanner(),
    watchSetSelectedOption(),
  ]);
}
export default rootSaga;
