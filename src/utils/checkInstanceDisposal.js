const checkIfInstanceIsDisposed = instanceDisposed => {
  if (instanceDisposed) {
    throw new Error("Cannot use disposed instance.");
  }
};

export default checkIfInstanceIsDisposed;
