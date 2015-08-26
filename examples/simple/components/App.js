import React from 'react';
import {connect} from 'react-redux';
import {incAsync, incSync, incSide, incSide2, incSide4} from './actions';

function mapStateToProps(state) {
  return {
    counter: state
  };
}

// Which action creators does it want to receive by props?
function mapDispatchToProps(dispatch) {
  return {
    onIncrementA: () => dispatch(incAsync()),
    onIncrementS: () => dispatch(incSync()),
    onSide: () => dispatch(incSide()),
    onSide2: () => dispatch(incSide2()),
    onSide4: () => dispatch(incSide4())
  };
}

@connect(mapStateToProps, mapDispatchToProps)
export class App extends React.Component {
  render() {
    return (
      <div>
        Counter: {this.props.counter} <br />
        <button onClick={this.props.onIncrementA}>Async</button>
        <button onClick={this.props.onIncrementS}>Sync</button>
        <button onClick={this.props.onSide}>SideEffect</button>
        <button onClick={this.props.onSide2}>SideMultiple</button>
        <button onClick={this.props.onSide4}>SideMultipleSync</button>

      </div>
    );
  }
}
