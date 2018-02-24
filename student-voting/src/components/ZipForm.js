import React, { Component } from 'react';
import geocoder from 'google-geocoder';
import { geoFind, getDistrict } from '../util/ajax';

class ZipForm extends Component {
  // props: zipTypes (array of strings), onSelectZip (callback, takes zip)

  constructor(props) {
    super(props);
    this.state = {
      inputs: props.zipTypes.map(val => {
        return {
          name: val,
          zip: '',
          state: '',
          district: '',
          queryAddress: false,
          address: '',
        };
      }),
    };
    this.zccd = require('../data/zccd.json');
    this.geo = geocoder({ key: 'AIzaSyAeNRZs1K0XE1ck_WZ784HMdA0AVl5TEFE' });
  }

  _formatLabel(zipType) {
    return zipType.charAt(0).toUpperCase() + zipType.slice(1);
  }

  validateZip(inputObj) {
    if (!(inputObj.zip in this.zccd)) {
      window.alert('invalid ' + inputObj.name + ' ZIP');
      return null;
    }

    const districts = this.zccd[inputObj.zip];
    if (districts.length > 1) {
      inputObj.queryAddress = true;
    } else {
      inputObj.state = districts[0].state_abbr;
      inputObj.district = districts[0].cd;
    }
    return inputObj;
  }

  compareClicked() {
    const { inputs } = this.state;
    const updatedInputs = inputs.map(val => this.validateZip(val));
    if (!updatedInputs.every(val => val)) {
      return;
    }
    this.setState({ inputs: updatedInputs });

    // finish only if no addresses need to be queried
    if (!this.shouldShowAddressInput(updatedInputs)) {
      this.props.onSelectZip(updatedInputs);
    }
  }

  findDistrct(latLong, zip) {

  }

  // TODO: work in progress.
  async submitAddressesClicked() {
    console.log(this.state.inputs[0].address)
    const latLong = await geoFind(this.geo, this.state.inputs[0].address);
    console.log(latLong);

    const test = await getDistrict('MA', '7');
    console.log(test);
  }

  inputFieldChanged(inputInd, fieldName, e) {
    const { inputs } = this.state;
    inputs[inputInd][fieldName] = e.target.value;
    this.setState({ inputs });
  }

  shouldShowAddressInput(inputs) {
    return this.state.inputs.some(val => val.queryAddress);
  }

  renderZipInput() {
    return (
      <div>
        {
          this.state.inputs.map((inputObj, ind) => this.renderTextBox(inputObj, ind, 'zip', 'ZIP'))
        }
        <button onClick={ this.compareClicked.bind(this) }>
          Compare
        </button>
      </div>
    );
  }

  renderTextBox(inputObj, ind, fieldName, placeHolderText) {
    return (
      <input
        key={ ind }
        type="text"
        value={ inputObj[fieldName] }
        placeholder={ this._formatLabel(inputObj.name) + ' ' + placeHolderText }
        onChange={ (e) => this.inputFieldChanged(ind, fieldName, e) }
      />
    );
  }

  renderAddressInput() {
    return (
      <div>
        {
          this.state.inputs.map((inputObj, ind) => {
            if (inputObj.queryAddress) {
              return this.renderTextBox(inputObj, ind, 'address', 'Address');
            } else {
              return null;
            }
          })
        }
        <button onClick={ this.submitAddressesClicked.bind(this) }>
          Submit Address(es)
        </button>
      </div>
    );
  }

  render() {
    return (
      <div>
        { this.shouldShowAddressInput(this.state.inputs)
          ? this.renderAddressInput()
          : this.renderZipInput() }
      </div>
    );
  }
}

export default ZipForm;
