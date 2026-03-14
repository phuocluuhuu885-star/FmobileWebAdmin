import { combineReducers } from "redux";
import AuthReducer from "./AuthReducer";
import productReducer from "./ProductReducer";
import customerReducer from "./CustomerReducer";
import myProfileReducer from "./MyProfileReducer";
import categoryReducer from "./CategoryReducer";
import storeReducer from "./StoreReducer";

import productDetailReducer from "./ProductDetailReducer";
import bannerReducer from "./BannerReducer";

import selectedOptionReducer from "./SelectOptionReducer";

const rootReducer = combineReducers({
  authReducer: AuthReducer,
  productReducer: productReducer,
  customerReducer: customerReducer,
  myProfileReducer: myProfileReducer,
  categoryReducer: categoryReducer,
  storeReducer: storeReducer,

  productDetailReducer: productDetailReducer,
  bannerReducer: bannerReducer,

  selectedOptionReducer: selectedOptionReducer,
});

export default rootReducer;
