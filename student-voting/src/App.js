import React, { Component } from 'react';
import './App.css';
import ZipForm from './components/ZipForm';
import Results from './components/Results';

const ZIP_TYPES = ['home', 'school'];

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputs: ZIP_TYPES.map(val => {
        return {
          name: val,
          state: '',
          district: '',
        };
      }),
    };
  }

  zipSelected(newInputs) {
    const { inputs } = this.state;
    newInputs.forEach((val, ind) => {
      inputs[ind].state = val.state;
      inputs[ind].district = val.district;
    })
    this.setState(inputs);
  }

  shouldShowResults() {
    return this.state.inputs.every(val => val.state !== '');
  }

  render() {
    return (
      <div className="App">
        { this.shouldShowResults()
          ? <Results
              districts={ this.state.inputs } />
          : <ZipForm
              onSelectZip={ this.zipSelected.bind(this) }
              zipTypes={ ZIP_TYPES } /> }
      </div>
    );
  }
}

export default App;
