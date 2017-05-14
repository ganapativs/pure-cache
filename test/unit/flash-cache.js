import flashCache from '../../src/flash-cache';

describe('flashCache', () => {
  describe('Greet function', () => {
    beforeEach(() => {
      spy(flashCache, 'greet');
      flashCache.greet();
    });

    it('should have been run once', () => {
      expect(flashCache.greet).to.have.been.calledOnce;
    });

    it('should have always returned hello', () => {
      expect(flashCache.greet).to.have.always.returned('hello');
    });
  });
});
