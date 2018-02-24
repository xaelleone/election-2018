import React, { Component } from 'react';

class ZipForm extends Component {
  // props: onSelectZip (callback, takes zip)

  constructor(props) {
    super(props);
    this.state = {
      inputs: [
        {
          name: 'home',
          zip: ''
        },
        {
          name: 'school',
          zip: ''
        }
      ]
    };
  }

  _formatLabel(zipType) {
    return zipType.charAt(0).toUpperCase() + zipType.slice(1);
  }

  validateZip() {

  }

  compareClicked() {
    
  }

  zipChanged(inputInd, e) {
    const { inputs } = this.state;
    inputs[inputInd].zip = e.target.value;
    this.setState({ inputs });
  }

  renderTextBox(inputObj, inputInd) {
    return (
      <input
        key={ inputInd }
        type="text"
        value={ inputObj.zip }
        placeholder={ this._formatLabel(inputObj.name) + " ZIP" }
        onChange={ (e) => this.zipChanged(inputInd, e) }
      />
    )
  }

  render() {
    return (
      <div>
        { this.state.inputs.map((val, ind) => this.renderTextBox(val, ind)) }
        <button onClick={ this.compareClicked.bind(this) }>
          Compare
        </button>
      </div>
    );
    // display input text boxes and possibly ask for address
  }
}

export default ZipForm;
