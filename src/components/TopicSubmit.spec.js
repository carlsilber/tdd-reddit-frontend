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
    it('displays textarea 1 line', () => {
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
    let textArea;
    const setupFocused = () => {
      const rendered = setup();
      textArea = rendered.container.querySelector('textarea');
      fireEvent.focus(textArea);
      return rendered;
    };
    it('displays 3 rows when focused to textarea', () => {
      setupFocused();
      expect(textArea.rows).toBe(3);
    });  
    it('displays Post button when focused to textarea', () => {
      const { queryByText } = setupFocused();
      const postButton = queryByText('Post');
      expect(postButton).toBeInTheDocument();
    });
    it('displays Cancel button when focused to textarea', () => {
      const { queryByText } = setupFocused();
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
      const { queryByText } = setupFocused();
      const cancelButton = queryByText('Cancel');
      fireEvent.click(cancelButton);
      expect(queryByText('Cancel')).not.toBeInTheDocument();
    });
    it('calls postTopic with topic request object when clicking Post', () => {
      const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(topicButton);
  
        expect(apiCalls.postTopic).toHaveBeenCalledWith({
          content: 'Test topic content'
        });
      });
      it('returns back to unfocused state after successful postTopic action', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(topicButton);
  
        await waitForDomChange();
        expect(queryByText('Post')).not.toBeInTheDocument();
      });
      it('clear content after successful postTopic action', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(topicButton);
  
        await waitForDomChange();
        expect(queryByText('Test topic content')).not.toBeInTheDocument();
      });
      it('clears content after clicking cancel', () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        fireEvent.click(queryByText('Cancel'));
  
        expect(queryByText('Test topic content')).not.toBeInTheDocument();
      });
      it('disables Post button when there is postTopic api call', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const postButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({});
            }, 300);
          });
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(postButton);
  
        fireEvent.click(postButton);
        expect(mockFunction).toHaveBeenCalledTimes(1);
      });
      it('disables Cancel button when there is postTopic api call', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const postButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({});
            }, 300);
          });
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(postButton);
  
        const cancelButton = queryByText('Cancel');
        expect(cancelButton).toBeDisabled();
      });
      it('displays spinner when there is postTopic api call', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const postButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve({});
            }, 300);
          });
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(postButton);
  
        expect(queryByText('Loading...')).toBeInTheDocument();
      });
      it('enables Post button when postTopic api call fails', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const postButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockRejectedValueOnce({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(postButton);
  
        await waitForDomChange();
  
        expect(queryByText('Post')).not.toBeDisabled();
      });
      it('enables Cancel button when postTopic api call fails', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const postButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockRejectedValueOnce({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(postButton);
  
        await waitForDomChange();
  
        expect(queryByText('Cancel')).not.toBeDisabled();
      });
      it('enables Post button after successful postTopic action', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const postButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(postButton);
  
        await waitForDomChange();
        fireEvent.focus(textArea);
        expect(queryByText('Post')).not.toBeDisabled();
      });
      it('displays validation error for content', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockRejectedValueOnce({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(topicButton);
  
        await waitForDomChange();
  
        expect(
          queryByText('It must have minimum 10 and maximum 5000 characters')
        ).toBeInTheDocument();
      });
      it('clears validation error after clicking cancel', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockRejectedValueOnce({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(topicButton);
  
        await waitForDomChange();
        fireEvent.click(queryByText('Cancel'));
  
        expect(
          queryByText('It must have minimum 10 and maximum 5000 characters')
        ).not.toBeInTheDocument();
      });
      it('clears validation error after content is changed', async () => {
        const { queryByText } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const topicButton = queryByText('Post');
  
        const mockFunction = jest.fn().mockRejectedValueOnce({
          response: {
            data: {
              validationErrors: {
                content: 'It must have minimum 10 and maximum 5000 characters'
              }
            }
          }
        });
  
        apiCalls.postTopic = mockFunction;
        fireEvent.click(topicButton);
  
        await waitForDomChange();
        fireEvent.change(textArea, {
          target: { value: 'Test topic content updated' }
        });
  
        expect(
          queryByText('It must have minimum 10 and maximum 5000 characters')
        ).not.toBeInTheDocument();
      });
      it('displays file attachment input when text area focused', () => {
        const { container } = setup();
        const textArea = container.querySelector('textarea');
        fireEvent.focus(textArea);
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
      });
      it('displays image component when file selected', async () => {
        apiCalls.postTopicFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png'
          }
        });
        const { container } = setup();
        const textArea = container.querySelector('textarea');
        fireEvent.focus(textArea);
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
  
        const file = new File(['dummy content'], 'example.png', {
          type: 'image/png'
        });
        fireEvent.change(uploadInput, { target: { files: [file] } });
  
        await waitForDomChange();
  
        const images = container.querySelectorAll('img');
        const attachmentImage = images[1];
        expect(attachmentImage.src).toContain('data:image/png;base64');
      });
      it('removes selected image after clicking cancel', async () => {
        apiCalls.postTopicFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png'
          }
        });
        const { queryByText, container } = setupFocused();
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
  
        const file = new File(['dummy content'], 'example.png', {
          type: 'image/png'
        });
        fireEvent.change(uploadInput, { target: { files: [file] } });
  
        await waitForDomChange();
  
        fireEvent.click(queryByText('Cancel'));
        fireEvent.focus(textArea);
  
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(1);
      });
      it('calls postTopicFile when file selected', async () => {
        apiCalls.postTopicFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png'
          }
        });
  
        const { container } = setupFocused();
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
  
        const file = new File(['dummy content'], 'example.png', {
          type: 'image/png'
        });
        fireEvent.change(uploadInput, { target: { files: [file] } });
  
        await waitForDomChange();
        expect(apiCalls.postTopicFile).toHaveBeenCalledTimes(1);
      });
      it('calls postTopicFile with selected file', async () => {
        apiCalls.postTopicFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png'
          }
        });
  
        const { container } = setupFocused();
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
  
        const file = new File(['dummy content'], 'example.png', {
          type: 'image/png'
        });
        fireEvent.change(uploadInput, { target: { files: [file] } });
  
        await waitForDomChange();
  
        const body = apiCalls.postTopicFile.mock.calls[0][0];
  
        const readFile = () => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
  
            reader.onloadend = () => {
              resolve(reader.result);
            };
            reader.readAsText(body.get('file'));
          });
        };

        const result = await readFile();

        expect(result).toBe('dummy content');
      });
      it('calls postTopic with topic with file attachment object when clicking Post', async () => {
        apiCalls.postTopicFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png'
          }
        });
        const { queryByText, container } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
  
        const file = new File(['dummy content'], 'example.png', {
          type: 'image/png'
        });
        fireEvent.change(uploadInput, { target: { files: [file] } });
  
        await waitForDomChange();
  
        const postButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(postButton);
  
        expect(apiCalls.postTopic).toHaveBeenCalledWith({
          content: 'Test topic content',
          attachment: {
            id: 1,
            name: 'random-name.png'
          }
        });
      });
      it('clears image after postTopic success', async () => {
        apiCalls.postTopicFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png'
          }
        });
        const { queryByText, container } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
  
        const file = new File(['dummy content'], 'example.png', {
          type: 'image/png'
        });
        fireEvent.change(uploadInput, { target: { files: [file] } });
  
        await waitForDomChange();
  
        const postButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.click(postButton);
  
        await waitForDomChange();
  
        fireEvent.focus(textArea);
        const images = container.querySelectorAll('img');
        expect(images.length).toBe(1);
      });
      it('calls postTopic without file attachment after cancelling previous file selection', async () => {
        apiCalls.postTopicFile = jest.fn().mockResolvedValue({
          data: {
            id: 1,
            name: 'random-name.png'
          }
        });
        const { queryByText, container } = setupFocused();
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
  
        const uploadInput = container.querySelector('input');
        expect(uploadInput.type).toBe('file');
  
        const file = new File(['dummy content'], 'example.png', {
          type: 'image/png'
        });
        fireEvent.change(uploadInput, { target: { files: [file] } });
  
        await waitForDomChange();
  
        fireEvent.click(queryByText('Cancel'));
        fireEvent.focus(textArea);
  
        const postButton = queryByText('Post');
  
        apiCalls.postTopic = jest.fn().mockResolvedValue({});
        fireEvent.change(textArea, { target: { value: 'Test topic content' } });
        fireEvent.click(postButton);
  
        expect(apiCalls.postTopic).toHaveBeenCalledWith({
          content: 'Test topic content'
        });
      });
  });
});

console.error = () => {};