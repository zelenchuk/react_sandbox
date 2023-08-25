import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import SalesGroupManagmentForEfucntional from "./SalesGroupManagmentForEfucntional";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <SalesGroupManagmentForEfucntional
            id={18}
            shortname={'test shortname'}
            salesPersons={[1,2]}
            salesPersonsDetails={[1,2]}
            authConfig={true}
        />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
