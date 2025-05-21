import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  AiOutlineCalendar,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from "react-icons/ai";
import {
  getAllEchelonnePayments,
  getAllRecurrentPayments,
} from "../utils/paymentUtils";
import { transactionApi } from "../utils/api";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from "date-fns";
import { fr } from "date-fns/locale";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getMonthMatrix(year, month) {
  // month: 0-based
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const matrix = [];
  let week = [];
  let dayOfWeek = (firstDay.getDay() + 6) % 7; // 0=Monday
  // Fill first week
  for (let i = 0; i < dayOfWeek; i++) week.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(d);
    if (week.length === 7) {
      matrix.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    matrix.push(week);
  }
  return matrix;
}

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionApi.getTransactions();
      setTransactions(response.data || response);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      setError("Erreur lors de la récupération des transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    const handleDataUpdate = () => fetchTransactions();
    window.addEventListener("data-updated", handleDataUpdate);
    return () => window.removeEventListener("data-updated", handleDataUpdate);
  }, [fetchTransactions]);

  const getTransactionsForDate = useCallback(
    (date) => {
      return transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getDate() === date.getDate() &&
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear()
        );
      });
    },
    [transactions]
  );

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const renderCalendar = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className='grid grid-cols-7 gap-px bg-gray-200'>
        {DAYS.map((day) => (
          <div
            key={day}
            className='bg-gray-100 p-2 text-center text-sm font-semibold text-gray-700'>
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dayTransactions = getTransactionsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toString()}
              className={`min-h-[100px] p-2 bg-white ${
                !isCurrentMonth ? "text-gray-400" : ""
              } ${isCurrentDay ? "bg-blue-50" : ""}`}>
              <div className='font-semibold mb-1'>{format(day, "d")}</div>
              <div className='space-y-1'>
                {dayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className={`text-xs p-1 rounded ${
                      transaction.type === "depense"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                    <div className='font-medium truncate'>
                      {transaction.description}
                    </div>
                    <div className='text-right'>
                      {transaction.type === "depense" ? "-" : "+"}
                      {transaction.amount
                        ? transaction.amount.toFixed(2)
                        : transaction.montant?.toFixed(2) || 0}{" "}
                      €
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [currentDate, getTransactionsForDate]);

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-4'></div>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='h-16 bg-gray-200 rounded'></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        <div className='p-4 border-b flex justify-between items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h1>
          <div className='space-x-2'>
            <button
              onClick={handlePrevMonth}
              className='px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
              Précédent
            </button>
            <button
              onClick={handleToday}
              className='px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
              Aujourd'hui
            </button>
            <button
              onClick={handleNextMonth}
              className='px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50'>
              Suivant
            </button>
          </div>
        </div>
        {renderCalendar}
      </div>
    </div>
  );
}
