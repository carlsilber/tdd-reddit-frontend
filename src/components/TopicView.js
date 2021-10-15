import React, { useRef } from 'react'
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import useClickTracker from '../shared/useClickTracker';

const TopicView = (props) => {
  const actionArea = useRef();
  const dropDownVisible = useClickTracker(actionArea);
  const { topic, onClickDelete } = props;
  const { user, date } = topic;
  const { username, displayName, image } = user;
  const relativeDate = format(date);
  const attachmentImageVisible =
    topic.attachment && topic.attachment.fileType.startsWith('image');

  const ownedByLoggedInUser = user.id === props.loggedInUser.id;

  let dropDownClass = 'p-0 shadow dropdown-menu';
  if (dropDownVisible) {
    dropDownClass += ' show';
  }

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
          <Link to={`/${username}`} className="list-group-item-action">
            <h6 className="d-inline">
              {displayName}@{username}
            </h6>
          </Link>
          <span className="text-black-50"> - </span>
          <span className="text-black-50">{relativeDate}</span>
        </div>
        {ownedByLoggedInUser && (
          <div className="dropdown">
            <span
              className="btn btn-sm btn-light dropdown-toggle"
              data-testid="topic-actions"
              ref={actionArea}
            />
            <div className={dropDownClass} data-testid="topic-action-dropdown">
              <button
                className="btn btn-outline-danger btn-sm btn-block text-left"
                onClick={onClickDelete}
              >
                <i className="far fa-trash-alt" /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="pl-5">{topic.content}</div>
      {attachmentImageVisible && (
        <div className="pl-5">
          <img
            alt="attachment"
            src={`/images/attachments/${topic.attachment.name}`}
            className="img-fluid"
          />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    loggedInUser: state,
  };
};

export default connect(mapStateToProps)(TopicView);