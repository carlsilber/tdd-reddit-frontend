import React, { Component } from 'react'
import * as apiCalls from '../api/apiCalls';

class TopicFeed extends Component {
componentDidMount() {
    apiCalls.loadTopics(this.props.user);
}
    render() {
        return (
            <div className="card card-header text-center">There are no topics</div>
        );
    }
}

export default TopicFeed;