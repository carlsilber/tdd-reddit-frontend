import React, { Component } from 'react'
import * as apiCalls from '../api/apiCalls';
import Spinner from './Spinner';
import TopicView from './TopicView';
import Modal from './Modal';

class TopicFeed extends Component {
    state = {
        page: {
          content: []
        },
        isLoadingTopics: false, 
        newTopicCount: 0,
        isLoadingOldTopics: false,
        isLoadingNewTopics: false
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
  this.setState({ isLoadingOldTopics: true });
  apiCalls
    .loadOldTopics(topicAtBottom.id, this.props.user)
    .then((response) => {
      const page = { ...this.state.page };
      page.content = [...page.content, ...response.data.content];
      page.last = response.data.last;
      this.setState({ page, isLoadingOldTopics: false });
    })
    .catch((error) => {
      this.setState({ isLoadingOldTopics: false });
    });
};

onClickLoadNew = () => {
  const topics = this.state.page.content;
  let topTopicId = 0;
  if (topics.length > 0) {
    topTopicId = topics[0].id;
  }
  this.setState({ isLoadingNewTopics: true });
  apiCalls
    .loadNewTopics(topTopicId, this.props.user)
    .then((response) => {
      const page = { ...this.state.page };
      page.content = [...response.data, ...page.content];
      this.setState({ page, newTopicCount: 0, isLoadingNewTopics: false });
    })
    .catch((error) => {
      this.setState({ isLoadingNewTopics: false });
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
          const newTopicCountMessage =
          this.state.newTopicCount === 1
            ? 'There is 1 new topic'
            : `There are ${this.state.newTopicCount} new topics`;     
        return (
            <div>
                {this.state.newTopicCount > 0 && (
                  <div className="card card-header text-center" 
                       onClick={!this.state.isLoadingNewTopics && this.onClickLoadNew}
                       style={{cursor: this.state.isLoadingNewTopics ? 'not-allowed' : 'pointer'}} 
                  >
                {this.state.isLoadingNewTopics ? <Spinner /> : newTopicCountMessage}
          </div>
        )}
            {this.state.page.content.map((topic) => {
              return <TopicView key={topic.id} topic={topic}/>;
            })}
              {this.state.page.last === false && (
                <div className="card card-header text-center" 
                     onClick={!this.state.isLoadingOldTopics && this.onClickLoadMore}
                     style={{cursor: this.state.isLoadingOldTopics ? 'not-allowed' : 'pointer'}}>{this.state.isLoadingOldTopics ? <Spinner /> : 'Load More'}
                </div>
            )}
            <Modal />
          </div>
        );
    }
}

export default TopicFeed;