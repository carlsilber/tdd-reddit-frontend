import axios from 'axios';
import * as apiCalls from './apiCalls';

describe('apiCalls', () => {
  describe('signup', () => {
    it('calls /api/1.0/users', () => {
      const mockSignup = jest.fn();
      axios.post = mockSignup;
      apiCalls.signup();

      const path = mockSignup.mock.calls[0][0];
      expect(path).toBe('/api/1.0/users');
    });
  });
  describe('login', () => {
    it('calls /api/1.0/login', () => {
      const mockLogin = jest.fn();
      axios.post = mockLogin;
      apiCalls.login({ username: 'test-user', password: 'P4ssword' });
      const path = mockLogin.mock.calls[0][0];
      expect(path).toBe('/api/1.0/login');
    });
  });
  describe('listUser', () => {
    it('calls /api/1.0/users?page=0&size=3 when no param provided for listUsers', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers();
      expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=3');
    });
    it('calls /api/1.0/users?page=5&size=10 when corresponding params provided for listUsers', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers({ page: 5, size: 10 });
      expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=10');
    });
    it('calls /api/1.0/users?page=5&size=3 when only page param provided for listUsers', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers({ page: 5 });
      expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=5&size=3');
    });
    it('calls /api/1.0/users?page=0&size=5 when only size param provided for listUsers', () => {
      const mockListUsers = jest.fn();
      axios.get = mockListUsers;
      apiCalls.listUsers({ size: 5 });
      expect(mockListUsers).toBeCalledWith('/api/1.0/users?page=0&size=5');
    });
  });
  describe('getUser', () => {
    it('calls /api/1.0/users/user5 when user5 is provided for getUser', () => {
      const mockGetUser = jest.fn();
      axios.get = mockGetUser;
      apiCalls.getUser('user5');
      expect(mockGetUser).toBeCalledWith('/api/1.0/users/user5');
    });
  });
  describe('updateUser', () => {
    it('calls /api/1.0/users/5 when 5 is provided for updateUser', () => {
      const mockUpdateUser = jest.fn();
      axios.put = mockUpdateUser;
      apiCalls.updateUser('5');
      const path = mockUpdateUser.mock.calls[0][0];
      expect(path).toBe('/api/1.0/users/5');
    });
  });
  describe('postTopic', () => {
    it('calls /api/1.0/topics', () => {
      const mockPostTopic = jest.fn();
      axios.post = mockPostTopic;
      apiCalls.postTopic();
      const path = mockPostTopic.mock.calls[0][0];
      expect(path).toBe('/api/1.0/topics');
    });
  });
  describe('loadTopics', () => {
    it('calls /api/1.0/topics?page=0&size=5&sort=id,desc when no param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadTopics();
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/topics?page=0&size=5&sort=id,desc'
      );
    });
    it('calls /api/1.0/users/user1/topics?page=0&size=5&sort=id,desc when user param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadTopics('user1');
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/users/user1/topics?page=0&size=5&sort=id,desc'
      );
    });
  });
  describe('loadOldTopics', () => {
    it('calls /api/1.0/topics/5?direction=before&page=0&size=5&sort=id,desc when topic id param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadOldTopics(5);
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/topics/5?direction=before&page=0&size=5&sort=id,desc'
      );
    });
    it('calls /api/1.0/users/user3/topics/5?direction=before&page=0&size=5&sort=id,desc when topic id and username param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadOldTopics(5, 'user3');
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/users/user3/topics/5?direction=before&page=0&size=5&sort=id,desc'
      );
    });
  });
  describe('loadNewTopics', () => {
    it('calls /api/1.0/topics/5?direction=after&sort=id,desc when topic id param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadNewTopics(5);
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/topics/5?direction=after&sort=id,desc'
      );
    });
    it('calls /api/1.0/users/user3/topics/5?direction=after&sort=id,desc when topic id and username param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadNewTopics(5, 'user3');
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/users/user3/topics/5?direction=after&sort=id,desc'
      );
    });
  });
  describe('loadNewTopicCount', () => {
    it('calls /api/1.0/topics/5?direction=after&count=true when topic id param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadNewTopicCount(5);
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/topics/5?direction=after&count=true'
      );
    });
    it('calls /api/1.0/users/user3/topics/5?direction=after&count=true when topic id and username param provided', () => {
      const mockGetTopics = jest.fn();
      axios.get = mockGetTopics;
      apiCalls.loadNewTopicCount(5, 'user3');
      expect(mockGetTopics).toBeCalledWith(
        '/api/1.0/users/user3/topics/5?direction=after&count=true'
      );
    });
  });
  describe('postTopicFile', () => {
    it('calls /api/1.0/topics/upload', () => {
      const mockPostTopicFile = jest.fn();
      axios.post = mockPostTopicFile;
      apiCalls.postTopicFile();
      const path = mockPostTopicFile.mock.calls[0][0];
      expect(path).toBe('/api/1.0/topics/upload');
    });
  });
});