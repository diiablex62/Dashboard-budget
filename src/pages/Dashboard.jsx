import React from "react";
import Card from "../components/Card";

export default function Dashboard() {
  return (
    <div className='p-6 bg-white text-gray-800 dark:bg-black dark:text-gray-200'>
      <h1 className='text-2xl font-bold mb-4'>Tableau de bord</h1>
      <div className='grid grid-cols-3 gap-4'>
        <Card title='Carte 1' description='' />
        <Card title='Carte 2' description='' />
        <Card title='Carte 3' description='' />
      </div>
    </div>
  );
}
