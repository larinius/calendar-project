import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { buildCalendarEvents } from '../../../utils/eventsUtils';


const initialState = {
  data: [],
  events: [],
  status: 'idle',
  error: null,
};

export const fetchEvents = createAsyncThunk('calendar/fetchEvents', async () => {
  const url = `${process.env.REACT_APP_EVENTS_API_URL}`;
  const response = await axios.get(url);
  return response.data;
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';

        if (action.payload) {
          state.events = buildCalendarEvents(action.payload);
        }
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch data';
      });
  },
});

export default calendarSlice.reducer;

export const getEvents = () => async (dispatch) => {
  dispatch(fetchEvents());
};
