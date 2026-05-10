/**
 * FHIR Utility Service
 * Integrates with HAPI FHIR or provides synthetic data
 */

export async function fetchFHIRPatientData(patientId: string) {
  // In a real app, this would call a FHIR server
  // For demo, we return realistic synthetic data based on the ID
  
  if (patientId === "pat-001") {
    return {
      resourceType: "Bundle",
      entry: [
        {
          resource: {
            resourceType: "Patient",
            id: "pat-001",
            name: [{ family: "Jameson", given: ["Robert"] }],
            birthDate: "1958-04-12",
            gender: "male"
          }
        },
        {
          resource: {
            resourceType: "Condition",
            code: { text: "Congestive Heart Failure" },
            clinicalStatus: { coding: [{ code: "active" }] }
          }
        },
        {
          resource: {
            resourceType: "MedicationRequest",
            medicationCodeableConcept: { text: "Lisinopril 10mg" },
            dosageInstruction: [{ text: "Once daily" }]
          }
        },
        {
          resource: {
            resourceType: "MedicationRequest",
            medicationCodeableConcept: { text: "Furosemide 20mg" },
            dosageInstruction: [{ text: "Every morning" }]
          }
        },
        {
          resource: {
            resourceType: "Observation",
            code: { text: "Body weight" },
            valueQuantity: { value: 92, unit: "kg" },
            effectiveDateTime: "2026-05-09T08:00:00Z"
          }
        }
      ]
    };
  }
  
  // Default fallback
  return { resourceType: "Bundle", entry: [] };
}

export function parseFHIRBundle(bundle: any) {
  const patient = bundle.entry?.find((e: any) => e.resource.resourceType === "Patient")?.resource;
  const conditions = bundle.entry?.filter((e: any) => e.resource.resourceType === "Condition").map((e: any) => e.resource);
  const medications = bundle.entry?.filter((e: any) => e.resource.resourceType === "MedicationRequest").map((e: any) => e.resource);
  const observations = bundle.entry?.filter((e: any) => e.resource.resourceType === "Observation").map((e: any) => e.resource);
  
  return { patient, conditions, medications, observations };
}
