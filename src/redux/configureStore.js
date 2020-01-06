import { createStore, applyMiddleware } from 'redux';
import authReducer from './authReducer';
import logger from 'redux-logger';
import thunk from 'redux-thunk';

const configureStore = (addLogger = true) => {
  let localStorageData = localStorage.getItem('redd-auth');

  let persistedState = {
    id: 0,
    username: '',
    displayName: '',
    image: '',
    password: '',
    isLoggedIn: false
  };
  if (localStorageData) {
    try {
      persistedState = JSON.parse(localStorageData);
    } catch (error) {}
  }

  const middleware = addLogger
    ? applyMiddleware(thunk, logger)
    : applyMiddleware(thunk);
    const store = createStore(authReducer, persistedState, middleware);

    store.subscribe(() => {
      localStorage.setItem('redd-auth', JSON.stringify(store.getState()));
    });
  
    return store;
};

export default configureStore;