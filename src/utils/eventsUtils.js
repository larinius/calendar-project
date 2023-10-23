export function buildCalendarEvents(payload) {

    if (!Array.isArray(payload.events)) {
        return [];
    }

    const modifiedEvents = payload.events.map((event, index) => {
        return {
            Id: index + 1,
            Subject: event.title,
            StartTime: event.StartTimeUTC,
            EndTime: event.EndTimeUTC,
            Location: '',
            Description: 'Event Scheduled',
            IsAllDay: event.IsAllDay,
            IsReadonly: event.editable,
            CalendarId: 1,
            RecurrenceRule: event.RecurrenceRule || null,
        };
    });

    return modifiedEvents;
}