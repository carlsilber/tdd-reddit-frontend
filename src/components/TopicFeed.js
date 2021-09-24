import React, { Component } from 'react'
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import TopicView from './TopicView';

class TopicFeed extends Component {
    state = {
        page: {
          content: []
        },
        isLoadingTopics: false
      };
    
componentDidMount() {
    this.setState({ isLoadingTopics: true });
    apiCalls.loadTopics(this.props.user).then((response) => {
      this.setState({ page: response.data, isLoadingTopics: false });
    });
}
    render() {
        if (this.state.isLoadingTopics) {
            return <Spinner />;
          }
          if (this.state.page.content.length === 0) {
            return (
              <div className="card card-header text-center">There are no topics</div>
            );
          }
      
        return (
            <div>
            {this.state.page.content.map((topic) => {
              return <TopicView key={topic.id} topic={topic}/>;
            })}
          </div>
        );
    }
}

export default TopicFeed;