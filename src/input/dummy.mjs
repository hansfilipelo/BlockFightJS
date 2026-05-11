class DummyInputHandler {
  constructor(input_interceptor) {
    this.interceptor_ = input_interceptor;
  }
}

export function createInputHandler(input_interceptor) {
  return new DummyInputHandler(input_interceptor);
}

export default createInputHandler;
