from typing import Literal
from pydantic import BaseModel
from pydantic.alias_generators import to_camel


class CamelCaseModel(BaseModel):
    class Config:
        alias_generator = to_camel


class BasePassportData(CamelCaseModel):
    full_name: str 
    birth_date: str
    number: str


class BasePassport(CamelCaseModel):
    first_page_scan_id: str
    second_page_scan_id: str


class RuPassportData(BasePassportData):
    issued_by: str 
    issue_date: str
    code: str
    registration_date: str


class KzPassportData(BasePassportData):
    id_number: str
    issued_by: str
    issue_date: str
    end_date: str


class ByPassportData(BasePassportData):
    issued_by: str 
    issue_date: str
    registration_address: str


class ForeignPassportData(BasePassportData):
    citizenship: str
    id_number: str 
    issued_by: str 
    issue_date: str
    end_date: str
    registration_address: str


class RuPassport(BasePassport):
    data: RuPassportData


class KzPassport(BasePassport):
    data: KzPassportData


class ByPassport(BasePassport):
    data: ByPassportData


class ForeignPassport(BasePassport):
    data: ForeignPassportData


class SelfEmployedLegalEntity(CamelCaseModel):
    inn: str
    bank_name: str 
    checking_account: str
    bik: str
    correspondent_account: str


class IndividualEntrepreneurLegalEntity(CamelCaseModel):
    full_name: str 
    ogrnip: str
    inn: str
    registration_address: str
    bank_name: str 
    checking_account: str
    bik: str
    correspondent_account: str
    edo_availability: str


class OooLegalEntity(CamelCaseModel):
    entity_name: str
    director_full_name: str
    ogrn: str
    inn: str
    kpp: str
    legal_address: str
    actual_address: str
    bank_name: str 
    checking_account: str
    bik: str
    correspondent_account: str
    edo_availability: str
    usn_or_nds: bool


class UserData(CamelCaseModel):
    current_passport: Literal['ru', 'kz', 'by', 'foreign']
    current_legal_entity: Literal['self', 'individual', 'ooo']
    ru_passport: RuPassport
    kz_passport: KzPassport
    by_passport: ByPassport
    foreign_passport: ForeignPassport
    self_employed_legal_entity: SelfEmployedLegalEntity
    individual_entrepreneur_legal_entity: IndividualEntrepreneurLegalEntity
    ooo_legal_entity: OooLegalEntity

initial_user_data = UserData(
    currentPassport='ru',
    currentLegalEntity='self',
    ruPassport=RuPassport(
        firstPageScanId='',
        secondPageScanId='',
        data=RuPassportData(
            fullName='',
            birthDate='',
            number='',
            issuedBy='',
            issueDate='',
            code='',
            registrationDate='',
            first_page_scan_id='',
            second_page_scan_id=''
        ),
    ),
    kzPassport=KzPassport(
        firstPageScanId='',
        secondPageScanId='',
        data=KzPassportData(
            fullName='',
            birthDate='',
            number='',
            idNumber='',
            issuedBy='',
            issueDate='',
            endDate='',
            first_page_scan_id='',
            second_page_scan_id=''
        ),
    ),
    byPassport=ByPassport(
        firstPageScanId='',
        secondPageScanId='',
        data=ByPassportData(
            fullName='',
            birthDate='',
            number='',
            issuedBy='',
            issueDate='',
            registrationAddress='',
            first_page_scan_id='',
            second_page_scan_id=''
        ),
    ),
    foreignPassport=ForeignPassport(
        firstPageScanId='',
        secondPageScanId='',
        data=ForeignPassportData(
            fullName='',
            citizenship='',
            birthDate='',
            number='',
            idNumber='',
            issuedBy='',
            issueDate='',
            endDate='',
            registrationAddress='',
            first_page_scan_id='',
            second_page_scan_id=''
        ),
    ),
    selfEmployedLegalEntity=SelfEmployedLegalEntity(
        inn='',
        bankName='',
        checkingAccount='',
        bik='',
        correspondentAccount=''
    ),
    individualEntrepreneurLegalEntity=IndividualEntrepreneurLegalEntity(
        fullName='',
        ogrnip='',
        inn='',
        registrationAddress='',
        bankName='',
        checkingAccount='',
        bik='',
        correspondentAccount='',
        edoAvailability=''
    ),
    oooLegalEntity=OooLegalEntity(
        entityName='',
        directorFullName='',
        ogrn='',
        inn='',
        kpp='',
        legalAddress='',
        actualAddress='',
        bankName='',
        checkingAccount='',
        bik='',
        correspondentAccount='',
        edoAvailability='',
        usnOrNds=True
    )
)
