import axios from "axios";
import { API_CONFIG } from "./config";
import {
  CLINICAL_APPROPRIATENESS,
  PATIENT_DETAILS,
  GRAM_COMMITMENT,
  PAYOR_RESTRICTIONS,
  MARGIN_DATA,
  COST_CALCULATOR_DATA,
  NURSING_COST_DATA,
  PAYOR_INFO,
  PROVIDER_PROFITABILITY,
  FINANCIAL_ASSISTANCE,
} from "./endpoints";
import { gramCommitmentMockData } from "./mockResponses/gramCommitmentMockData";
import { patientDetailsMockData } from "./mockResponses/patientDetailsMockData";
import { payorInfoMockData } from "./mockResponses/payorInfoMockData";
import { payorRestrictionsMockData } from "./mockResponses/payorRestrictions";
import { marginMockData } from "./mockResponses/marginMockData";
import { payorCostMockData } from "./mockResponses/payorCostMockData";
import { nursingCostMockData } from "./mockResponses/nursingCostMockData";
import { clinicalAppropriatenessMockData } from "./mockResponses/clinicalAppropriateness";
import { providerProfitabilityMockData } from "./mockResponses/providerProfitabilityMockData";
import { financialAssistanceMockData } from "./mockResponses/financialAssistanceMockResponse";

const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
});

const handleRequest = async (label, realFn, mockData) => {
  if (API_CONFIG.testMode) {
    console.log(`[Mock] Fetching ${label}...`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 800);
    });
  }

  console.log(`[Real] Fetching ${label}...`);
  try {
    const response = await realFn();
    return response.data;
  } catch (error) {
    console.error(`[Real] Error fetching ${label}:`, error);
    throw error;
  }
};

export const apiService = {
  getPatientDetails: (mrn) =>
    handleRequest(
      "patient details",
      () => apiClient.get(PATIENT_DETAILS(mrn)),
      patientDetailsMockData[mrn] || patientDetailsMockData[1056974],
    ),

  getClinicalAppropriateness: (mrn) =>
    handleRequest(
      "clinical appropriateness",
      () => apiClient.get(CLINICAL_APPROPRIATENESS(mrn)),
      clinicalAppropriatenessMockData[mrn] ||
        clinicalAppropriatenessMockData[1056974],
    ),

  getPayorRestrictions: (mrn) =>
    handleRequest(
      "payor restrictions",
      () => apiClient.get(PAYOR_RESTRICTIONS(mrn)),
      payorRestrictionsMockData[mrn] || payorRestrictionsMockData[1056974],
    ),

  getGramCommitment: (mrn) =>
    handleRequest(
      "gram commitment",
      () => apiClient.get(GRAM_COMMITMENT(mrn)),
      gramCommitmentMockData[mrn] || gramCommitmentMockData[1056974],
    ),
  getMarginData: (mrn) =>
    handleRequest(
      "margin data",
      () => apiClient.get(MARGIN_DATA(mrn)),
      marginMockData[mrn] || marginMockData[1056974],
    ),
  getPayorCostData: (mrn) =>
    handleRequest(
      "payor cost data",
      () => apiClient.get(COST_CALCULATOR_DATA(mrn)),
      payorCostMockData[mrn] || payorCostMockData[1056974],
    ),
  getNursingCostData: (mrn) =>
    handleRequest(
      "nursing cost data",
      () => apiClient.get(NURSING_COST_DATA(mrn)),
      nursingCostMockData[mrn] || nursingCostMockData[1056974],
    ),
  getPayorInfo: (mrn) =>
    handleRequest(
      "payor info",
      () => apiClient.get(PAYOR_INFO(mrn)),
      payorInfoMockData[mrn] || payorInfoMockData[1056974],
    ),
  getProviderProfitability: (mrn) =>
    handleRequest(
      "provider profitability",
      () => apiClient.get(PROVIDER_PROFITABILITY(mrn)),
      providerProfitabilityMockData[mrn] ||
        providerProfitabilityMockData[1056974],
    ),
  getFinancialAssistanceData: (mrn) =>
    handleRequest(
      "financial assistance",
      () => apiClient.get(FINANCIAL_ASSISTANCE(mrn)),
      financialAssistanceMockData[mrn] || financialAssistanceMockData[1056974],
    ),
};

export default apiService;
