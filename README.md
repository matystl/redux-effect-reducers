Effect for reducers in redux library
=========================

This library bring power of async operation back to reducers in [redux](https://github.com/rackt/redux).

# Warning

This is experimental addition right now. It's not published in npm and
don't use it in production. API may change at any time.


# Usage

With this plugin signature of reducer is changed to 

```js 
  (state,action) => newState | withSideEffect(newState, effect1, effect2, ...)
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
  .catch((error) => dispach(
    type: LOGIN_FAILED,
    error
  ))
}

function reducer(state = defaultState, action) {
  switch(action.type) {
    case LOGIN_USER:
      new_state = ... // set state of user to loading
      return withSideEffect(newState, loadUser)
    case LOGIN_SUCCESSFULL:
      new_state = ... // set state of user to logged
      return new_state;
    case LOGIN_FAILED:
      new_state = ... // maybe you want to retry few times before
      // you show user error so you can increase retry count
      // and return new state with same ajax to load user
      // or if retry count is height enought return state without effect
  }
}
```

So now you know how to return effects from reducers now lets look
what is needed to make them work with redux. You will need to 2 function from
this library. `enableEffects` should encapsulate applyMiddleware. 
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
Promises are not ok. What happen with effects is that after you dispach
action and you return effects they are colleted by enableEffects store enhencer
into queue and shoved back into dispach. Note that that listeners
are notified only after every effect has been dispached.

###So that mean i can dispach from reducer? 
Yes and know. You can return action
as effect and that action will be passed after original dispach has finished.
Anyways i don't think this is good idea to dispach sync action as effect.

###So what sould i put in effect if it's not recomanded to put there sync actions?
You should put there something with side effects what your middlewares can perform for you.
So if you use [thunk-middleware](https://github.com/gaearon/redux-thunk)
feel free to return fucntion that will get dispach and get state as argument.
If you use some middleware that can make declarative ajax-es for you can
put this declarative ajax as effect.
 
It's up to you what middlewares you have and therefore what kind of
 effects will be enabled.

Just reminder don't return promises as effects. You can use 
[redux-promise](https://github.com/acdlite/redux-promise) but only from
action creators not as effects because they are not pure.

# Is this working with redux [devtools](https://github.com/gaearon/redux-devtools)

Short answer yes. More detailed anwer is that in order to support replay
and other godnes of dev tools current implementation is that for every action
effects are evaluated only once. So if dev tools replay action this lib know that
it should skip evaluating effects. 
Limitation which you already probably follow:
1. your actions has to be object
2. you should never dispach same object twice
3. your object should not be freezed 

# Testing

TODO explain differences to original reducer and implement stripEffects

# More complex example

TODO loging user with widgets that need to load data after user has been logged
and can be not presented on current screen


#Thanks

Thanks @jlongster for orignal [pull request](https://github.com/rackt/redux/pull/569) that 
has not been merged but provide good inspiration.

[Elm](http://elm-lang.org/) for idea of effects that i like so much.
 

#License

MIT