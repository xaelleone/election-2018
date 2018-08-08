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
    return districts[ind];
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

  averageRanks(rank1, rank2, rank3) {
    return (rank1 + rank2 + rank3) / 3;
  }

  unabbrState (abbr) {
    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arizona', 'AZ'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];
    for (var i = 0; i < states.length; i++) {
        if (states[i][1] == abbr){
            return(states[i][0].toLowerCase());
        }
    }
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

  getVoteRegistrationUrl(stateAbbr) {
    return 'https://www.vote.org/state/' + this.unabbrState(stateAbbr);
  }

  renderRecommendation(districts) {
    return 'We think you should vote at your ' + this.whereToVoteDecision(districts).name + ' address.';
  }

  renderVoteLinks(districts) {
    const topState = this.whereToVoteDecision(districts).state;
    const otherState = (districts[1].state == topState) ? districts[0].state : districts[1].state;
    return (
      <div className="vote-links">
        <div className="top-link">
          { this.renderVoteLink(topState, false) }
        </div>
        <div className="bottom-link">
          { (districts[0].state != districts[1].state) && this.renderVoteLink(otherState, true) }
        </div>
      </div>
    )
  }

  renderVoteLink(stateAbbr, isOther) {
    return (
      <a href={this.getVoteRegistrationUrl(stateAbbr)}> Register to vote in { stateAbbr }.</a>
    )
  }

  renderLabel(labelText) {
    return (
      <div className="election-label">
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
          { this.renderIncumbent(resultsObj) } <br/>
          We think this race is { this.getCompetitivenessFromRank(this.averageRanks(resultsObj.sabato_rank, resultsObj.cook_rank, resultsObj.rothenberg_rank))}.
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
        <div className="results-recommendation">
          { this.renderRecommendation(this.props.districts) }
          { this.renderVoteLinks(this.props.districts) }
        </div>
        <div className="results-div">
          { this.renderResultsRowText(names) }
          { this.renderResultsRowText(districts) }
          { this.renderElectionResults(this.senateData, val => val.state, 'Senate') }
          { this.renderElectionResults(this.houseData, val => val.state + val.district, 'House') }
          { this.renderElectionResults(this.governorData, val => val.state, 'Governor') }
        </div>
        <div className="disclaimer">
          This result is based on the predictions of the following nonpartisan experts:
          <ul>
            <li> Larry Sabato&#8217;s Crystal Ball </li>
            <li> The Cook Political Report </li>
            <li> Nathan Gonzales&#8217;s Inside Elections </li>
          </ul>
          Where you choose to vote should also depend on which issues you care about.
        </div>
      </div>
    );
  }
}

export default Results;
