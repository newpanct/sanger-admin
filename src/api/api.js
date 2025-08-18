import axios from 'axios';
import {baseRequst,formRequst} from "./Network";

export const pwdAdminLogin = async (obj) => {
    try {
        const formData = new FormData();
        formData.append("email",obj.email);
        formData.append("password",obj.password);
        const response = await formRequst('/pwdAdminLogin','post', formData );
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};
