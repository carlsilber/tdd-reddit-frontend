import React, { Component } from 'react'
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import TopicView from './TopicView';

class TopicFeed extends Component {
    state = {
        page: {
          content: []
        },
        isLoadingTopics: false, 
        newTopicCount: 0
      };
    
componentDidMount() {
    this.setState({ isLoadingTopics: true });
    apiCalls.loadTopics(this.props.user).then((response) => {
      this.setState({ page: response.data, isLoadingTopics: false }, () => {
        this.counter = setInterval(this.checkCount, 3000);
      });
    });
  }

componentWillUnmount() {
  clearInterval(this.counter);
}

checkCount = () => {
  const topics = this.state.page.content;
  let topTopicId = 0;
  if (topics.length > 0) {
    topTopicId = topics[0].id;
  }
  apiCalls.loadNewTopicCount(topTopicId, this.props.user).then((response) => {
    this.setState({ newTopicCount: response.data.count });
  });
};


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

onClickLoadNew = () => {
  const topics = this.state.page.content;
  let topTopicId = 0;
  if (topics.length > 0) {
    topTopicId = topics[0].id;
  }
  apiCalls.loadNewTopics(topTopicId, this.props.user).then((response) => {
    const page = { ...this.state.page };
    page.content = [...response.data, ...page.content];
    this.setState({ page, newTopicCount: 0 });
  });
};

    render() {
        if (this.state.isLoadingTopics) {
            return <Spinner />;
          }
          if (this.state.page.content.length === 0 && this.state.newTopicCount === 0) {
            return (
              <div className="card card-header text-center">There are no topics</div>
            );
          }
      
        return (
            <div>
                {this.state.newTopicCount > 0 && (
                  <div className="card card-header text-center" onClick={this.onClickLoadNew} style={{ cursor: 'pointer' }} >
                {this.state.newTopicCount === 1 ? 'There is 1 new topic' : `There are ${this.state.newTopicCount} new topics`}
          </div>
        )}
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