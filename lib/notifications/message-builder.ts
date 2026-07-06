type MessageBuilderInput = {
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  patientName: string;
  referenceCode: string;
  cancellationReason?: string;
};

export function buildConfirmationMessage(input: MessageBuilderInput) {
  return {
    subject: `Appointment confirmed: ${input.doctorName}`,
    body: `Hello ${input.patientName}, your appointment ${input.referenceCode} with ${input.doctorName} is confirmed for ${input.appointmentDate} at ${input.startTime}.`
  };
}

export function buildReminderMessage(input: MessageBuilderInput) {
  return {
    subject: `Reminder: upcoming appointment ${input.referenceCode}`,
    body: `Reminder for ${input.patientName}: your appointment with ${input.doctorName} is on ${input.appointmentDate} at ${input.startTime}.`
  };
}

export function buildCancellationMessage(input: MessageBuilderInput) {
  return {
    subject: `Appointment canceled: ${input.doctorName}`,
    body: `Hello ${input.patientName}, your appointment ${input.referenceCode} with ${input.doctorName} has been canceled.${input.cancellationReason ? ` Reason: ${input.cancellationReason}.` : ""}`
  };
}

