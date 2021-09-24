import React from 'react';
import { render, waitForDomChange, waitForElement } from '@testing-library/react';
import TopicFeed from './TopicFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';

const setup = (props) => {
  return render(
    <MemoryRouter>
      <TopicFeed {...props} />
    </MemoryRouter>
  );
};

const mockEmptyResponse = {
  data: {
    content: []
  }
};

const mockSuccessGetTopicsSinglePage = {
  data: {
    content: [
      {
        id: 10,
        content: 'This is the latest topic',
        date: 1561294668539,
        user: {
          id: 1,
          username: 'user1',
          displayName: 'display1',
          image: 'profile1.png'
        }
      }
    ],
    number: 0,
    first: true,
    last: true,
    size: 5,
    totalPages: 1
  }
};

describe('TopicFeed', () => {
  describe('Lifecycle', () => {
    it('calls loadTopics when it is rendered', () => {
      apiCalls.loadTopics = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup();
      expect(apiCalls.loadTopics).toHaveBeenCalled();
    });
    it('calls loadTopics with user parameter when it is rendered with user property', () => {
      apiCalls.loadTopics = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup({ user: 'user1' });
      expect(apiCalls.loadTopics).toHaveBeenCalledWith('user1');
    });
    it('calls loadTopics without user parameter when it is rendered without user property', () => {
      apiCalls.loadTopics = jest.fn().mockResolvedValue(mockEmptyResponse);
      setup();
      const parameter = apiCalls.loadTopics.mock.calls[0][0];
      expect(parameter).toBeUndefined();
    });
  });
  describe('Layout', () => {
    it('displays no topic message when the response has empty page', async () => {
      apiCalls.loadTopics = jest.fn().mockResolvedValue(mockEmptyResponse);
      const { queryByText } = setup();
      const message = await waitForElement(() =>
        queryByText('There are no topics')
      );
      expect(message).toBeInTheDocument();
    });
    it('does not display no topic message when the response has page of topic', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsSinglePage);
      const { queryByText } = setup();
      await waitForDomChange();
      expect(queryByText('There are no topics')).not.toBeInTheDocument();
    });
    it('displays spinner when loading the topics', async () => {
      apiCalls.loadTopics = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetTopicsSinglePage);
          }, 300);
        });
      });
      const { queryByText } = setup();
      expect(queryByText('Loading...')).toBeInTheDocument();
    });
    it('displays topic content', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsSinglePage);
      const { queryByText } = setup();
      const topicContent = await waitForElement(() =>
        queryByText('This is the latest topic')
      );
      expect(topicContent).toBeInTheDocument();
    });
  });
});