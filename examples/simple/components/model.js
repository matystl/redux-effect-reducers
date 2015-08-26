import {withSideEffect} from '../../../src';

import {incAsync, incSync, asyncDispach} from './actions';
import {INC, INCSIDE, INCSIDE2, INCSIDE3, INCSIDE4, INCSIDE5, INCSIDE6} from './actions';

export function counter(state = 0, action) {
  const {type} = action;
  console.log('counter called with ', JSON.stringify(action), action);
  switch (type) {
    case INC:
      return state + 1;
    case INCSIDE:
      return withSideEffect(state + 1, incAsync());
    case INCSIDE2:
      return withSideEffect(state + 1, asyncDispach({type: INCSIDE3}));
    case INCSIDE3:
      return withSideEffect(state + 1, incSync());
    case INCSIDE4:
      return withSideEffect(state + 1, {type: INCSIDE5});
    case INCSIDE5:
      return withSideEffect(state + 1, {type: INCSIDE6});
    case INCSIDE6:
      return state + 1;
    default:
      return state;
  }
}
