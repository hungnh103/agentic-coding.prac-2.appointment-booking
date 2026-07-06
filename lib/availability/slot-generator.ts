export type TimeSlot = {
  startTime: string;
  endTime: string;
};

const SLOT_MINUTES = 30;

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function generateSlots(startTime: string, endTime: string): TimeSlot[] {
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  const slots: TimeSlot[] = [];

  for (let current = startMinutes; current + SLOT_MINUTES <= endMinutes; current += SLOT_MINUTES) {
    slots.push({
      startTime: toTime(current),
      endTime: toTime(current + SLOT_MINUTES)
    });
  }

  return slots;
}

