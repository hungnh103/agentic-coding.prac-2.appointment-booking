import type { TimeSlot } from "@/lib/availability/slot-generator";

type OccupiedSlot = {
  startTime: string;
};

type TimeOffBlock = {
  startTime: string;
  endTime: string;
};

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function filterAvailableSlots(slots: TimeSlot[], occupiedSlots: OccupiedSlot[], timeOffBlocks: TimeOffBlock[]) {
  return slots.filter((slot) => {
    if (occupiedSlots.some((occupied) => occupied.startTime === slot.startTime)) {
      return false;
    }

    const slotStart = minutes(slot.startTime);
    const slotEnd = minutes(slot.endTime);

    return !timeOffBlocks.some((block) => {
      const blockStart = minutes(block.startTime);
      const blockEnd = minutes(block.endTime);
      return slotStart < blockEnd && slotEnd > blockStart;
    });
  });
}

