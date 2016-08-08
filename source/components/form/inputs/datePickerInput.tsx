import * as React from "react";
import * as _ from "underscore";
import * as moment from "moment";
import { Grid, Row, Col } from "./../../layout/grid";
import { classNames, cd } from "./../../../utilities/classBuilder";
import { Icons } from './../../../utilities/icons';
import { Icon } from './../../display/icon';

export interface IDatePickerInputProps extends React.Props<DatePickerInput> {
  className?: string;
  locale?: string;
  date?: moment.Moment | string;
  format?: string;
  min?: moment.Moment | string;
  max?: moment.Moment | string;
  onDateChanged?: (date: moment.Moment | string) => void;
  alwaysShowCalendar?: boolean;
  nativeInput?: boolean;
  icon?: string;
  disabled?: boolean;
  returnString?: boolean;
}

export interface IDatePickerInputState {
  displayedDate?: moment.Moment;
  selectedDate?: moment.Moment;
  pickerBodyVisible?: boolean;
  showOnTop?: boolean;
  calendarOffset?: number;
}

const isoFormat = "YYYY-MM-DD";

export class DatePickerInput extends React.Component<IDatePickerInputProps, IDatePickerInputState> {
  static Icomoon = Icons.Icomoon;

  private mouseDownOnCalendar = false;
  private inputElement : HTMLInputElement;
  private bodyElement;

  private inputElementId;
  private bodyElementId;

  private format: string;

  static defaultProps = {
    format: 'DD/MM/YYYY',
    date: moment().startOf('day'),
    locale: 'en-gb'
  }

  constructor(props: IDatePickerInputProps) {
    super(props);
    const todaysDate = moment().startOf('day');
    this.state = { displayedDate: todaysDate.clone(), selectedDate: todaysDate, pickerBodyVisible: false, showOnTop: false, calendarOffset: 0 };
    moment.locale(props.locale);
    const seed = Math.random().toFixed(4);
    this.inputElementId = "date-picker-text-input-" + seed;
    this.bodyElementId = "date-picker-body-" + seed;
  }

  onDaySelected(date: moment.Moment) {
    if (!this.fallsWithinRange(date)) {
      return;
    }
    const newDate = date.clone();
    if (this.inputElement) {
      this.inputElement.value = newDate.format(this.format);
    }
    this.setState({ selectedDate: newDate, displayedDate: newDate.clone(), pickerBodyVisible: false });
    if (this.props.onDateChanged) {
      this.props.onDateChanged(this.props.returnString ? newDate.format(isoFormat) : newDate.clone());
    }
  }

  isEndOfMonth(date: moment.Moment): boolean {
    const endOfMonth = date.clone().endOf('month');
    return endOfMonth.isSame(date, 'day');
  }

  fallsWithinRange(date: moment.Moment) {
    if (this.props.min && date.isBefore(this.getMinMaxAsMoment(this.props.min), 'day')) {
      return false;
    }
    if (this.props.max && date.isAfter(this.getMinMaxAsMoment(this.props.max), 'day')) {
      return false;
    }
    return true;
  }
  calcTop(){
    if (this.inputElement){
      var bounds = this.inputElement.getBoundingClientRect();
      this.setState({ calendarOffset: bounds.bottom  });
    }
  }

  getDaysInMonth() {
    const days = [];
    const a = this.state.displayedDate.clone().startOf('month').startOf('day');
    const b = a.clone().endOf('month');
    let firstDay = false;

    for (const m = moment(a); m.isBefore(b); m.add(1, 'days')) {
      if (!firstDay) {
        firstDay = true;
        const firstDayIndex = m.weekday();
        for (let i = firstDayIndex; i > 0; i--) {
          days.push(this.getDayComponent(true, this.onDaySelected.bind(this), m.clone().subtract(i, 'days')));
        }
      }
      days.push(this.getDayComponent(false, this.onDaySelected.bind(this), m.clone()));
      if (this.isEndOfMonth(m)) {
        const lastDayIndex = m.weekday();
        for (let i = 1; i < 7 - lastDayIndex; i++) {
          days.push(this.getDayComponent(true, this.onDaySelected.bind(this), m.clone().add(i, 'days')));
        }
      }
    }
    return days;
  }

  getDayComponent(notInCurrentMonth: boolean, dayClicked: (d: moment.Moment) => void, date: moment.Moment) {
    const d = date.clone();
    const dateWithinRange = this.fallsWithinRange(d);
    const isSelected = d.isSame(this.state.selectedDate, 'day');
    return <DatePickerDay
      key={`datepicker_day_${date.format('DDMMYYYY')}`}
      selected={isSelected}
      withinRange={dateWithinRange}
      notInCurrentMonth={notInCurrentMonth}
      dayClicked={dayClicked}
      date={d}/>;
  }

  changeMonth(increment: number) {
    this.setState({ displayedDate: this.state.displayedDate.add(increment, 'months') }, () => {
      this.shouldShowOnTop();
    })
  }

  checkDate(dateString: string) {
    const m = moment(dateString, this.format, false);
    if (m.isValid() && this.fallsWithinRange(m)) {
      const formattedDate = m.format(this.format);
      if (this.inputElement) {
        this.inputElement.value = formattedDate;
      }
      this.setState({ selectedDate: m.clone(), displayedDate: m.clone() });
      if (this.props.onDateChanged) {
        this.props.onDateChanged(this.props.returnString ? m.format(isoFormat) : m.clone());
      }
    } else {
      if (this.inputElement) {
        this.inputElement.value = this.state.selectedDate.format(this.format);
      }
    }
  }

  componentWillMount() {
    this.format = this.props.nativeInput ? isoFormat : this.props.format;
    if (this.props.date) {
      if (typeof this.props.date === "string") {
        const mDate = moment(this.props.date as string, isoFormat);
        this.setState({ selectedDate: mDate, displayedDate: mDate.clone() });
      }
      else {
        const pDate = moment((this.props.date as moment.Moment)).startOf('day');
        pDate.locale(this.props.locale);
        this.setState({ selectedDate: pDate, displayedDate: pDate.clone() });
      }
    }
  }

  componentWillUnmount() {
    if (!this.props.nativeInput) {
      window.removeEventListener('mousedown', this);
    }
  }

  componentDidMount() {
    this.inputElement = document.getElementById(this.inputElementId) as HTMLInputElement;
    this.bodyElement = document.getElementById(this.bodyElementId);
    if (!this.props.nativeInput) {
      window.addEventListener('mousedown', this);
    }
  }

  handleEvent(e) {
    if (this.mouseDownOnCalendar && e.type !== "mousewheel") {
      return;
    }
    document.removeEventListener("mousewheel", this, false);
    this.setState({ pickerBodyVisible: false });
    this.inputElement.blur();
  }

  onInputFocus() {
    document.addEventListener("mousewheel", this, false);
    this.calcTop();
    this.setState({ pickerBodyVisible: true }, () => {
      this.shouldShowOnTop();
    })
  }

  shouldShowOnTop(): boolean {
    if (this.props.nativeInput || !this.inputElement) {
      return;
    }
    const height = this.bodyElement.clientHeight + 50;
    const visibleBottom = (window.innerHeight + window.scrollY);
    const inputRect = this.inputElement.getBoundingClientRect();
    //const remainingSpace = Math.abs(visibleBottom - inputRect.bottom);
    const remainingSpace = window.innerHeight - inputRect.bottom;
    console.log(`height: ${height}, window height ${window.innerHeight}, remainingSpace ${remainingSpace}`);
    if (remainingSpace < height) {
      this.setState({ showOnTop: true });
      return true;
    } else {
      this.setState({ showOnTop: false })
      return false;
    }
  }

  getMinMaxAsMoment(input: moment.Moment | string): moment.Moment {
    if (typeof input === "string") {
      return moment(input, isoFormat, true)
    } else {
      return input;
    }
  }

  getMinMaxAsString(input: moment.Moment | string): string {
    if (typeof input === "string") {
      return input;
    } else {
      return input.format(isoFormat);
    }
  }

  render() {
    const weekdays = _.range(0, 7).map(n => <div className="date-picker-week-day" key={`day_name_${n}`}>{moment().startOf('week').add(n, 'days').format('dd') }</div>)
    const days = this.getDaysInMonth();
    const currentDisplayDate = this.state.displayedDate.format("MMMM - YYYY");
    const classes = classNames("date-picker-body",
      cd("date-picker-body-visible", this.state.pickerBodyVisible && !this.props.alwaysShowCalendar),
      cd("date-picker-top", this.state.showOnTop),
      cd("always-show-calendar", this.props.alwaysShowCalendar));
    const rootClasses = classNames("date-picker", this.props.className, cd('has-icon', this.props.icon !== null), cd('disabled', this.props.disabled));
    if (this.props.nativeInput) {
      return (
        <div className={rootClasses}>
          {this.props.icon && <Icon icon={this.props.icon}/>}
          <input id={this.inputElementId}
            type="date"
            min={this.props.min ? this.getMinMaxAsString(this.props.min) : ''}
            max={this.props.max ? this.getMinMaxAsString(this.props.max)  : ''}
            onChange={e => this.checkDate((e.target as any).value) }
            defaultValue={this.state.selectedDate.format(this.format) }
            onBlur={e => this.checkDate((e.target as any).value) }
            />
        </div>
      )
    }
    return (
      <div className={rootClasses}
        onMouseDown={() => this.mouseDownOnCalendar = true}
        onMouseUp={() => this.mouseDownOnCalendar = false}>
        {this.props.icon && <Icon icon={this.props.icon}/>}
        {!this.props.alwaysShowCalendar &&
          <input id={this.inputElementId}
            type="text"
            defaultValue={this.state.selectedDate.format(this.format) }
            onBlur={e => this.checkDate((e.target as any).value) }
            onFocus={e => this.onInputFocus() }/>
        }
        <div id={this.bodyElementId} className={classes} style={{ top: `${this.state.calendarOffset}px`}}>
          <div className="date-picker-body-wrapper">
            <Grid className="date-picker-header">
              <Row>
                <Col onClick={() => this.changeMonth(-1) } fixed={true}>{`<`}</Col>
                <Col>{currentDisplayDate}</Col>
                <Col onClick={() => this.changeMonth(1) } fixed={true}>{`>`}</Col>
              </Row>
            </Grid>
            <div className="date-picker-days">
              {weekdays}
              {days}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

interface IDatePickerDayProps extends React.Props<DatePickerDay> {
  date: moment.Moment;
  dayClicked: (date: moment.Moment) => void;
  notInCurrentMonth?: boolean;
  selected?: boolean;
  withinRange?: boolean;
}

class DatePickerDay extends React.Component<IDatePickerDayProps, {}> {
  render() {
    const classes = classNames(cd('not-in-month', this.props.notInCurrentMonth), cd('selected-day', this.props.selected), cd("day-disabled", !this.props.withinRange));
    return <div className={classes} onClick={() => this.props.dayClicked(this.props.date) }>{this.props.date.format('DD') }</div>
  }
}
