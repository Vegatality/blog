import { styled } from '~/stitches.config';

export const Button = styled('button', {
  position: 'fixed',
  bottom: '1rem',
  right: '1rem',
  zIndex: 1000,
  width: '2rem',
  height: '2rem',
  padding: 0,
  border: 0,
  borderRadius: '50%',
  backgroundColor: '$background',
  color: '$text500',
  fontSize: '1.5rem',
  cursor: 'pointer',
  transition: 'background-color $transitionDuration $transitionTiming, color $transitionDuration $transitionTiming',
  appearance: 'none',

  '&:hover': {
    backgroundColor: '$backgroundHover',
    color: '$text200',
  },
});
