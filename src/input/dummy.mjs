class DummyInputHandler {
  constructor(input_interceptor) {
    this.interceptor_ = input_interceptor;
  }
}

export default function (input_interceptor) {
  return new DummyInputHandler(input_interceptor);
}
