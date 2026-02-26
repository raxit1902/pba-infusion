export const marginMockData = {
  1056974: {
    preferredDrugTable: [
      { category: "PreferSCIG3", drug: "Hyqvia" },
      { category: "PreferSCIG", drug: "Cuvitru" },
      { category: "PreferIVIG4", drug: "Gammaplex 10%" },
      { category: "PreferIVIG", drug: "Gammaked" },
      { category: "PreferSCIG2", drug: "Xembify" },
    ],
    dxCode: "",
    financialAssistanceTable: [
      { drug: "Xembify", maxAssistance: 50000 },
      { drug: "Hyqvia", maxAssistance: 50000 },
      { drug: "Gammaked", maxAssistance: 2500 },
    ],
    drugPricingTable: [
      { name: "Drug A", expected: 12000, cost: 8000, profit: 4000, gm: 33.3 },
      { name: "Drug B", expected: 15000, cost: 9500, profit: 5500, gm: 36.7 },
    ],
    drugCostTable: {
      grams: 30,
      expected: 5000,
      cost: 3500,
      profit: 1500,
    },
    nursingCostTable: {
      patientState: "Illinois",
      therapyType: "IVIG",
      expectedVisitDuration: 4,
      nurseHomeState: "Illinois",
      travelTime: 60,
      estimatedCostToServe: 450,
    },
    finalNursingTable: [
      { label: "99601 Quantity", expected: 1, cost: 150, profit: 50 },
      { label: "99602 Hours", expected: 3, cost: 300, profit: 100 },
    ],
    perDiemTable: {
      quantity: 1,
      expected: 200,
      cost: 120,
      profit: 80,
      margin: 40,
    },
    providerProfitability: {
      npi: "",
      comments: "",
      signOff: "",
    },
  },
  1057340: {
    preferredDrugTable: [
      { category: "PreferSCIG3", drug: "Hyqvia" },
      { category: "PreferSCIG", drug: "Hizentra" },
      { category: "PreferIVIG4", drug: "Privigen" },
      { category: "PreferIVIG", drug: "Gamunex-C" },
      { category: "PreferSCIG2", drug: "Xembify" },
    ],
    dxCode: "D83.9",
    financialAssistanceTable: [
      { drug: "Xembify", maxAssistance: 45000 },
      { drug: "Hizentra", maxAssistance: 40000 },
      { drug: "Gamunex-C", maxAssistance: 15000 },
    ],
    drugPricingTable: [
      { name: "Drug A", expected: 14000, cost: 9000, profit: 5000, gm: 35.7 },
      { name: "Drug B", expected: 18000, cost: 11000, profit: 7000, gm: 38.9 },
    ],
    drugCostTable: {
      grams: 40,
      expected: 7000,
      cost: 4500,
      profit: 2500,
    },
    nursingCostTable: {
      patientState: "Mississippi",
      therapyType: "IVIG",
      expectedVisitDuration: 5,
      nurseHomeState: "Mississippi",
      travelTime: 90,
      estimatedCostToServe: 600,
    },
    finalNursingTable: [
      { label: "99601 Quantity", expected: 1, cost: 180, profit: 60 },
      { label: "99602 Hours", expected: 4, cost: 400, profit: 140 },
    ],
    perDiemTable: {
      quantity: 1,
      expected: 250,
      cost: 150,
      profit: 100,
      margin: 50,
    },
    providerProfitability: {
      npi: "1053519512",
      comments: "Trailing 6 months look good.",
      signOff: "Dr. Hassett",
    },
  },
};
