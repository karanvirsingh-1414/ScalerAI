import { addMinutes, format, isBefore } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const fromMinutes = (minutes: number) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
};

export const zonedDateTimeToUtc = (date: string, time: string, timezone: string) =>
  fromZonedTime(`${date}T${time}:00`, timezone);

export const utcToZonedTimeLabel = (value: Date, timezone: string) =>
  format(toZonedTime(value, timezone), "HH:mm");

export const isPastTime = (date: Date) => isBefore(date, new Date());

export const withDuration = (start: Date, minutes: number) => addMinutes(start, minutes);
