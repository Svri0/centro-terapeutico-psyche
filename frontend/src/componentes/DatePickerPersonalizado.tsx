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
}

const DatePickerPersonalizado: React.FC<DatePickerPersonalizadoProps> = ({
  selected,
  onChange,
  placeholderText = "Seleccionar fecha",
  className = "",
  error = false
}) => {
  // Calcular fechas límite para psicólogos
  const today = new Date();
  const minAge = 21; // Edad mínima para ejercer como psicólogo
  const maxAge = 80; // Edad máxima razonable
  
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      minDate={minDate}
      maxDate={maxDate}
      placeholderText={placeholderText}
      dateFormat="dd/MM/yyyy"
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={100}
      locale="es"
      className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
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
  );
};

export default DatePickerPersonalizado; 