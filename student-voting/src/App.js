import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ZipForm from './components/ZipForm';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      home: {
        name: 'home',
        zip: '',
        district: {}
      },
      school: {
        name: 'school',
        zip: '',
        district: {}
      },
    };
  }

  zipSelected(zip) {
    return null;
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <ZipForm onSelectZip={ this.zipSelected.bind(this) } />
      </div>
    );
  }
}

export default App;
