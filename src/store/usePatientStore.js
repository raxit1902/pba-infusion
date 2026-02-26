import { create } from 'zustand';

/**
 * Global store for patient data
 */
const usePatientStore = create((set) => ({
	selectedMrn: '',

	// Actions
	setSelectedMrn: (mrn) => set({ selectedMrn: mrn }),

	// Clear store
	resetPatientStore: () => set({ selectedMrn: '' }),
}));

export default usePatientStore;
