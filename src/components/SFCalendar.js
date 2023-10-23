import "./SFCalendar.css";

import React from 'react';
import { Internationalization, closest, isNullOrUndefined, remove, removeClass } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { ContextMenuComponent, ItemDirective, ItemsDirective, ToolbarComponent } from '@syncfusion/ej2-react-navigations';
import { Agenda, Day, DragAndDrop, ExcelExport, ICalendarExport, ICalendarImport, Inject, Month, Print, Resize, ResourceDirective, ResourcesDirective, ScheduleComponent, TimelineMonth, TimelineViews, TimelineYear, ViewDirective, ViewsDirective, Week, WorkWeek, Year } from '@syncfusion/ej2-react-schedule';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents } from "../redux/features/calendar/calendarSlice";


const SFCalendar = () => {

    const dispatch = useDispatch();
    const status = useSelector((state) => state.calendar.status);
    const eventsData = useSelector((state) => state.calendar.events);

    const [currentView, setCurrentView] = useState('Month');
    const [isTimelineView, setIsTimelineView] = useState(false);
    const [defaultDate, setDefaultDate] = useState(new Date('2021-01-01T00:00:00'));

    let scheduleObj = useRef(null);
    let contextMenuObj = useRef(null);

    let selectedTarget;
    let intl = new Internationalization();

    useEffect(() => {
        if (status === 'idle') {
            dispatch(getEvents());
        }
    }, [dispatch, status]);

    let generateEvents = () => {
        let eventData = [];

        eventData = eventsData.map((event, index) => ({
            Id: index + 1,
            Subject: event.Subject || 'Default Event',
            StartTime: event.StartTime || new Date(),
            EndTime: event.EndTime || new Date(),
            Location: event.Location || '',
            Description: event.Description || 'Event Scheduled',
            RecurrenceRule: event.RecurrenceRule || null,
            IsAllDay: event.IsAllDay || false,
            IsReadonly: false,
            CalendarId: event.CalendarId || 1,
        }));

        return eventData;
    };

    const contextMenuItems = [
        { text: 'New Event', iconCss: 'e-icons e-plus', id: 'Add' },
        { text: 'New Recurring Event', iconCss: 'e-icons e-repeat', id: 'AddRecurrence' },
        { text: 'Today', iconCss: 'e-icons e-timeline-today', id: 'Today' },
        { text: 'Edit Event', iconCss: 'e-icons e-edit', id: 'Save' },
        { text: 'Delete Event', iconCss: 'e-icons e-trash', id: 'Delete' },
        {
            text: 'Delete Event', id: 'DeleteRecurrenceEvent', iconCss: 'e-icons e-trash',
            items: [
                { text: 'Delete Occurrence', id: 'DeleteOccurrence' },
                { text: 'Delete Series', id: 'DeleteSeries' }
            ]
        },
        {
            text: 'Edit Event', id: 'EditRecurrenceEvent', iconCss: 'e-icons e-edit',
            items: [
                { text: 'Edit Occurrence', id: 'EditOccurrence' },
                { text: 'Edit Series', id: 'EditSeries' }
            ]
        }
    ];

    const calendarCollections = [
        { CalendarText: 'Calendar', CalendarId: 1, CalendarColor: '#c43081' },
    ];

    const onToolbarItemClicked = (args) => {
        switch (args.item.text) {
            case 'Day':
                setCurrentView(isTimelineView ? 'TimelineDay' : 'Day');
                break;
            case 'Week':
                setCurrentView(isTimelineView ? 'TimelineWeek' : 'Week');
                break;
            case 'Month':
                setCurrentView(isTimelineView ? 'TimelineMonth' : 'Month');
                break;
            default:
                break;
        }
    };

    const getDateHeaderDay = (value) => {
        return intl.formatDate(value, { skeleton: 'E' });
    };

    const getDateHeaderDate = (value) => {
        return intl.formatDate(value, { skeleton: 'd' });
    };

    const dateHeaderTemplate = (props) => {
        return (<Fragment>
            <div>{getDateHeaderDay(props.date)}</div>
            <div>{getDateHeaderDate(props.date)}</div>
        </Fragment>);
    };

    const contextMenuOpen = (args) => {
        let newEventElement = document.querySelector('.e-new-event');
        if (newEventElement) {
            remove(newEventElement);
            removeClass([document.querySelector('.e-selected-cell')], 'e-selected-cell');
        }
        scheduleObj.current.closeQuickInfoPopup();
        let targetElement = args.event.target;
        if (closest(targetElement, '.e-contextmenu')) {
            return;
        }
        selectedTarget = closest(targetElement, '.e-appointment,.e-work-cells,.e-vertical-view .e-date-header-wrap .e-all-day-cells,.e-vertical-view .e-date-header-wrap .e-header-cells');
        if (isNullOrUndefined(selectedTarget)) {
            args.cancel = true;
            return;
        }
        if (selectedTarget.classList.contains('e-appointment')) {
            let eventObj = scheduleObj.current.getEventDetails(selectedTarget);
            if (eventObj.RecurrenceRule) {
                contextMenuObj.current.showItems(['EditRecurrenceEvent', 'DeleteRecurrenceEvent'], true);
                contextMenuObj.current.hideItems(['Add', 'AddRecurrence', 'Today', 'Save', 'Delete'], true);
            }
            else {
                contextMenuObj.current.showItems(['Save', 'Delete'], true);
                contextMenuObj.current.hideItems(['Add', 'AddRecurrence', 'Today', 'EditRecurrenceEvent', 'DeleteRecurrenceEvent'], true);
            }
            return;
        }
        else if ((selectedTarget.classList.contains('e-work-cells') || selectedTarget.classList.contains('e-all-day-cells')) &&
            !selectedTarget.classList.contains('e-selected-cell')) {
            removeClass([].slice.call(scheduleObj.current.element.querySelectorAll('.e-selected-cell')), 'e-selected-cell');
            selectedTarget.setAttribute('aria-selected', 'true');
            selectedTarget.classList.add('e-selected-cell');
        }
        contextMenuObj.current.hideItems(['Save', 'Delete', 'EditRecurrenceEvent', 'DeleteRecurrenceEvent'], true);
        contextMenuObj.current.showItems(['Add', 'AddRecurrence', 'Today'], true);
    };

    const contextMenuSelect = (args) => {
        let selectedMenuItem = args.item.id;
        let eventObj = {};
        if (selectedTarget && selectedTarget.classList.contains('e-appointment')) {
            eventObj = scheduleObj.current.getEventDetails(selectedTarget);
        }
        switch (selectedMenuItem) {
            case 'Today':
                scheduleObj.current.selectedDate = new Date();
                break;
            case 'Add':
            case 'AddRecurrence':
                let selectedCells = scheduleObj.current.getSelectedElements();
                let activeCellsData = scheduleObj.current.getCellDetails(selectedCells.length > 0 ? selectedCells : selectedTarget);
                if (selectedMenuItem === 'Add') {
                    scheduleObj.current.openEditor(activeCellsData, 'Add');
                }
                else {
                    scheduleObj.current.openEditor(activeCellsData, 'Add', false, 1);
                }
                break;
            case 'Save':
            case 'EditOccurrence':
            case 'EditSeries':
                if (selectedMenuItem === 'EditSeries') {
                    let query = new Query().where(scheduleObj.current.eventFields.id, 'equal', eventObj.RecurrenceID);
                    eventObj = new DataManager(scheduleObj.current.eventsData).executeLocal(query)[0];
                }
                scheduleObj.current.openEditor(eventObj, selectedMenuItem);
                break;
            case 'Delete':
                scheduleObj.current.deleteEvent(eventObj);
                break;
            case 'DeleteOccurrence':
            case 'DeleteSeries':
                scheduleObj.current.deleteEvent(eventObj, selectedMenuItem);
                break;
            default:
                break;
        }
    };

    return (<div className='schedule-control-section'>
        <div className='col-lg-12 control-section'>
            <div className='content-wrapper'>
                <div className='schedule-overview'>

                    <ToolbarComponent id='toolbarOptions'
                        cssClass='overview-toolbar'
                        width='100%'
                        height={70}
                        overflowMode='Scrollable'
                        scrollStep={100}
                        clicked={onToolbarItemClicked}>
                        <ItemsDirective>

                            <ItemDirective prefixIcon='e-icons e-day' tooltipText='Day' text='Day' tabIndex={0} />
                            <ItemDirective prefixIcon='e-icons e-week' tooltipText='Week' text='Week' tabIndex={0} />
                            <ItemDirective prefixIcon='e-icons e-month' tooltipText='Month' text='Month' tabIndex={0} />

                        </ItemsDirective>
                    </ToolbarComponent>

                    <div className='overview-content'>
                        <div className='left-panel'>
                            <div className='overview-scheduler'>
                                <ScheduleComponent id='scheduler'
                                    cssClass='schedule-overview'
                                    ref={scheduleObj}
                                    width='100%' height='100%'
                                    currentView={currentView}
                                    group={{ resources: ['Calendars'] }}
                                    timezone='UTC'
                                    eventSettings={{ dataSource: generateEvents() }}
                                    dateHeaderTemplate={dateHeaderTemplate}
                                    selectedDate={defaultDate}
                                >
                                    <ResourcesDirective>
                                        <ResourceDirective field='CalendarId' title='Calendars' name='Calendars' dataSource={calendarCollections} query={new Query().where('CalendarId', 'equal', 1)} textField='CalendarText' idField='CalendarId' colorField='CalendarColor' />
                                    </ResourcesDirective>
                                    <ViewsDirective>
                                        <ViewDirective option='Day' />
                                        <ViewDirective option='Week' />
                                        <ViewDirective option='WorkWeek' />
                                        <ViewDirective option='Month' />
                                        <ViewDirective option='Year' />
                                        <ViewDirective option='Agenda' />
                                        <ViewDirective option='TimelineDay' />
                                        <ViewDirective option='TimelineWeek' />
                                        <ViewDirective option='TimelineWorkWeek' />
                                        <ViewDirective option='TimelineMonth' />
                                        <ViewDirective option='TimelineYear' />
                                    </ViewsDirective>
                                    <Inject services={[Day, Week, WorkWeek, Month, Year, Agenda, TimelineViews, TimelineMonth, TimelineYear, DragAndDrop, Resize, Print, ExcelExport, ICalendarImport, ICalendarExport]} />
                                </ScheduleComponent>
                                <ContextMenuComponent id='overviewContextMenu' cssClass='schedule-context-menu' ref={contextMenuObj} target='.e-schedule' items={contextMenuItems} beforeOpen={contextMenuOpen} select={contextMenuSelect} />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>);
};

export default SFCalendar;
