export const INC = 'inc';
export const INCSIDE = 'incSide';
export const INCSIDE2 = 'incSide2';
export const INCSIDE3 = 'incSide3';

export const INCSIDE4 = 'incSide4';
export const INCSIDE5 = 'incSide5';
export const INCSIDE6 = 'incSide6';

export function incSync() {
  return {
    type: INC,
    date: new Date()
  };
}

export function incAsync() {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(incSync());
    }, 5000);
  };
}

export function incSide() {
  return {
    type: INCSIDE,
    date: new Date()
  };
}

export function asyncDispach(action) {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(action);
    }, 2000);
  };
}

export function incSide2() {
  return {
    type: INCSIDE2,
    date: new Date()
  };
}

export function incSide4() {
  return {
    type: INCSIDE4,
    date: new Date()
  };
}
