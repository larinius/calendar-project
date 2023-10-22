import axios from 'axios';
import moment from 'moment';

export class EventService {

    getEvents() {
        return axios.get('assets/demo/data/events.json')
            .then(res => res.data.data);
    }

    getEventsSF() {
        const queryUrl = `${process.env.REACT_APP_API_URL}`;
        return axios.get(queryUrl)
            .then(res => {
                const events = res.data.events.map(event => ({
                    ...event,
                    start: event.StartTime,
                    end: event.EndTime,
                    url: '',
                    allDay: event.IsAllDay,
                }));

                console.log(events);
                return events;
            })
            .catch(error => {
                console.error("API request failed:", error);
                throw error;
            });
    }
}
