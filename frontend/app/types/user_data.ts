interface BasePassportData {
    fullName: string;
    birthDate: string;
    number: string;
}

interface RuPassportData extends BasePassportData {
    issuedBy: string;
    issueDate: string;
    code: string;
    registrationAddress: string;
    snils: string;
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

interface ForeignLegalEntity {
    entityName: string;
    directorFullName: string;
    legalAddress: string;
    registrationDate: string;
    registrationNumber: string;
    bankName: string;
    bik: string;
    accountNumber: string;
    correspondentBankName: string;
    correspondentBankInn: string;
    correspondentBankBik: string;
    rublesAccount: string;
    correspondentAccount: string;
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
    currentLegalEntity: 'self' | 'individual' | 'ooo' | 'foreign';
    email: string;
    socials: string;
    selfEmployedLegalEntity: SelfEmployedLegalEntity;
    individualEntrepreneurLegalEntity: IndividualEntrepreneurLegalEntity;
    oooLegalEntity: OooLegalEntity;
    foreignLegalEntity: ForeignLegalEntity;
}

export type { KzPassportData, RuPassportData, ByPassportData, ForeignPassportData }