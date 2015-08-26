Effect for reducers in redux library
=========================

This library bring power of async operation back to reducers in [redux](https://github.com/rackt/redux).

# Usage

With this plugin signature of reducer is changed to 

```(state,action) => newState | withSideEffect(newState, effect1, effect2, ...)```

So simple example for logging user without async action creator will look this way
```
import {withSideEffect} from 'redux-effect-reducers'

function loadUser(dispach) {
  ajax('url_to_load_user')
  .then((user) => dispach({
    type: LOGIN_SUCCESSFULL,
    user: user
  }))
  .catch((e) => dispach(
    type: LOGIN_FAILED,
    error: e
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

#Usage

```
  import
```