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

onClickLoadMore = () => {
  const topics = this.state.page.content;
  if (topics.length === 0) {
    return;
  }
  const topicAtBottom = topics[topics.length - 1];
  apiCalls
    .loadOldTopics(topicAtBottom.id, this.props.user)
    .then((response) => {
      const page = { ...this.state.page };
      page.content = [...page.content, ...response.data.content];
      page.last = response.data.last;
      this.setState({ page });
    });
};

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
              {this.state.page.last === false && (
                <div className="card card-header text-center" onClick={this.onClickLoadMore} style={{ cursor: 'pointer' }}>Load More</div>
            )}
          </div>
        );
    }
}

export default TopicFeed;