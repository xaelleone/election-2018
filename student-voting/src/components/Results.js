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

  // TODO: make this more refined
  getCompetitivenessFromRank(rank) {
    const rankDeviation = this.transformRank(rank);
    if (rankDeviation > 2.5) {
      return 'uncompetitive';
    } else if (rankDeviation > 1.5) {
      return 'probably uncompetitive';
    } else if (rankDeviation > 0.5) {
      return 'somewhat competitive';
    } else {
      return 'a toss-up';
    }
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

  renderSpecificElectionResults(results, key, ind) {
    const resultsObj = results[key];
    if (resultsObj) {
      return (
        <div key={ ind } className="results-item">
          { this.renderIncumbent(resultsObj) }
          <ul>
            <li>Sabato thinks this race is { this.getCompetitivenessFromRank(resultsObj.sabato_rank) }.</li>
            <li>Cook thinks this race is { this.getCompetitivenessFromRank(resultsObj.cook_rank) }.</li>
            <li>Rothenberg thinks this race is { this.getCompetitivenessFromRank(resultsObj.rothenberg_rank) }.</li>
          </ul>
        </div>
      );
    } else {
      return (
        <div key={ ind } className="results-item">
          No election this year.
        </div>
      );
    }
  }

  renderResultsRowDiv(contents) {
    return (
      <div className="results-row">
        {
          this.props.districts.map((val, ind) => contents[ind])
        }
      </div>
    );
  }

  renderResultsRowText(textContents) {
    const contents = textContents.map((text, ind) => {
      return (
        <div key={ ind } className="results-item">
          { text }
        </div>
      );
    });
    return this.renderResultsRowDiv(contents);
  }

  renderElectionResults(results, keyFunc, label) {
    const contents = this.props.districts.map((val, ind) => this.renderSpecificElectionResults(results, keyFunc(val), ind));
    return (
      <div>
        { this.renderLabel(label) }
        { this.renderResultsRowDiv(contents) }
      </div>
    );
  }

  render() {
    const names = this.props.districts.map(val => val.name);
    const districts = this.props.districts.map(val => 'State: ' + val.state + ', District: ' + val.district);
    return (
      <div>
        { this.renderRecommendation(this.props.districts) }
        <div className="results-div">
          { this.renderResultsRowText(names) }
          { this.renderResultsRowText(districts) }
          { this.renderElectionResults(this.senateData, val => val.state, 'Senate') }
          { this.renderElectionResults(this.houseData, val => val.state + val.district, 'House') }
          { this.renderElectionResults(this.governorData, val => val.state, 'Governor') }
        </div>
      </div>
    );
  }
}

export default Results;
