import React, { Component } from 'react';
import { argmax } from '../util/util';

const GOVERNOR_WEIGHT = 0.2;
const SENATE_WEIGHT = 0.4;
const HOUSE_WEIGHT = 0.4;

// this constant captures how valuable it is to vote in an election that's completely uncompetitive just to increase turnout
// 0 would mean voting in an uncompetitive election is the same as not voting at all
const UNCOMPETITIVE_RANK = -0.5;

class Results extends Component {
  // props: districts (array of objects)

  constructor(props) {
    super(props);
    this.senateData = require('../data/senate_compiled.json');
    this.houseData = require('../data/house_compiled.json');
    this.governorData = require('../data/governor_compiled.json');
  }

  whereToVoteDecision(districts) {
    const ind = argmax(districts, this.districtVoteValue.bind(this));
    return districts[ind].state;
  }

  districtVoteValue(districtObj) {
    const state = districtObj.state;
    const district = districtObj.district;
    const return_val = SENATE_WEIGHT * this.electionCompetitiveness(this.senateData, state)
      + HOUSE_WEIGHT * this.electionCompetitiveness(this.houseData, state + district)
      + GOVERNOR_WEIGHT * this.electionCompetitiveness(this.governorData, state);
    return -1 * return_val;
  }

  electionCompetitiveness(results, key) {
    const resultsObj = results[key];
    if (resultsObj) {
      const return_val = this.transformRank(resultsObj.sabato_rank) + this.transformRank(resultsObj.cook_rank) + this.transformRank(resultsObj.rothenberg_rank);
      return return_val;
    }
    // if there is no election, consider election to be ultimately uncompetitive
    return UNCOMPETITIVE_RANK;
  }

  // convert 1-7 scale to competitiveness
  transformRank(rank) {
    return Math.abs(rank - 4);
  }

  renderRecommendation(districts) {
    return 'We think you should vote in ' + this.whereToVoteDecision(districts) + '.';
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
        { this.renderRecommendation(this.props.districts) }
        <div className="results-div">
          {
            this.props.districts.map((val, ind) => {
              return (
                <div key={ ind } className="results-col">
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
      </div>
    );
  }
}

export default Results;
