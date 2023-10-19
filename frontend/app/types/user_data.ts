interface BasePassportData {
    fullName: string;
    birthDate: string;
    number: string;
}

interface RuPassportData extends BasePassportData {
    issuedBy: string;
    issueDate: string;
    code: string;
    registrationDate: string;
}

interface KzPassportData extends BasePassportData {
    idNumber: string;
    issuedBy: string;
    issueDate: string;
    endDate: string;
    registrationAddress: string;
}

interface ByPassportData extends BasePassportData {
    issuedBy: string;
    issueDate: string;
    registrationAddress: string;
}

interface ForeignPassportData extends BasePassportData {
    citizenship: string;
    idNumber: string;
    issuedBy: string;
    issueDate: string;
    endDate: string;
    registrationAddress: string;
}


interface SelfEmployedLegalEntity {
    inn: string;
    bankName: string;
    checkingAccount: string;
    bik: string;
    correspondentAccount: string;
}

interface IndividualEntrepreneurLegalEntity {
    fullName: string;
    ogrnip: string;
    inn: string;
    registrationAddress: string;
    bankName: string;
    checkingAccount: string;
    bik: string;
    correspondentAccount: string;
    edoAvailability: string;
}

interface OooLegalEntity {
    entityName: string;
    directorFullName: string;
    ogrn: string;
    inn: string;
    kpp: string;
    legalAddress: string;
    actualAddress: string;
    bankName: string;
    checkingAccount: string;
    bik: string;
    correspondentAccount: string;
    edoAvailability: string;
    usnOrNds: boolean;
}

export interface UserData {
    currentPassport: 'ru' | 'kz' | 'by' | 'foreign';
    ruPassport: {
        data: RuPassportData;
        firstPageScanId: string;
        secondPageScanId: string;
    };
    kzPassport: {
        data: KzPassportData;
        firstPageScanId: string;
        secondPageScanId: string;
    };
    byPassport: {
        data: ByPassportData;
        firstPageScanId: string;
        secondPageScanId: string;
    };
    foreignPassport: {
        data: ForeignPassportData;
        firstPageScanId: string;
        secondPageScanId: string;
    };
    currentLegalEntity: 'self' | 'individual' | 'ooo';
    selfEmployedLegalEntity: SelfEmployedLegalEntity;
    individualEntrepreneurLegalEntity: IndividualEntrepreneurLegalEntity;
    oooLegalEntity: OooLegalEntity;
}

export type {KzPassportData, RuPassportData, ByPassportData, ForeignPassportData}