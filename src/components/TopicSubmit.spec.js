import React from 'react';
import { render } from '@testing-library/react';
import TopicSubmit from './TopicSubmit';

describe('TopicSubmit', () => {
  describe('Layout', () => {
    it('has textarea', () => {
      const { container } = render(<TopicSubmit />);
      const textArea = container.querySelector('textarea');
      expect(textArea).toBeInTheDocument();
    });
    it('has image', () => {
      const { container } = render(<TopicSubmit />);
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
    it('has textarea', () => {
      const { container } = render(<TopicSubmit />);
      const textArea = container.querySelector('textarea');
      expect(textArea.rows).toBe(1);
    });
  });
});