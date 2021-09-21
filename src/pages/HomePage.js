import React from 'react';
import UserList from '../components/UserList';
import TopicSubmit from '../components/TopicSubmit';

class HomePage extends React.Component {
  render() {
    return (
      <div data-testid="homepage">
        <div className="row">
          <div className="col-8">
            <TopicSubmit />
          </div>
          <div className="col-4">
            <UserList />
          </div>
        </div>
      </div>
    );
  }
}

export default HomePage;