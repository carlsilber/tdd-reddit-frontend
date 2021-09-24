import React, { Component } from 'react'
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { format } from 'timeago.js';

class TopicView extends Component {
    render() {
        const { topic } = this.props;
        const { user, date } = topic;
        const { username, displayName, image } = user;
        const relativeDate = format(date);
        return (
          <div className="card p-1">
            <div className="d-flex">
              <ProfileImageWithDefault
                className="rounded-circle m-1"
                width="32"
                height="32"
                image={image}
              />
              <div className="flex-fill m-auto pl-2">
                <h6 className="d-inline">
                  {displayName}@{username}
                </h6>
                <span className="text-black-50"> - </span>
                <span className="text-black-50">{relativeDate}</span>
              </div>
            </div>
            <div className="pl-5">{topic.content}</div>
          </div>
        );
      }
    }

export default TopicView;
