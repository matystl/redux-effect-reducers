Effect for reducers in redux library
=========================

This library bring power of async operation back to reducers in [redux](https://github.com/rackt/redux).

# Warning

This is experimental addition right now. It's not published in npm and
don't use it in production. API may change at any time.


# Usage

With this plugin signature of reducer is changed to 

```js 
  (state, action) => newState | withSideEffect(newState, effect1, effect2, ...)
```

So simple example for logging user without async action creator will look this way
```js
import {withSideEffect} from 'redux-effect-reducers'

function loadUser(dispach) {
  ajax('url_to_load_user')
  .then((user) => dispach({
    type: LOGIN_SUCCESSFULL,
     user
  }))
  .catch((error) => dispach({
    type: LOGIN_FAILED,
    error
    }))
}

function reducer(state = defaultState, action) {
  switch(action.type) {
    case LOGIN_USER:
      new_state = ... // set state of user to loading
      // ! NOTICE that i don’t run this function just passing it as effect
      return withSideEffect(newState, loadUser)
    case LOGIN_SUCCESSFULL:
      new_state = ... // set state of user to logged
      return new_state;
    case LOGIN_FAILED:
      new_state = ... // maybe you want to retry few times before
      // you show user error so you can increase retry count
      // and return new state with same ajax to load user
      // or if retry count is height enough return state without effect
  }
}
```

So now you know how to return effects from reducers now lets look
what is needed to make them work with redux. You will need to 2 function from
this library. `enableEffects` should encapsulate `applyMiddleware`. 
And function `combineReducersWithEffects` is replacement for
`combineReducers`.

```js
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './reducers/index';

import {combineReducersWithEffects, enableEffects} from 'redux-effect-reducers';

const reducer = combineReducersWithEffects(reducers);

// create a store with middlewares
const createStoreWithMiddleware = enableEffects(applyMiddleware)(thunk)(createStore);

const store = createStoreWithMiddleware(reducer);

```

# What is exactly effects that i can return

Effect should be anything that is pure. So object is ok. Function is also ok.
Promises are not ok. What happen with effects is that after you dispatch
action and you return effects they are collected by enableEffects store enhancer
into queue and shoved back into dispatch path(through middlewares). Note that that listeners
are notified only after every effect has been dispatched.

###So that mean i can dispatch from reducer? 

Yes and know. You can return action
as effect and that action will be passed after original dispatch has finished.
Anyways i don't think this is good idea to dispatch sync action as effect.
So you have been warned that it's probably bad idea. 

###So what should i put in effect if it's not recommended to put there sync actions?

You should put there something (with encapsulated "side effects") what your
 middlewares can perform for you.
So if you use [thunk-middleware](https://github.com/gaearon/redux-thunk)
feel free to return function that will get dispatch and get state as argument.
If you use some middleware that can make declarative ajax-es, you can
put this declarative ajax as effect.
 
It's up to you what middlewares you have and therefore what kind of
 effects will be enabled.

Just reminder don't return promises as effects. You can use 
[redux-promise](https://github.com/acdlite/redux-promise) but only from
action creators not as effects because promises are inherently impure.

# Is this working with redux [devtools](https://github.com/gaearon/redux-devtools)

Short answer yes. More detailed answer is that in order to support replay
and other goodness of dev tools current implementation is that for every action
effects are evaluated only once. So if dev tools replay action this lib know that
it should skip evaluating effects. 


Limitation which you probably already follow:

1. your actions has to be object
2. you should never dispatch same object twice
3. your object should not be frozen 

# Testing

Testing is not really different than as in combination of async action creator 
and pure reducer. Normally you would have 2 kinds of test for async actions 
one for action creator that is producing side effects things and second suit
of test for your pure reducers that results of async flow is stored in state.

Same is true for effect full reducers. One type of test would be that in
certain state and action reducer produce some effects. Second suit of test
is that in response to async actions(action for async action together with response from async action)
you will get to correct state. For second scenario just use simple helper that will strip
away effects from reducer and call reduce over action on reducer without effects.

```
stripEffects(reducer) => (state, action) => {
  const newState = reducer(state, action) 
  return (newState instanceof StateAndEffect)? newState.state : newState;
}

//test my reducer without effects
const newReducer = stripEffects(originalReducer);
const resultState = [
  // action that will produce effect
  // action that is result of async effect
].reduce(newReducer, newReducer())
//check if new state is as expected
```

# More complex motivation example

Ok so you are still not convinced that this is good idea. I don't blame you and probably
it's not best solution for all async actions. My best approximation till now is that 
async action that don't use getState are good as they are(in action creators).

For action creators that have to read from state problem is that your getState 
get whole state. So if you change state structure your reducer will not have problem
with it but your action creators will.

### Page with multiple widget for logged and unlogged users

Imagine that you have on page multiple widgets. They can be shown or hidden. Also
your page is accessible for logged and unlogged user and widget content is different
for these use cases. Let's now write action creator for logging user:
```js
// everything has to be in action creator

function logUser(email, pwd) {
  return (dispach, getState) {
    dispach(//signal that i am logging user)
    ajax(//make ajax for logging user)
    .then((user) {
      dispach(user);
      // now we should check what widget are visible and make request for loading data for them
      // because they can't do it for themself
      const state = getState();
      tryLoadDataForWidget1(state);
      tryLoadDataForWidget2(state);
      tryLoadDataForWidget3(state);
    })
  }
}
```
Now if you look in this function it is clearly doing too much. Its responsibility is to log
user and do all stuff that should happen after user log in.

Now if you remake it into effects for loading users and effects for loading widget data, you get clear separation of concerns.
```js
logUser(dispatch) {
  ajax(//make ajax for logging user)
  .then((user) => dispatch({type: "USER_SUCCESFULLY_LOGGED", user}))
}

userReducer(state, action) {
  ...
  case LOG_USER:
    //set state to logging
    return withSideEffect(newState, logUser)
  ...
}

// in file for widget1

loadWidget1DataForLoggedUser(dispach) {
  ajax(//make ajax for widget1)
  .then((user) => dispach({type: "DATA_FOR_WIDGET1", user}))
}

widget1Reducer(state, action) {
  ...
  case USER_SUCCESFULLY_LOGGED:
    if (i_need_aditional_data_for_this_widget) {
      //set loading to state
      return withSideEffect(newState, loadWidget1DataForLoggedUser)
    } else {
      return state;
    }
  ...
}

// files for widget2, widget3 are similar 
```
Now there is no function that has too many responsibilities. Everybody is responsible for his own
state and own ajax management. 

And yes i know there is [Relay](https://facebook.github.io/relay) and
[Falcor](https://github.com/Netflix/falcor) but this should not be specifically about data fetching
rather that sometimes is better to specify effects in reducers sometimes is better to abstraction in action creator but it should be up to as programmer to decide

#Thanks

Thanks @jlongster for original [pull request](https://github.com/rackt/redux/pull/569) and insipiration.

[Elm](http://elm-lang.org/) for idea of effects that i like so much.

[Cycle.js](http://cycle.js.org/) and [Cerebral](https://github.com/christianalfoni/cerebral) 
frameworks (libraries) for trying to push frontend with good experimental ideas. 

#License

MIT
