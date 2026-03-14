import { all, call } from "redux-saga/effects";
import watchFetchLogin from "./AuthSaga";
import watchFetchProduct from "./ProductSaga";
import watchFetchCustomer from "./customerSaga";
import watchFetchMyProfile from "./MyProfileSaga";
import watchFetchCategory from "./CategorySaga";
import watchFetchStore from "./StoreSaga";
import watchFetchStaff from "./StaffSaga";
import watchFetchProductDetail from "./ProductDetailSaga";
import watchFetchBanner from "./BannerSaga";
import watchFetchInvoice from "./InvoiceSaga";
import { watchSetSelectedOption } from "./SelectOptionSaga";

function* rootSaga() {
  yield all([
    watchFetchLogin(),
    watchFetchProduct(),
    watchFetchCustomer(),
    watchFetchMyProfile(),
    watchFetchCategory(),
    watchFetchStore(),
    watchFetchStaff(),
    watchFetchProductDetail(),
    watchFetchBanner(),
    watchFetchInvoice(),
    watchSetSelectedOption(),
  ]);
}
export default rootSaga;
