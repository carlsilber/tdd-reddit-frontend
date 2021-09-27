import React from 'react';
import { render, waitForDomChange, waitForElement, fireEvent } from '@testing-library/react';
import TopicFeed from './TopicFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
  window.setInterval = (callback, interval) => {
    timedFunction = callback;
  };
  window.clearInterval = () => {
    timedFunction = undefined;
  };
};

const useRealIntervals = () => {
  window.setInterval = originalSetInterval;
  window.clearInterval = originalClearInterval;
};

const runTimer = () => {
  timedFunction && timedFunction();
};

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

const mockSuccessGetNewTopicsList = {
  data: [
    {
      id: 21,
      content: 'This is the newest topic',
      date: 1561294668539,
      user: {
        id: 1,
        username: 'user1',
        displayName: 'display1',
        image: 'profile1.png'
      }
    }
  ]
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
    it('calls loadNewTopicCount with topTopic id', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup();
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new topic'));
      const firstParam = apiCalls.loadNewTopicCount.mock.calls[0][0];
      expect(firstParam).toBe(10);
      useRealIntervals();
    });
    it('calls loadNewTopicCount with topTopic id and username when rendered with user property', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new topic'));
      expect(apiCalls.loadNewTopicCount).toHaveBeenCalledWith(10, 'user1');
      useRealIntervals();
    });
    it('displays new topic count as 1 after loadNewTopicCount success', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newTopicCount = await waitForElement(() =>
        queryByText('There is 1 new topic')
      );
      expect(newTopicCount).toBeInTheDocument();
      useRealIntervals();
    });
    it('displays new topic count constantly', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new topic'));
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 2 } });
        runTimer();
      const newTopicCount = await waitForElement(() =>
        queryByText('There are 2 new topics')
      );
      expect(newTopicCount).toBeInTheDocument();
      useRealIntervals();
    });
    it('does not call loadNewTopicCount after component is unmounted', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText, unmount } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      await waitForElement(() => queryByText('There is 1 new topic'));
      unmount();
      expect(apiCalls.loadNewTopicCount).toHaveBeenCalledTimes(1);
      useRealIntervals();
    });
    it('displays new topic count as 1 after loadNewTopicCount success when user does not have topics initially', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest.fn().mockResolvedValue(mockEmptyResponse);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newTopicCount = await waitForElement(() =>
        queryByText('There is 1 new topic')
      );
      expect(newTopicCount).toBeInTheDocument();
      useRealIntervals();
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
        // load new topics
    it('calls loadNewTopics with topic id when clicking New Topic Count Card', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewTopicsList);
      const { queryByText } = setup();
      await waitForDomChange();
      runTimer();
      const newTopicCount = await waitForElement(() =>
        queryByText('There is 1 new topic')
      );
      fireEvent.click(newTopicCount);
      const firstParam = apiCalls.loadNewTopics.mock.calls[0][0];
      expect(firstParam).toBe(10);
      useRealIntervals();
    });
    it('calls loadNewTopics with topic id and username when clicking New Topic Count Card', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewTopicsList);
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newTopicCount = await waitForElement(() =>
        queryByText('There is 1 new topic')
      );
      fireEvent.click(newTopicCount);
      expect(apiCalls.loadNewTopics).toHaveBeenCalledWith(10, 'user1');
      useRealIntervals();
    });
    it('displays loaded new topic when loadNewTopics api call success', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewTopicsList);
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newTopicCount = await waitForElement(() =>
        queryByText('There is 1 new topic')
      );
      fireEvent.click(newTopicCount);
      const newTopic = await waitForElement(() =>
        queryByText('This is the newest topic')
      );
      expect(newTopic).toBeInTheDocument();
      useRealIntervals();
    });
    it('hides new topic count when loadNewTopics api call success', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetNewTopicsList);
      const { queryByText } = setup({ user: 'user1' });
      await waitForDomChange();
      runTimer();
      const newTopicCount = await waitForElement(() =>
        queryByText('There is 1 new topic')
      );
      fireEvent.click(newTopicCount);
      await waitForElement(() => queryByText('This is the newest topic'));
      expect(queryByText('There is 1 new topic')).not.toBeInTheDocument();
      useRealIntervals();
    });
  });
});

console.error = () => {};