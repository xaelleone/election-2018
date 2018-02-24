import React, { Component } from 'react';

class ZipForm extends Component {
  // props: onSelectZip (callback, takes zip)

  constructor(props) {
    super(props);
    this.state = {
      home: {
        name: 'home',
        zip: ''
      },
      school: {
        name: 'school',
        zip: ''
      },
    };
  }

  renderTextBox(zipType) {
    return (
      <input
        type="text"
        value={this.state[zipType].zip}
        placeholder={formatLabel(zipType) + " ZIP"}
      />
    )
  }

  formatLabel (zipType) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  compare () {
    
  }

  validateZip () {

  }

  render() {
    return (
      <div>
        {this.renderTextBox("home")}
        {this.renderTextBox("school")}
        <button onClick={this.compare}>
          Compare
        </button>
      </div>
    );
    // display input text boxes and possibly ask for address
  }
}

export default ZipForm;
