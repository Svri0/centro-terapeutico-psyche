import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';

// Registrar el locale español
registerLocale('es', es);

interface DatePickerPersonalizadoProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  className?: string;
  error?: boolean;
  minDate?: Date;
  maxDate?: Date;
  isCitas?: boolean; // Nueva prop para distinguir entre citas y fechas de nacimiento
}

const DatePickerPersonalizado: React.FC<DatePickerPersonalizadoProps> = ({
  selected,
  onChange,
  placeholderText = "Seleccionar fecha",
  className = "",
  error = false,
  minDate,
  maxDate,
  isCitas = false
}) => {
  // Calcular fechas límite según el tipo de uso
  let finalMinDate = minDate;
  let finalMaxDate = maxDate;

  if (!isCitas) {
    // Para fechas de nacimiento (psicólogos)
    const today = new Date();
    const minAge = 21; // Edad mínima para ejercer como psicólogo
    const maxAge = 80; // Edad máxima razonable
    
    finalMaxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    finalMinDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  } else {
    // Para citas - desde 01/08/2025 hasta 2026
    finalMinDate = new Date(2025, 7, 1); // 1 de agosto de 2025
    finalMaxDate = new Date(2026, 11, 31); // 31 de diciembre de 2026
  }

  return (
    <div className="relative">
      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={finalMinDate}
        maxDate={finalMaxDate}
        placeholderText={placeholderText}
        dateFormat="dd/MM/yyyy"
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={isCitas ? 2 : 100} // Solo 2 años para citas
        locale="es"
        onKeyDown={(e) => {
          // Prevenir escritura manual
          e.preventDefault();
        }}
        onInput={(e) => {
          // Prevenir entrada manual
          e.preventDefault();
        }}
        className={`mt-1 block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm cursor-pointer ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        wrapperClassName="w-full"
        calendarClassName="!bg-white !border-amber-200 !shadow-lg !rounded-lg"
        dayClassName={(date) => {
          const baseClasses = "!text-gray-700 hover:!bg-amber-100";
          if (date && selected && date.getTime() === selected.getTime()) {
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
  );
};

export default DatePickerPersonalizado; 