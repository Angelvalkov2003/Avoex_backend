// Convert client time to Bulgarian timezone and return separate date and time
export function convertToBulgarianTime(dateTimeString, clientTimezone) {
  if (!dateTimeString || !clientTimezone) return { bgDate: "", bgTime: "" };

  // Create a date object from the client's timezone
  const date = new Date(dateTimeString);

  // Convert to Bulgarian timezone
  const bulgarianTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const year = bulgarianTime.find((part) => part.type === "year").value;
  const month = bulgarianTime.find((part) => part.type === "month").value;
  const day = bulgarianTime.find((part) => part.type === "day").value;
  const hour = bulgarianTime.find((part) => part.type === "hour").value;
  const minute = bulgarianTime.find((part) => part.type === "minute").value;

  return {
    bgDate: `${year}-${month}-${day}`,
    bgTime: `${hour}:${minute}`,
  };
}

// Convert Bulgarian time to client's timezone and return separate date and time
export function convertFromBulgarianTime(bgDate, bgTime, clientTimezone) {
  if (!bgDate || !bgTime || !clientTimezone)
    return { clientDate: "", clientTime: "" };

  // Create a date object from the Bulgarian time
  const [year, month, day] = bgDate.split("-").map(Number);
  const [hour, minute] = bgTime.split(":").map(Number);

  // Create a date object in Sofia timezone
  const sofiaDate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Get the timezone offset for Sofia at this specific date
  const sofiaOffset = new Intl.DateTimeFormat("en", {
    timeZone: "Europe/Sofia",
    timeZoneName: "longOffset",
  }).formatToParts(sofiaDate);

  // Extract the offset from the timezone name
  const offsetString =
    sofiaOffset.find((p) => p.type === "timeZoneName")?.value || "+02:00";
  const offsetMatch = offsetString.match(/([+-])(\d{2}):(\d{2})/);

  if (!offsetMatch) {
    console.error("Could not parse Sofia timezone offset");
    return { clientDate: "", clientTime: "" };
  }

  const [, sign, offsetHours, offsetMinutes] = offsetMatch;
  const totalOffsetMs =
    (parseInt(offsetHours) * 60 + parseInt(offsetMinutes)) * 60 * 1000;
  const sofiaOffsetMs = sign === "+" ? totalOffsetMs : -totalOffsetMs;

  // Adjust the date to represent the correct UTC time
  const adjustedDate = new Date(sofiaDate.getTime() - sofiaOffsetMs);

  // Convert to client's timezone
  const clientTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: clientTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(adjustedDate);

  const resultYear = clientTime.find((part) => part.type === "year").value;
  const resultMonth = clientTime.find((part) => part.type === "month").value;
  const resultDay = clientTime.find((part) => part.type === "day").value;
  const resultHour = clientTime.find((part) => part.type === "hour").value;
  const resultMinute = clientTime.find((part) => part.type === "minute").value;

  const result = {
    clientDate: `${resultYear}-${resultMonth}-${resultDay}`,
    clientTime: `${resultHour}:${resultMinute}`,
  };

  return result;
}

// Convert client time to Bulgarian time for checking availability
export function convertClientTimeToBulgarian(
  clientDate,
  clientTime,
  clientTimezone
) {
  if (!clientDate || !clientTime || !clientTimezone)
    return { bgDate: "", bgTime: "" };

  // Create a date string in the client's timezone
  const clientDateTimeString = `${clientDate}T${clientTime}`;

  // Create a date object - this will be interpreted in the client's timezone
  const date = new Date(clientDateTimeString);

  // Convert to Bulgarian timezone
  const bulgarianTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const year = bulgarianTime.find((part) => part.type === "year").value;
  const month = bulgarianTime.find((part) => part.type === "month").value;
  const day = bulgarianTime.find((part) => part.type === "day").value;
  const hour = bulgarianTime.find((part) => part.type === "hour").value;
  const minute = bulgarianTime.find((part) => part.type === "minute").value;

  return {
    bgDate: `${year}-${month}-${day}`,
    bgTime: `${hour}:${minute}`,
  };
}

// Validate timezone string
export function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}
