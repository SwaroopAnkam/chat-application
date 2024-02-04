// eslint-disable-next-line no-unused-vars
import { configureStore, combineReducers, applyMiddleware } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import all from 'redux-saga';
import { authReducer } from './reducers/authReducer';
import {messengerReducer} from './reducers/messengerReducer';

const rootReducer = combineReducers({

    auth: authReducer,
    messenger : messengerReducer
});


function* rootSaga() {

    yield all([

    ]);
}

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(sagaMiddleware),
    devTools: process.env.NODE_ENV !== 'production',
});


sagaMiddleware.run(rootSaga);

export default store;
