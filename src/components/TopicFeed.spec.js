import React from 'react';
import { render, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import TopicFeed from './TopicFeed';
import * as apiCalls from '../api/apiCalls';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import authReducer from '../redux/authReducer';

const loggedInStateUser1 = {
  id: 1,
  username: 'user1',
  displayName: 'display1',
  image: 'profile1.png',
  password: 'P4ssword',
  isLoggedIn: true
};

const originalSetInterval = window.setInterval;
const originalClearInterval = window.clearInterval;

let timedFunction;

const useFakeIntervals = () => {
  window.setInterval = (callback, interval) => {
    if (!callback.toString().startsWith('function')) {
      timedFunction = callback;
      return 111111;
    }
  };
  window.clearInterval = (id) => {
    if (id === 111111) {
      timedFunction = undefined;
    }
  };
};

const useRealIntervals = () => {
  window.setInterval = originalSetInterval;
  window.clearInterval = originalClearInterval;
};

const runTimer = () => {
  timedFunction && timedFunction();
};

const setup = (props, state = loggedInStateUser1) => {
  const store = createStore(authReducer, state);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <TopicFeed {...props} />
      </MemoryRouter>
    </Provider>
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

const mockSuccessGetTopicsMiddleOfMultiPage = {
  data: {
    content: [
      {
        id: 5,
        content: 'This topic is in middle page',
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
    first: false,
    last: false,
    size: 5,
    totalPages: 2
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
    it('calls loadNewTopicCount with topTopic id', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { findByText } = setup();
      await findByText('This is the latest topic');
      runTimer();
      await findByText('There is 1 new topic');
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
      const { findByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      await findByText('There is 1 new topic');
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
      const { findByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
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
      const { findByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      await findByText('There is 1 new topic');
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 2 } });
      runTimer();
      const newTopicCount = await findByText('There are 2 new topics');
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
      const { findByText, unmount } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      await findByText('There is 1 new topic');
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
      const { findByText } = setup({ user: 'user1' });
      await findByText('There are no topics');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
      expect(newTopicCount).toBeInTheDocument();
      useRealIntervals();
    });
  });
  describe('Layout', () => {
    it('displays no topic message when the response has empty page', async () => {
      apiCalls.loadTopics = jest.fn().mockResolvedValue(mockEmptyResponse);
      const { findByText } = setup();
      const message = await findByText('There are no topics');
      expect(message).toBeInTheDocument();
    });
    it('does not display no topic message when the response has page of topic', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsSinglePage);
      const { queryByText } = setup();
      const message = queryByText('There are no topics');
      await waitFor(() => {
        expect(message).not.toBeInTheDocument();
      });
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
      const { findByText } = setup();
      const topicContent = await findByText('This is the latest topic');
      expect(topicContent).toBeInTheDocument();
    });
    it('displays Load More when there are next pages', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      const { findByText } = setup();
      const loadMore = await findByText('Load More');
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
      const { findByText } = setup();
      const loadMore = await findByText('Load More');
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
      const { findByText } = setup({ user: 'user1' });
      const loadMore = await findByText('Load More');
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
      const { findByText } = setup();
      const loadMore = await findByText('Load More');
      fireEvent.click(loadMore);
      const oldTopic = await findByText('This is the oldest topic');
      expect(oldTopic).toBeInTheDocument();
    });
    it('hides Load More when loadOldTopics api call returns last page', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsLastOfMultiPage);
      const { findByText } = setup();
      const loadMore = await findByText('Load More');
      fireEvent.click(loadMore);
      await waitFor(() => {
        expect(loadMore).not.toBeInTheDocument();
      });
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
      const { findByText } = setup();
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
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
      const { findByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
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
      const { findByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
      fireEvent.click(newTopicCount);
      const newTopic = await findByText('This is the newest topic');

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
      const { findByText, queryByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
      fireEvent.click(newTopicCount);
      await findByText('This is the newest topic');
      expect(queryByText('There is 1 new topic')).not.toBeInTheDocument();
      useRealIntervals();
    });
    it('does not allow loadOldTopics to be called when there is an active api call about it', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsLastOfMultiPage);
      const { findByText } = setup();

      const loadMore = await findByText('Load More');
      fireEvent.click(loadMore);

      expect(apiCalls.loadOldTopics).toHaveBeenCalledTimes(1);
    });
    it('replaces Load More with spinner when there is an active api call about it', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetTopicsLastOfMultiPage);
          }, 300);
        });
      });
      const { queryByText, findByText } = setup();
      const loadMore = await findByText('Load More');
      fireEvent.click(loadMore);
      const spinner = await findByText('Loading...');
      expect(spinner).toBeInTheDocument();
      expect(queryByText('Load More')).not.toBeInTheDocument();
    });
    it('replaces Spinner with Load More after active api call for loadOldTopics finishes with middle page response', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetTopicsMiddleOfMultiPage);
          }, 300);
        });
      });
      const { queryByText, findByText } = setup();
      const loadMore = await findByText('Load More');
      fireEvent.click(loadMore);
      await findByText('This topic is in middle page');
      expect(queryByText('Loading...')).not.toBeInTheDocument();
      expect(queryByText('Load More')).toBeInTheDocument();
    });
    it('replaces Spinner with Load More after active api call for loadOldTopics finishes error', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadOldTopics = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject({ response: { data: {} } });
          }, 300);
        });
      });
      const { queryByText, findByText } = setup();
      const loadMore = await findByText('Load More');
      fireEvent.click(loadMore);
      const spinner = await findByText('Loading...');
      await waitForElementToBeRemoved(spinner);
      expect(queryByText('Loading...')).not.toBeInTheDocument();
      expect(queryByText('Load More')).toBeInTheDocument();
    });
    // loadNewTopics

    it('does not allow loadNewTopics to be called when there is an active api call about it', async () => {
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
      const { findByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');

      fireEvent.click(newTopicCount);
      fireEvent.click(newTopicCount);

      expect(apiCalls.loadNewTopics).toHaveBeenCalledTimes(1);
      useRealIntervals();
    });
    it('replaces There is 1 new topic with spinner when there is an active api call about it', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewTopics = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(mockSuccessGetNewTopicsList);
          }, 300);
        });
      });
      const { queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
      fireEvent.click(newTopicCount);
      const spinner = await findByText('Loading...');
      expect(spinner).toBeInTheDocument();
      expect(queryByText('There is 1 new topic')).not.toBeInTheDocument();
      useRealIntervals();
    });
    it('removes Spinner and There is 1 new topic after active api call for loadNewTopics finishes with success', async () => {
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
      const { queryByText, findByText } = setup({ user: 'user1' });
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
      fireEvent.click(newTopicCount);
      await findByText('This is the newest topic');
      expect(queryByText('Loading...')).not.toBeInTheDocument();
      expect(queryByText('There is 1 new topic')).not.toBeInTheDocument();
      useRealIntervals();
    });
    it('replaces Spinner with There is 1 new topic after active api call for loadNewTopics fails', async () => {
      useFakeIntervals();
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      apiCalls.loadNewTopics = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject({ response: { data: {} } });
          }, 300);
        });
      });
      const { queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      runTimer();
      const newTopicCount = await findByText('There is 1 new topic');
      fireEvent.click(newTopicCount);
      await findByText('Loading...');
      await waitFor(() => {
        expect(queryByText('Loading...')).not.toBeInTheDocument();
        expect(queryByText('There is 1 new topic')).toBeInTheDocument();
      });
      useRealIntervals();
    });
    it('displays modal when clicking delete on topic', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByTestId, container, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);

      const modalRootDiv = queryByTestId('modal-root');
      expect(modalRootDiv).toHaveClass('modal fade d-block show');
    });
    it('hides modal when clicking cancel', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { queryByTestId, container, findByText, queryByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);

      fireEvent.click(queryByText('Cancel'));

      const modalRootDiv = queryByTestId('modal-root');
      expect(modalRootDiv).not.toHaveClass('d-block show');
    });
    it('displays modal with information about the action', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });
      const { container, queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);

      const message = queryByText(
        `Are you sure to delete 'This is the latest topic'?`
      );
      expect(message).toBeInTheDocument();
    });
    it('calls deleteTopic api with topic id when delete button is clicked on modal', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });

      apiCalls.deleteTopic = jest.fn().mockResolvedValue({});
      const { container, queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);
      const deleteTopicButton = queryByText('Delete Topic');
      fireEvent.click(deleteTopicButton);
      expect(apiCalls.deleteTopic).toHaveBeenCalledWith(10);
    });
    it('hides modal after successful deleteTopic api call', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });

      apiCalls.deleteTopic = jest.fn().mockResolvedValue({});
      const { container, queryByText, queryByTestId, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);
      const deleteTopicButton = queryByText('Delete Topic');
      fireEvent.click(deleteTopicButton);
      await waitFor(() => {
        const modalRootDiv = queryByTestId('modal-root');
        expect(modalRootDiv).not.toHaveClass('d-block show');
      });
    });
    it('removes the deleted topic from document after successful deleteTopic api call', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });

      apiCalls.deleteTopic = jest.fn().mockResolvedValue({});
      const { container, queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);
      const deleteTopicButton = queryByText('Delete Topic');
      fireEvent.click(deleteTopicButton);
      await waitFor(() => {
        const deletedTopicContent = queryByText('This is the latest topic');
        expect(deletedTopicContent).not.toBeInTheDocument();
      });
    });
    it('disables Modal Buttons when api call in progress', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });

      apiCalls.deleteTopic = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });
      const { container, queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);
      const deleteTopicButton = queryByText('Delete Topic');
      fireEvent.click(deleteTopicButton);

      expect(deleteTopicButton).toBeDisabled();
      expect(queryByText('Cancel')).toBeDisabled();
    });
    it('displays spinner when api call in progress', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });

      apiCalls.deleteTopic = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });
      const { container, queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);
      const deleteTopicButton = queryByText('Delete Topic');
      fireEvent.click(deleteTopicButton);
      const spinner = queryByText('Loading...');
      expect(spinner).toBeInTheDocument();
    });
    it('hides spinner when api call finishes', async () => {
      apiCalls.loadTopics = jest
        .fn()
        .mockResolvedValue(mockSuccessGetTopicsFirstOfMultiPage);
      apiCalls.loadNewTopicCount = jest
        .fn()
        .mockResolvedValue({ data: { count: 1 } });

      apiCalls.deleteTopic = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({});
          }, 300);
        });
      });
      const { container, queryByText, findByText } = setup();
      await findByText('This is the latest topic');
      const deleteButton = container.querySelectorAll('button')[0];
      fireEvent.click(deleteButton);
      const deleteTopicButton = queryByText('Delete Topic');
      fireEvent.click(deleteTopicButton);
      await waitFor(() => {
        const spinner = queryByText('Loading...');
        expect(spinner).not.toBeInTheDocument();
      });
    });
  });
});

console.error = () => {};