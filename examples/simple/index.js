import React from 'react';
import { createStore, applyMiddleware, compose } from 'redux';
import { devTools } from 'redux-devtools';
import { DevTools, DebugPanel, LogMonitor } from 'redux-devtools/lib/react';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import {enableEffects} from '../../src';

import {App} from './components/App';
import {counter} from './components/model';


const finalCreateStore = compose(
  enableEffects(applyMiddleware)(thunk),
  devTools(),
  createStore
);

let store = finalCreateStore(counter);

React.render(
  <div>
    <Provider store={store}>
      {() => <App />}
    </Provider>
    <DebugPanel top right bottom>
      <DevTools store={store}
              monitor={LogMonitor} />
    </DebugPanel>
  </div>
  ,
  document.querySelector('#app')
);
