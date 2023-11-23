import type { User } from "~/types/user";

import fastAPI from "./fastapi";

export async function verifyLogin(username: string, password: string): Promise<User | null> {
    try {
        const response = await fastAPI.post('/user/login', { username, password })
        const user = response.data
        return user
    } catch (error) {
        console.log(error)
        return null
    }
}

export async function getUserByUsername(username: string): Promise<User | null> {
    try {
        const response = await fastAPI.get(`/user`, {params: {username}})
        const user = response.data
        return user
    } catch (error) {
        console.log(error)
        return null
    }
}

export async function getAllUsers(): Promise<User[] | null> {
    try {
        const response = await fastAPI.get('/users')
        const users = response.data
        return users
    } catch (error) {
        console.log(error)
        return null
    }
}

export async function addUser(username: string, nickname: string , password: string): Promise<string | null> {
    try {
        const response = await fastAPI.post('/user', { username, nickname, password })
        const newUsername = response.data
        return newUsername
    } catch (error) {
        return null
    }
}

export async function deleteUser(username: string): Promise<string | null> {
    try {
        const response = await fastAPI.delete('/user', { params: { username } })
        const deletedCount = response.data
        return deletedCount
    } catch (error) {
        return null
    }
}


export async function changeLinkUploadPermission(username: string) {
    try {
        await fastAPI.put(`/user/link-permission?username=${username}`)
    } catch (error) {
        console.log(error)
    }
}


export async function changePassword(username: string, password: string) {
    try {
        await fastAPI.post(`/user/password`, { username, password })
    } catch (error) {
        console.log(error)
    }
}

