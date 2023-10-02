import type { User } from "~/types/user";

import fastAPI from "./fastapi";

export async function verifyLogin(username: string, password: string): Promise<User | null> {
    return {
        id: '1',
        username: 'admin',
        isVerified: true,
        isAdmin: false
    }
    try {
        const response = await fastAPI.post('/login', { username, password })
        const accessToken = response.data['access_token']
        return accessToken
    } catch (error) {
        console.log(error)
        return null
    }
    // TODO: sync with backend
}

export async function getUserById(id: string): Promise<User | null> {
    return {
        id: '1',
        username: 'admin',
        isVerified: true,
        isAdmin: false
    }
    // TODO: sync with backend
}

export async function updateUserPassport(
    userId: number, 
    passportType: string, 
    passportData: Record<string, string>,
    passportFiles?: Record<string, File>
) {
    console.log('backend mock')
    console.log('userId', userId)
    console.log('passportType', passportType)
    console.log('passportData', passportData)
    // TODO: sync with backend
}

export async function updateUserLegalEntity(
    userId: number, 
    legalEntityType: string, 
    legalEntityData: Record<string, string>
) {
    console.log('backend mock')
    console.log('userId', userId)
    console.log('legalEntityType', legalEntityType)
    console.log('legalEntityData', legalEntityData)
    // TODO: sync with backend
}

