import 'react-app-polyfill/ie11';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { PersistGate } from "redux-persist/integration/react";
import { Provider } from "react-redux";
import { persistor, store } from './redux/store';

import { HashRouter } from 'react-router-dom'
import ScrollToTop from './ScrollToTop';

import { registerLicense } from '@syncfusion/ej2-base';

registerLicense(`${process.env.REACT_APP_SF_KEY}`);

ReactDOM.render(
    <HashRouter>
        <ScrollToTop>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <App />
                </PersistGate>
            </Provider>
        </ScrollToTop>
    </HashRouter>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.unregister();
