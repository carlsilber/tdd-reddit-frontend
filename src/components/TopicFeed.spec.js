import React from 'react';
import { render, waitForDomChange, waitForElement, fireEvent } from '@testing-library/react';
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

const mockSuccessGetTopicsFirstOfMultiPage = {
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
      },
      {
        id: 9,
        content: 'This is topic 9',
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
    last: false,
    size: 5,
    totalPages: 2
  }
};

const mockSuccessGetTopicsLastOfMultiPage = {
  data: {
    content: [
      {
        id: 1,
        content: 'This is the oldest topic',
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
    totalPages: 2
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
    it('displays Load More when there are next pages', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      expect(loadMore).toBeInTheDocument();
    });
  });
  describe('Interactions', () => {
    it('calls loadOldTopics with topic id when clicking Load More', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsLastOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      const firstParam = apiCalls.loadOldTopics.mock.calls[0][0];
      expect(firstParam).toBe(9);
    });
    it('calls loadOldTopics with topic id and username when clicking Load More when rendered with user property', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsLastOfMultiPage);
      const { queryByText } = setup({ user: 'user1' });
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      expect(apiCalls.loadOldTopics).toHaveBeenCalledWith(9, 'user1');
    });
    it('displays loaded old topic when loadOldTopics api call success', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsLastOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      const oldTopic = await waitForElement(() =>
        queryByText('This is the oldest topic')
      );
      expect(oldTopic).toBeInTheDocument();
    });
    it('hides Load More when loadOldTopics api call returns last page', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsLastOfMultiPage);
      const { queryByText } = setup();
      const loadMore = await waitForElement(() => queryByText('Load More'));
      fireEvent.click(loadMore);
      await waitForElement(() => queryByText('This is the oldest topic'));
      expect(queryByText('Load More')).not.toBeInTheDocument();
    });
  });
});

console.error = () => {};