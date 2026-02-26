import { patientDetailsMockData } from './mockResponses/patientDetailsMockData';

export const apiMock = {
	getPatientDetails: async (mrn) => {
		console.log('[Mock] Fetching patient details...');
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(patientDetailsMockData);
			}, 800);
		});
	},
	getClinicalAppropriateness: async (mrn) => {
		console.log('[Mock] Fetching clinical appropriateness...');
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(patientDetailsMockData);
			}, 800);
		});
	},
};
