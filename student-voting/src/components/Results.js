import React, { Component } from 'react';

class Results extends Component {
  // props: districts (array of objects)

  render() {
    return (
      <div>
        RESULTS!
        {
          this.props.districts.map((val, ind) => {
            return (
              <div key={ ind }>
                State: {val.state} District: {val.district}
              </div>
            );
          })
        }
      </div>
    );
  }
}

export default Results;
