import React, { Component } from 'react';
import ProfileImageWithDefault from './ProfileImageWithDefault';
import { connect } from "react-redux";
import * as apiCalls from '../api/apiCalls';
import ButtonWithProgress from './ButtonWithProgress';

class TopicSubmit extends Component {
    state = {
        focused: false,
        content: undefined,
        pendingApiCall: false
      };
    
      onChangeContent = (event) => {
        const value = event.target.value;
        this.setState({ content: value });
      };
    
      onClickPost = () => {
        const body = {
          content: this.state.content
        };
        this.setState({ pendingApiCall: true });
        apiCalls
          .postTopic(body)
          .then((response) => {
            this.setState({
              focused: false,
              content: '',
              pendingApiCall: false
            });
          })
          .catch((error) => {
            this.setState({ pendingApiCall: false });
          });
      };
    
      onFocus = () => {
        this.setState({
          focused: true
        });
      };
    
      onClickCancel = () => {
        this.setState({
            focused: false,
            content: ''
        });
      };
    
  render() {
    return (
      <div className="card d-flex flex-row p-1">
        <ProfileImageWithDefault
          className="rounded-circle m-1"
          width="32"
          height="32"
          image={this.props.loggedInUser.image}
        />
        <div className="flex-fill">
        <textarea
            className="form-control w-100"
            rows={this.state.focused ? 3 : 1}
            onFocus={this.onFocus}
            value={this.state.content}
            onChange={this.onChangeContent}
          />
          {this.state.focused && (
            <div className="text-right mt-1">
            <ButtonWithProgress
                className="btn btn-success"
                disabled={this.state.pendingApiCall}
                onClick={this.onClickPost}
                pendingApiCall={this.state.pendingApiCall}
                text="Post"
              />
              <button
                className="btn btn-light ml-1"
                onClick={this.onClickCancel}
                disabled={this.state.pendingApiCall}
              >
                <i className="fas fa-times"></i> Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
    return {
      loggedInUser: state
    };
  };
  
  export default connect(mapStateToProps)(TopicSubmit);