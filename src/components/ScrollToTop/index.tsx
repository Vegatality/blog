import React from 'react';

import { useScrollToTop } from '~/hooks/useScrollToTop';

import { Button } from './styles';

const ScrollToTop = () => {
  const { isVisible, scrollToTop } = useScrollToTop();

  return (
    <>
      {isVisible && (
        <Button type='button' onClick={scrollToTop}>
          ▲
        </Button>
      )}
    </>
  );
};

export default ScrollToTop;
