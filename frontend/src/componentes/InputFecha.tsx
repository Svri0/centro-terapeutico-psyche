import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

// Registrar el locale español
registerLocale('es', es);

interface InputFechaProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  error?: boolean;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  disabled?: boolean;
}

const InputFecha: React.FC<InputFechaProps> = ({
  value,
  onChange,
  label,
  placeholder = "dd/mm/aaaa",
  className = "",
  error = false,
  minDate,
  maxDate,
  required = false,
  disabled = false
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      // Formatear como YYYY-MM-DD para el input type="date"
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange('');
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          placeholderText={placeholder}
          dateFormat="dd/MM/yyyy"
          showYearDropdown
          scrollableYearDropdown
          locale="es"
          onKeyDown={(e) => {
            // Prevenir escritura manual
            e.preventDefault();
          }}
          className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm cursor-pointer ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
          wrapperClassName="w-full"
          calendarClassName="!bg-white !border-amber-200 !shadow-lg !rounded-lg"
          dayClassName={(date) => {
            const baseClasses = "!text-gray-700 hover:!bg-amber-100";
            if (date && selectedDate && date.getTime() === selectedDate.getTime()) {
              return `${baseClasses} !bg-amber-500 !text-white`;
            }
            return baseClasses;
          }}
          monthClassName={() => "!text-gray-800 !font-medium"}
          yearClassName={() => "!text-gray-800 !font-medium"}
          weekDayClassName={() => "!text-amber-600 !font-medium"}
          popperClassName="!z-50"
          popperPlacement="bottom-start"
          popperModifiers={[
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
            },
          ]}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default InputFecha;

