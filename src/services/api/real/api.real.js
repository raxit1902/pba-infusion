import axios from 'axios';
import { API_CONFIG } from '../config';
import { CLINICAL_APPROPRIATENESS, PATIENT_DETAILS } from '../endpoints';

const apiClient = axios.create({
	baseURL: API_CONFIG.baseURL,
});

export const apiReal = {
	getPatientDetails: async (mrn) => {
		console.log('[Real] Fetching patient details...');
		const response = await apiClient.get(PATIENT_DETAILS(mrn));
		return response.data;
	},
	getClinicalAppropriateness: async (mrn) => {
		console.log('[Real] Fetching clinical appropriateness...');
		const response = await apiClient.get(CLINICAL_APPROPRIATENESS(mrn));
		return response.data;
	},
};
