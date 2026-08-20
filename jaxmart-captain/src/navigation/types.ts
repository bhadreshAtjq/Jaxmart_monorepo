// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import { CompanySummary } from '../api/companyApi';

export type AuthStackParamList = {
  Login: undefined;
  OtpVerification: { phone: string; fullName?: string };
};

export type SellerWizardParamList = {
  SellerDraftsList: undefined;
  Step1BasicProfile: undefined;
  Step2StoreLocation: undefined;
  Step3IdentityKyc: undefined;
  Step4BankSettlement: undefined;
  Step5OperationsCategory: undefined;
  Step6LegalSignature: undefined;
  Step7ReviewSubmit: undefined;
};

export type SkuWizardParamList = {
  SkuDraftsList: undefined;
  CompanySelect: undefined;
  Step1BasicProduct: { companyId?: string; companyName?: string } | undefined;
  Step2BarcodeScanner: undefined;
  Step3PricingTaxesSlabs: undefined;
  Step4VariantsAttributes: undefined;
  Step5InventoryWarehouse: undefined;
  Step6PackagingDimensions: undefined;
  Step7MediaUpload: undefined;
  Step8ComplianceReviewSubmit: undefined;
  SkuSuccess: {
    skuId: string;
    productTitle: string;
    companyName: string;
    companyId: string;
  };
};

export type CompaniesStackParamList = {
  CompanyDirectory: undefined;
  CompanyDetail: { companyId: string };
};

export type MainTabParamList = {
  DashboardTab: undefined;
  CompaniesTab: NavigatorScreenParams<CompaniesStackParamList> | undefined;
  SkuWizardTab: NavigatorScreenParams<SkuWizardParamList> | undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  SellerWizard: NavigatorScreenParams<SellerWizardParamList> | undefined;
  SellerWizardTab: NavigatorScreenParams<SellerWizardParamList> | undefined;
  OnboardSellerTab: NavigatorScreenParams<SellerWizardParamList> | undefined;
  ShiftHistory: undefined;
  SettingsScreen: undefined;
  OfflineDrafts: undefined;
  SyncManager: undefined;
  SyncManagerModal: undefined;
};
