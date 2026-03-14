import { combineReducers } from "redux";
import AuthReducer from "./AuthReducer";
import productReducer from "./ProductReducer";
import customerReducer from "./CustomerReducer";
import myProfileReducer from "./MyProfileReducer";
import categoryReducer from "./CategoryReducer";
import staffReducer from "./StaffReducer";
import storeReducer from "./StoreReducer";
import productDetailReducer from "./ProductDetailReducer";
import bannerReducer from "./BannerReducer";
import invoiceReducer from "./InvoiceReducer";
import selectedOptionReducer from "./SelectOptionReducer";

const rootReducer = combineReducers({
  authReducer: AuthReducer,
  productReducer: productReducer,
  customerReducer: customerReducer,
  myProfileReducer: myProfileReducer,
  categoryReducer: categoryReducer,
  storeReducer: storeReducer,
  staffReducer: staffReducer,
  productDetailReducer: productDetailReducer,
  bannerReducer: bannerReducer,
  invoiceReducer: invoiceReducer,
  selectedOptionReducer: selectedOptionReducer,
});

export default rootReducer;
