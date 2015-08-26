import { StateAndEffect, withSideEffect } from './sideEffects';

function mapValues(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    result[key] = fn(obj[key], key);
    return result;
  }, {});
}

function pick(obj, fn) {
  return Object.keys(obj).reduce((result, key) => {
    if (fn(obj[key])) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

export function combineReducersWithEffects(reducers) {
  let finalReducers = pick(reducers, (val) => typeof val === 'function');


  let defaultState = mapValues(finalReducers, () => undefined);

  return function combination(state = defaultState, action) {
    let sideEffects = [];
    let finalState = mapValues(finalReducers, (reducer, key) => {
      let newState = reducer(state[key], action);

      if (newState instanceof StateAndEffect) {
        sideEffects.push(...(newState.effects));
        return newState.state;
      }
      return newState;
    });


    if (sideEffects.length) {
      return withSideEffect(finalState, ...sideEffects);
    }
    return finalState;
  };
}
