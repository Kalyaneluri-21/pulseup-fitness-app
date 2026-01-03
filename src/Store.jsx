import {configureStore} from "@reduxjs/toolkit";
import authReducer from "./features/AuthSlice";
import themeReducer from "./features/ThemeSlice"
export const Store = configureStore({
    reducer:{
        auth:authReducer,
        theme:themeReducer
    }
})