import React from 'react';
import { render } from '@testing-library/react';
import TopicView from './TopicView';
import { MemoryRouter } from 'react-router-dom';

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

const setup = (topic = topicWithAttachment) => {
  const oneMinute = 60 * 1000;
  const date = new Date(new Date() - oneMinute);
topic.date = date;
  return render(
    <MemoryRouter>
      <TopicView topic={topic} />
    </MemoryRouter>
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
  });
});