export const PATIENT_DETAILS = (mrn) => `/patient/${mrn}/details`;
export const CLINICAL_APPROPRIATENESS = (mrn) =>
  `/patient/${mrn}/clinical-appropriateness`;
export const PAYOR_RESTRICTIONS = (mrn) => `/patient/${mrn}/payor-restrictions`;
export const GRAM_COMMITMENT = () => `/patient/gram-commitment`;
export const MARGIN_DATA = (mrn) => `/patient/${mrn}/margin-data`;
export const COST_CALCULATOR_DATA = (mrn) =>
  `/patient/${mrn}/cost-calculator-data`;
export const NURSING_COST_DATA = (mrn) => `/patient/${mrn}/nursing-cost-data`;
export const PAYOR_INFO = (mrn) => `/patient/${mrn}/payor-info`;
export const PROVIDER_PROFITABILITY = (mrn) =>
  `/patient/${mrn}/provider-profitability`;
export const FINANCIAL_ASSISTANCE = (mrn) =>
  `/patient/${mrn}/financial-assistance`;
