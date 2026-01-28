import React from 'react';
import { Link } from 'react-router-dom';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div className="flex justify-center mb-8 text-sm">
       <div className={step1 ? 'text-blue-600 font-bold' : 'text-gray-400'}>1. Login</div>
       <div className="mx-2"> &gt; </div>
       <div className={step2 ? 'text-blue-600 font-bold' : 'text-gray-400'}>2. Ship</div>
       <div className="mx-2"> &gt; </div>
       <div className={step3 ? 'text-blue-600 font-bold' : 'text-gray-400'}>3. Pay</div>
       <div className="mx-2"> &gt; </div>
       <div className={step4 ? 'text-blue-600 font-bold' : 'text-gray-400'}>4. Order</div>
    </div>
  );
};
export default CheckoutSteps;