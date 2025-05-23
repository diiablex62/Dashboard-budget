import React from "react";

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function DatePickerModal({
  show,
  onClose,
  onConfirm,
  selectedDate,
  onChange,
}) {
  const [tempDate, setTempDate] = React.useState(selectedDate || new Date());

  React.useEffect(() => {
    setTempDate(selectedDate || new Date());
  }, [selectedDate, show]);

  const handleYearSelect = (year) => {
    setTempDate((prev) => new Date(year, prev.getMonth(), prev.getDate()));
  };
  const handleMonthSelect = (month) => {
    setTempDate((prev) => new Date(prev.getFullYear(), month, prev.getDate()));
  };
  const handleDaySelect = (day) => {
    setTempDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), day));
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  if (!show) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-96'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-medium text-gray-700 dark:text-gray-300'>
            Sélectionner une date
          </h3>
          <button
            className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            onClick={onClose}>
            &times;
          </button>
        </div>
        {/* Sélecteur d'année */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
            Année
          </label>
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 12 }, (_, i) => 2015 + i).map((year) => (
              <button
                key={year}
                className={`py-1 px-2 rounded text-sm ${
                  year === tempDate.getFullYear()
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleYearSelect(year)}>
                {year}
              </button>
            ))}
          </div>
        </div>
        {/* Sélecteur de mois */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
            Mois
          </label>
          <div className='grid grid-cols-3 gap-2'>
            {MONTHS.map((monthName, idx) => (
              <button
                key={idx}
                className={`py-2 px-3 rounded ${
                  idx === tempDate.getMonth()
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleMonthSelect(idx)}>
                {monthName.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
        {/* Sélecteur de jour */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1'>
            Jour
          </label>
          <div className='flex flex-wrap gap-2'>
            {Array.from(
              {
                length: daysInMonth(
                  tempDate.getFullYear(),
                  tempDate.getMonth()
                ),
              },
              (_, i) => i + 1
            ).map((day) => (
              <button
                key={day}
                className={`py-1 px-2 rounded text-sm ${
                  day === tempDate.getDate()
                    ? "bg-teal-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                onClick={() => handleDaySelect(day)}>
                {day}
              </button>
            ))}
          </div>
        </div>
        {/* Boutons d'action */}
        <div className='flex justify-end space-x-2 mt-4'>
          <button
            className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600'
            onClick={onClose}>
            Annuler
          </button>
          <button
            className='px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600'
            onClick={() => {
              onConfirm(tempDate);
              onChange && onChange(tempDate);
            }}>
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
