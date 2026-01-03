import { createSlice } from "@reduxjs/toolkit";;

const initialState = {
    user:null,
    status:"idle",
    error:null,
}

const authslice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        setUser:(state,action)=>{
            state.user = action.payload;
            state.status ="succeeded";
            state.error = null;


        },
        clearUser:(state)=>{
            state.user=null;
            state.status="idle";
            state.error = null;

        },
        setAuthStatus:(state,action)=>{
            state.status = action.payload;

        },
        setAuthError:(state,action)=>{
            state.error=action.payload;
            state.status = "failed";

        },
    }
})
export const {setUser,clearUser,setAuthStatus,setAuthError} = authslice.actions;
export default authslice.reducer;