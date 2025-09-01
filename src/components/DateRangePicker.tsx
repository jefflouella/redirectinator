import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DateRangePickerProps {
  fromDate: Date;
  toDate: Date;
  onDateChange: (fromDate: Date, toDate: Date) => void;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  fromDate,
  toDate,
  onDateChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startMonth, setStartMonth] = useState(fromDate);
  const [endMonth, setEndMonth] = useState(toDate);
  const [selectedFromDate, setSelectedFromDate] = useState(fromDate);
  const [selectedToDate, setSelectedToDate] = useState(toDate);
  const [activeCalendar, setActiveCalendar] = useState<'start' | 'end'>('start');
  const pickerRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Get calendar days for a given month
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Navigate months for start calendar
  const goToPreviousStartMonth = () => {
    setStartMonth(new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1));
  };

  const goToNextStartMonth = () => {
    setStartMonth(new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 1));
  };

  // Navigate months for end calendar
  const goToPreviousEndMonth = () => {
    setEndMonth(new Date(endMonth.getFullYear(), endMonth.getMonth() - 1, 1));
  };

  const goToNextEndMonth = () => {
    setEndMonth(new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateClick = (date: Date, calendar: 'start' | 'end') => {
    if (calendar === 'start') {
      setSelectedFromDate(date);
      if (date > selectedToDate) {
        setSelectedToDate(date);
      }
      setActiveCalendar('end');
    } else {
      if (date >= selectedFromDate) {
        setSelectedToDate(date);
        onDateChange(selectedFromDate, date);
        setIsOpen(false);
      }
    }
  };

  // Check if date is in range
  const isInRange = (date: Date) => {
    return date >= selectedFromDate && date <= selectedToDate;
  };



  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date, month: Date) => {
    return date.getMonth() === month.getMonth() && 
           date.getFullYear() === month.getFullYear();
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '/');
  };

  // Apply date range
  const applyDateRange = () => {
    onDateChange(selectedFromDate, selectedToDate);
    setIsOpen(false);
  };

  // Reset to original dates
  const resetDates = () => {
    setSelectedFromDate(fromDate);
    setSelectedToDate(toDate);
    setStartMonth(fromDate);
    setEndMonth(toDate);
    setActiveCalendar('start');
  };

  const startCalendarDays = getCalendarDays(startMonth);
  const endCalendarDays = getCalendarDays(endMonth);

  return (
    <div className={`relative date-range-picker ${className}`} ref={pickerRef}>
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {formatDate(selectedFromDate)} <span className="text-gray-400">→</span> {formatDate(selectedToDate)}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[700px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Date Range</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Two Separate Calendars */}
          <div className="flex space-x-8">
            {/* Start Date Calendar */}
            <div className="flex-1">
              <div className={`text-center mb-3 pb-2 ${activeCalendar === 'start' ? 'border-b-2 border-blue-500' : 'border-b border-gray-200'}`}>
                <h4 className="font-semibold text-gray-900">Start Date</h4>
                <p className="text-sm text-gray-500">Click to select start date</p>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goToPreviousStartMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h4 className="font-medium text-gray-900">
                  {months[startMonth.getMonth()]} {startMonth.getFullYear()}
                </h4>
                <button
                  onClick={goToNextStartMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {startCalendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date, 'start')}
                    disabled={!isCurrentMonth(date, startMonth)}
                    className={`
                      w-8 h-8 text-xs rounded-md transition-colors calendar-day
                      ${!isCurrentMonth(date, startMonth) 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : isToday(date)
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : date.getTime() === selectedFromDate.getTime()
                        ? 'bg-blue-600 text-white font-semibold'
                        : isInRange(date)
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* End Date Calendar */}
            <div className="flex-1">
              <div className={`text-center mb-3 pb-2 ${activeCalendar === 'end' ? 'border-b-2 border-blue-500' : 'border-b border-gray-200'}`}>
                <h4 className="font-semibold text-gray-900">End Date</h4>
                <p className="text-sm text-gray-500">Click to select end date</p>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goToPreviousEndMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h4 className="font-medium text-gray-900">
                  {months[endMonth.getMonth()]} {endMonth.getFullYear()}
                </h4>
                <button
                  onClick={goToNextEndMonth}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {endCalendarDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date, 'end')}
                    disabled={!isCurrentMonth(date, endMonth) || date < selectedFromDate}
                    className={`
                      w-8 h-8 text-xs rounded-md transition-colors calendar-day
                      ${!isCurrentMonth(date, endMonth) || date < selectedFromDate
                        ? 'text-gray-300 cursor-not-allowed' 
                        : isToday(date)
                        ? 'bg-blue-100 text-blue-700 font-semibold'
                        : date.getTime() === selectedToDate.getTime()
                        ? 'bg-blue-600 text-white font-semibold'
                        : isInRange(date)
                        ? 'bg-blue-100 text-blue-900'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Range Display */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Selected Range:</div>
            <div className="font-medium text-gray-900">
              {formatDate(selectedFromDate)} → {formatDate(selectedToDate)}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {activeCalendar === 'start' ? 'Select start date' : 'Select end date'}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={resetDates}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
              >
                Reset
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={applyDateRange}
                className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
