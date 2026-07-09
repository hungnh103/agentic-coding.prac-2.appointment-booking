import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/http/api-error";
import { assertValidAppointmentTransition } from "@/lib/appointments/appointment-status-service";

describe("appointment status transitions", () => {
  it("allows pending appointments to be confirmed or canceled", () => {
    expect(() => assertValidAppointmentTransition("pending", "confirmed")).not.toThrow();
    expect(() => assertValidAppointmentTransition("pending", "canceled")).not.toThrow();
  });

  it("allows confirmed appointments to be canceled", () => {
    expect(() => assertValidAppointmentTransition("confirmed", "canceled")).not.toThrow();
  });

  it("rejects invalid transitions from canceled or already confirmed states", () => {
    expect(() => assertValidAppointmentTransition("canceled", "confirmed")).toThrowError(ApiError);
    expect(() => assertValidAppointmentTransition("confirmed", "confirmed")).toThrowError(ApiError);
  });
});
