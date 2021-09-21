import React from 'react';
import { render, fireEvent, waitForDomChange } from '@testing-library/react';
import TopicSubmit from './TopicSubmit';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';
import * as apiCalls from '../api/apiCalls';

const defaultState = {
  id: 1,
  username: 'user1',
  displayName: 'display1',
  image: 'profile1.png',
  password: 'P4ssword',
  isLoggedIn: true
};

let store;

const setup = (state = defaultState) => {
  store = createStore(authReducer, state);
  return render(
    <Provider store={store}>
      <TopicSubmit />
    </Provider>
  );
};

describe('TopicSubmit', () => {
  describe('Layout', () => {
    it('has textarea', () => {
        const { container } = setup();
      const textArea = container.querySelector('textarea');
      expect(textArea).toBeInTheDocument();
    });
    it('has image', () => {
        const { container } = setup();
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
    it('has textarea', () => {
        const { container } = setup();
      const textArea = container.querySelector('textarea');
      expect(textArea.rows).toBe(1);
    });
    it('displays user image', () => {
        const { container } = setup();
        const image = container.querySelector('img');
        expect(image.src).toContain('/images/profile/' + defaultState.image);
      });
  });
  describe('Interactions', () => {
    it('displays 3 rows when focused to textarea', () => {
      const { container } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      expect(textArea.rows).toBe(3);
    });
    it('displays post button when focused to textarea', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      const postButton = queryByText('Post');
      expect(postButton).toBeInTheDocument();
    });
    it('displays Cancel button when focused to textarea', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      const cancelButton = queryByText('Cancel');
      expect(cancelButton).toBeInTheDocument();
    });
    it('does not display Post button when not focused to textarea', () => {
      const { queryByText } = setup();
      const postButton = queryByText('Post');
      expect(postButton).not.toBeInTheDocument();
    });
    it('does not display Cancel button when not focused to textarea', () => {
      const { queryByText } = setup();
      const cancelButton = queryByText('Cancel');
      expect(cancelButton).not.toBeInTheDocument();
    });
    it('returns back to unfocused state after clicking the cancel', () => {
      const { container, queryByText } = setup();
      const textArea = container.querySelector('textarea');
      fireEvent.focus(textArea);
      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);
      expect(queryByText('Cancel')).not.toBeInTheDocument();
    });
    it('calls postTopic with topic request object when clicking Post', () => {
        const { container, queryByText } = setup();
        const textArea = container.querySelector('textarea');
        fireEvent.focus(textArea);
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(topicButton);
  
        expect(apiCalls.postTopic).toHaveBeenCalledWith({
          content: 'Test topic content'
        });
      });
      it('returns back to unfocused state after successful postTopic action', async () => {
        const { container, queryByText } = setup();
        const textArea = container.querySelector('textarea');
        fireEvent.focus(textArea);
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(topicButton);
  
        await waitForDomChange();
        expect(queryByText('Post')).not.toBeInTheDocument();
      });
      it('clear content after successful postTopic action', async () => {
        const { container, queryByText } = setup();
        const textArea = container.querySelector('textarea');
        fireEvent.focus(textArea);
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(topicButton);
  
        await waitForDomChange();
        expect(queryByText('Test topic content')).not.toBeInTheDocument();
      });
      it('clear content after successful postTopic action', () => {
        const { container, queryByText } = setup();
        const textArea = container.querySelector('textarea');
        fireEvent.focus(textArea);
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        fireEvent.click(queryByText('Cancel'));
  
        expect(queryByText('Test topic content')).not.toBeInTheDocument();
      });
  });
});