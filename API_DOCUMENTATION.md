# API Documentation

## Meetings API

### Get Booked Slots by Date

**Endpoint:** `GET /api/meetings/booked-slots/:date`

**Description:** Retrieves booked time slots for a specific date, with optional timezone conversion.

**Parameters:**

- `date` (path parameter, required): Date in YYYY-MM-DD format
- `timezone` (query parameter, optional): Client's timezone (e.g., "America/New_York", "Europe/London")

**Examples:**

1. **Get booked slots for Bulgarian timezone (default):**

   ```
   GET /api/meetings/booked-slots/2025-09-29
   ```

2. **Get booked slots for New York timezone:**

   ```
   GET /api/meetings/booked-slots/2025-09-29?timezone=America/New_York
   ```

3. **Get booked slots for London timezone:**
   ```
   GET /api/meetings/booked-slots/2025-09-29?timezone=Europe/London
   ```

**Response Format:**

```json
{
  "date": "2025-09-29",
  "timezone": "America/New_York",
  "bookedSlots": ["09:00", "14:00", "16:30"]
}
```

**Timezone Conversion Logic:**

When a timezone is provided, the API:

1. Converts the client's date to Bulgarian timezone to find the corresponding day
2. Searches for meetings that fall within the client's day in Bulgarian time
3. Converts the booked slots back to the client's timezone for display

**Example Conversion:**

- Client requests: `2025-09-29` in `America/New_York` timezone
- NY 6:00 PM on 2025-09-29 = Bulgaria 1:00 AM on 2025-09-30
- API checks for meetings on 2025-09-30 at 01:00 in Bulgarian time
- Returns the time in NY timezone format

**Error Responses:**

- `400 Bad Request`: Invalid date format or timezone
- `500 Internal Server Error`: Server error

**Supported Timezones:**
Any valid IANA timezone identifier (e.g., "America/New_York", "Europe/London", "Asia/Tokyo", etc.)

