import fastAPI from "./fastapi";

import type { UserData } from "~/types/user_data";

export async function updateUserData(
    username: string,
    data: UserData,
) {
    try {
        await fastAPI.put(
            '/user-data/',
            data,
            { params: { username: username } }
        )
    } catch (error) {
        console.log(error)
        return null
    }
}


export async function getUserData(username: string): Promise<null | UserData> {
    try {
        const response = await fastAPI.get('/user-data', { params: { username } })
        return response.data
    } catch (error) {
        console.log(error)
        return null
    }
}