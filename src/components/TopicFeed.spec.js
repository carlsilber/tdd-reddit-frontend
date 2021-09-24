import React from 'react';
import { render } from '@testing-library/react';
import TopicFeed from './TopicFeed';
import * as apiCalls from '../api/apiCalls';

const setup = (props) => {
  return render(<TopicFeed {...props} />);
};

const mockEmptyResponse = {
  data: {
    content: []
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
    it('displays no topic message when the response has empty page', () => {
      apiCalls.loadTopics = jest.fn().mockResolvedValue(mockEmptyResponse);
      const { queryByText } = setup();
      expect(queryByText('There are no topics')).toBeInTheDocument();
    });
  });
});