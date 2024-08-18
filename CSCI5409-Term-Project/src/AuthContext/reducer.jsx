import {LOGIN, LOGOUT, GET_RESET_PASSWORD_CODE, CHANGE_PASSWORD, REGISTER} from "./action"

const reducer = (state, action) => {

    if(action.type === REGISTER){
        return {
            isLoggedIn: false,
            user: null
        }
    }
    if(action.type === LOGIN ){
        return {
            isLoggedIn: true,
            user: action.payload
        }
    }
    if(action.type === LOGOUT){
        return {
            isLoggedIn: false,
            user: null
        }
    }
    if(action.type === GET_RESET_PASSWORD_CODE){
        return {
            isLoggedIn: false,
            user: action.payload
        }
    }
    if(action.type === CHANGE_PASSWORD){
        return {
            isLoggedIn: false,
            user: null
        }
    }
}

export default reducer;