import type {KzPassportData, RuPassportData, ByPassportData, ForeignPassportData} from './user_data';

export interface AuthorDocs {
    licenseOrAlienation: boolean,
    paymentType: 'royalty' | 'free' | 'sum' | 'other',
    paymentValue: string,
    passportType: 'ru' | 'kz' | 'by' | 'foreign',
    passport: RuPassportData | KzPassportData | ByPassportData | ForeignPassportData
}

export interface Author {
    fullName: string,
    data: AuthorDocs | string | undefined  
}

export interface AuthorForm {
    fullName: string,
    file: File | null,
    docs: AuthorDocs | null
}
