const checkIfInstanceIsDisposed = instanceDisposed => {
  if (instanceDisposed) {
    throw new Error(
      "This instance is already disposed. Please create new instance and try again."
    );
  }
};

export default checkIfInstanceIsDisposed;
