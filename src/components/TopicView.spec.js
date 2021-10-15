import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TopicView from './TopicView';
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

const loggedInStateUser2 = {
  id: 2,
  username: 'user2',
  displayName: 'display2',
  image: 'profile2.png',
  password: 'P4ssword',
  isLoggedIn: true
};

const topicWithoutAttachment = {
  id: 10,
  content: 'This is the first topic',
  user: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png'
  }
};

const topicWithAttachment = {
  id: 10,
  content: 'This is the first topic',
  user: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png'
  },
  attachment: {
    fileType: 'image/png',
    name: 'attached-image.png'
  }
};

const topicWithPdfAttachment = {
  id: 10,
  content: 'This is the first topic',
  user: {
    id: 1,
    username: 'user1',
    displayName: 'display1',
    image: 'profile1.png'
  },
  attachment: {
    fileType: 'application/pdf',
    name: 'attached.pdf'
  }
};

const setup = (topic = topicWithAttachment, state = loggedInStateUser1) => {
  const oneMinute = 60 * 1000;
  const date = new Date(new Date() - oneMinute);
  topic.date = date;
  const store = createStore(authReducer, state);
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <TopicView topic={topic} />
      </MemoryRouter>
    </Provider>
  );
};

describe('TopicView', () => {
  describe('Layout', () => {
    it('displays topic content', () => {
      const { queryByText } = setup();
      expect(queryByText('This is the first topic')).toBeInTheDocument();
    });
    it('displays users image', () => {
      const { container } = setup();
      const image = container.querySelector('img');
      expect(image.src).toContain('/images/profile/profile1.png');
    });
    it('displays displayName@user', () => {
      const { queryByText } = setup();
      expect(queryByText('display1@user1')).toBeInTheDocument();
    });
    it('displays relative time', () => {
      const { queryByText } = setup();
      expect(queryByText('1 minute ago')).toBeInTheDocument();
    });
    it('has link to user page', () => {
      const { container } = setup();
      const anchor = container.querySelector('a');
      expect(anchor.getAttribute('href')).toBe('/user1');
    });
    it('displays file attachment image', () => {
      const { container } = setup(topicWithAttachment);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(2);
    });
    it('does not displays file attachment when attachment type is not image', () => {
      const { container } = setup(topicWithPdfAttachment);
      const images = container.querySelectorAll('img');
      expect(images.length).toBe(1);
    });
    it('sets the attachment path as source for file attachment image', () => {
      const { container } = setup(topicWithAttachment);
      const images = container.querySelectorAll('img');
      const attachmentImage = images[1];
      expect(attachmentImage.src).toContain(
        '/images/attachments/' + topicWithAttachment.attachment.name
      );
    });
    it('displays delete button when topic owned by logged in user', () => {
      const { container } = setup();
      expect(container.querySelector('button')).toBeInTheDocument();
    });
    it('does not display delete button when topic is not owned by logged in user', () => {
      const { container } = setup(topicWithoutAttachment, loggedInStateUser2);
      expect(container.querySelector('button')).not.toBeInTheDocument();
    });
    it('does not show the dropdown menu when not clicked', () => {
      const { queryByTestId } = setup();
      const dropDownMenu = queryByTestId('topic-action-dropdown');
      expect(dropDownMenu).not.toHaveClass('show');
    });
    it('shows the dropdown menu after clicking the indicator', () => {
      const { queryByTestId } = setup();
      const indicator = queryByTestId('topic-actions');
      fireEvent.click(indicator);
      const dropDownMenu = queryByTestId('topic-action-dropdown');
      expect(dropDownMenu).toHaveClass('show');
    });
  });
});