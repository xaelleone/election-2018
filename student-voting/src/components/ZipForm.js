import React, { Component } from 'react';
import geocoder from 'google-geocoder';
import inside from 'point-in-polygon';

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

  async findDistrict(latLong, zip) {
    const cdCandidates = this.zccd[zip];
    for (const district of cdCandidates) {
      const districtGeoData = await getDistrict(district.state_abbr, district.cd);
      const boundaries = districtGeoData.geometry.coordinates;
      for (const boundary of boundaries) {
        if (inside([latLong.location.lng, latLong.location.lat], boundary[0])) {
          return district;
        }
      }
    }
  }

  async resolveAddress(inputObj) {
    if (inputObj.address === '') {
      window.alert('enter address!')
      return null;
    }
    const latLong = await geoFind(this.geo, inputObj.address);
    if (latLong.zip !== inputObj.zip) {
      window.alert('address not in ' + inputObj.name + ' ZIP');
      return null;
    }
    const district = await this.findDistrict(latLong, inputObj.zip);
    inputObj.state = district.state_abbr;
    inputObj.district = district.cd;

    inputObj.queryAddress = false;
    return inputObj;
  }

  async submitAddressesClicked() {
    const { inputs } = this.state;
    const updatedInputs = inputs.map(val => val);
    for (let ind = 0; ind < updatedInputs.length; ind++) {
      if (updatedInputs[ind].queryAddress) {
        updatedInputs[ind] = await this.resolveAddress(inputs[ind]);
      }
    }
    if (!updatedInputs.every(val => val)) {
      return;
    }
    this.setState({ inputs: updatedInputs });

    // finish since done querying addresses
    this.props.onSelectZip(updatedInputs);
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
