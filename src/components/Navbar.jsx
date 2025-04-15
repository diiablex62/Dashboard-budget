import React, { useContext } from "react";
import {
  AiOutlineSearch,
  AiOutlineSetting,
  AiOutlineBell,
  AiOutlineHome,
} from "react-icons/ai";
import { FaUserCircle } from "react-icons/fa";
import { AppContext } from "../context/AppContext";

export default function Navbar() {
  const { activeTitle, setIsSettingsOpen, isNavbarFixed } =
    useContext(AppContext);

  return (
    <div
      className={`w-full p-4 flex items-center justify-between ${
        isNavbarFixed ? "fixed top-0 left-0 bg-white shadow-md z-50" : ""
      }`}>
      <div className='flex items-center space-x-2 text-gray-600'>
        <AiOutlineHome className='text-xl cursor-pointer' />
        <span>/</span>
        <span className='text-lg font-medium text-gray-800'>{activeTitle}</span>
      </div>
      <div className='flex items-center space-x-4'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search here'
            className='border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <AiOutlineSearch className='absolute left-3 top-2.5 text-gray-400 text-lg' />
        </div>
        <FaUserCircle className='text-gray-500 text-2xl cursor-pointer' />
        <AiOutlineSetting
          className='text-gray-500 text-2xl cursor-pointer'
          title='Paramètres'
          onClick={() => setIsSettingsOpen(true)}
        />
        <AiOutlineBell className='text-gray-500 text-2xl cursor-pointer' />
      </div>
    </div>
  );
}
