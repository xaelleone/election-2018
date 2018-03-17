import React, { Component } from 'react';

class Results extends Component {
  // props: districts (array of objects)

  constructor(props) {
    super(props);
    this.senateData = require('../data/senate_compiled.json');
    this.houseData = require('../data/house_compiled.json');
    this.governorData = require('../data/governor_compiled.json');
  }

  renderLabel(labelText) {
    return (
      <div>
        <strong>{ labelText }</strong>
        <br />
      </div>
    );
  }

  renderIncumbent(resultsObj) {
    if (resultsObj.incumbent) {
      return 'Incumbent ' + resultsObj.name + ' (' + resultsObj.party + ') is up for re-election';
    } else {
      return 'No incumbent.';
    }
  }

  renderResults(results, key, label) {
    const resultsObj = results[key];
    if (resultsObj) {
      return (
        <div>
          { this.renderLabel(label) }
          { this.renderIncumbent(resultsObj) }
          <br />
          Sabato: { resultsObj.sabato_rank }
          <br />
          Cook: { resultsObj.cook_rank }
          <br />
          Rothenberg: { resultsObj.rothenberg_rank }
        </div>
      );
    } else {
      return (
        <div>
          { this.renderLabel(label) }
          No election this year.
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        RESULTS!
        {
          this.props.districts.map((val, ind) => {
            return (
              <div key={ ind }>
                <br />
                { val.name }
                <br />
                State: { val.state }, District: { val.district }
                { this.renderResults(this.senateData, val.state, 'Senate') }
                { this.renderResults(this.houseData, val.state + val.district, 'House') }
                { this.renderResults(this.governorData, val.state, 'Governor') }
              </div>
            );
          })
        }
      </div>
    );
  }
}

export default Results;
