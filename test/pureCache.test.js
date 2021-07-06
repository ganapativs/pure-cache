import chai, { expect } from "chai";
import { spy } from "sinon";
import sinonChai from "sinon-chai";
import PureCache from "../src/pureCache";

chai.use(sinonChai);

describe("PureCache ✨", () => {
  it("should default export be a function", () => {
    expect(PureCache).to.be.a("function");
  });

  let instance;

  beforeEach(() => {
    instance = new PureCache();
  });

  afterEach(() => {
    if (!instance.disposed) instance.dispose();
  });

  describe("Instance creation", () => {
    it("should have a empty cache store", () => {
      expect(instance).to.have.a.property("cacheStore").that.is.a("object");
    });

    it("should have `on` method", () => {
      expect(instance).to.have.a.property("on").that.is.a("function");
    });

    it("should have `off` method", () => {
      expect(instance).to.have.a.property("off").that.is.a("function");
    });

    it("should have `emit` method", () => {
      expect(instance).to.have.a.property("emit").that.is.a("function");
    });

    it("should have a expirer instance", () => {
      expect(instance).to.have.a.property("cacheExpirer").that.is.a("object");
    });
  });

  describe("Put data", () => {
    it("Single key & value", () => {
      const key = "foo";
      const value = "bar";
      const expireIn = 2000;

      instance.put(key, value, expireIn);

      expect(instance.cacheStore[key])
        .to.have.a.property("value")
        .that.is.equals(value);
    });

    it("Multiple keys & values", () => {
      const key1 = "foo";
      const value1 = "bar";
      const expireIn1 = 2000;

      const key2 = "👉";
      const value2 = "🎉";
      const expireIn2 = 5000;

      instance.put(key1, value1, expireIn1);
      instance.put(key2, value2, expireIn2);

      expect(Object.keys(instance.cacheStore).length).to.be.equals(2);
    });
  });

  describe("Event should be emitted when data is put", () => {
    it("Single key & value - Check key", () => {
      const key = "foo";
      const value = "bar";
      const expireIn = 2000;
      const onAdd = spy();

      instance.on("add", onAdd);
      instance.put(key, value, expireIn);
      const calledWith = onAdd.getCall(0).args[0];

      expect(calledWith).to.have.a.property("key").that.is.equals(key);
    });

    it("Single key & value - Check value", () => {
      const key = "foo";
      const value = "bar";
      const expireIn = 2000;
      const onAdd = spy();

      instance.on("add", onAdd);
      instance.put(key, value, expireIn);
      const calledWith = onAdd.getCall(0).args[0];

      expect(calledWith).to.have.deep.nested.property("data.value", value);
    });

    it("Single key & value - Check addedAt", () => {
      const key = "foo";
      const value = "bar";
      const expireIn = 2000;
      const onAdd = spy();

      instance.on("add", onAdd);
      instance.put(key, value, expireIn);
      const calledWith = onAdd.getCall(0).args[0];

      expect(calledWith).to.have.deep.nested.property("data.addedAt");
    });

    it("Single key & value - Check expiryAt", () => {
      const key = "foo";
      const value = "bar";
      const expireIn = 2000;
      const onAdd = spy();

      instance.on("add", onAdd);
      instance.put(key, value, expireIn);
      const calledWith = onAdd.getCall(0).args[0];

      expect(calledWith).to.have.deep.nested.property("data.expiryAt");
    });

    it("Multiple keys & values", () => {
      const key1 = "foo";
      const value1 = "bar";
      const expireIn1 = 2000;

      const key2 = "👉";
      const value2 = "🎉";
      const expireIn2 = 5000;

      const onAdd = spy();
      instance.on("add", onAdd);

      instance.put(key1, value1, expireIn1);
      instance.put(key2, value2, expireIn2);

      // eslint-disable-next-line no-unused-expressions
      expect(onAdd).calledTwice;
    });
  });

  describe("Event should be emitted when data is retrieved", () => {
    it("Single key", () => {
      const key = "foo";
      const value = "bar";
      const expireIn = 2000;
      const onGet = spy();

      instance.on("get", onGet);
      instance.put(key, value, expireIn);
      instance.get(key);

      // eslint-disable-next-line no-unused-expressions
      expect(onGet).calledOnce;
    });
  });

  describe("Remove data", function removeData() {
    this.timeout(6500); // eslint-disable-line babel/no-invalid-this

    it("Single key", (done) => {
      this.timeout(2500); // eslint-disable-line babel/no-invalid-this

      const key = "foo";
      const value = "bar";
      const expireIn = 2000;

      instance.put(key, value, expireIn);

      setTimeout(() => {
        instance.remove(key);
        const storeValue = instance.get(key);
        expect(storeValue).to.be.equals(null);
        done();
      }, 1000);
    });

    it("Multiple keys", (done) => {
      this.timeout(5500); // eslint-disable-line babel/no-invalid-this
      const key1 = "foo";
      const value1 = "bar";
      const expireIn1 = 2000;

      const key2 = "👉";
      const value2 = "🎉";
      const expireIn2 = 5000;

      instance.put(key1, value1, expireIn1);
      instance.put(key2, value2, expireIn2);

      setTimeout(() => {
        instance.remove(key1);
        instance.remove(key2);
        expect(Object.keys(instance.cacheStore).length).to.be.equals(0);
        done();
      }, 1000);
    });
  });

  describe("Event should be emitted when data is removed", function expire() {
    this.timeout(2500); // eslint-disable-line babel/no-invalid-this

    it("Single key", () => {
      const key = "foo";
      const value = "bar";
      const expireIn = 2000;
      const onRemove = spy();

      instance.on("remove", onRemove);
      instance.put(key, value, expireIn);
      instance.remove(key);

      // eslint-disable-next-line no-unused-expressions
      expect(onRemove).calledOnce;
    });
  });

  describe("Data expiry", function removeData() {
    this.timeout(9000); // eslint-disable-line babel/no-invalid-this

    it("Single key & value", (done) => {
      this.timeout(2500); // eslint-disable-line babel/no-invalid-this

      const key = "foo";
      const value = "bar";
      const expireIn = 2000;

      instance.put(key, value, expireIn);

      setTimeout(() => {
        expect(Object.keys(instance.cacheStore).length).to.be.equals(0);
        done();
      }, 2500);
    });

    it("Multiple keys & values", (done) => {
      this.timeout(6000); // eslint-disable-line babel/no-invalid-this
      const key1 = "foo";
      const value1 = "bar";
      const expireIn1 = 2000;

      const key2 = "👉";
      const value2 = "🎉";
      const expireIn2 = 5000;

      instance.put(key1, value1, expireIn1);
      instance.put(key2, value2, expireIn2);

      setTimeout(() => {
        expect(Object.keys(instance.cacheStore).length).to.be.equals(0);
        done();
      }, 5500);
    });
  });

  describe("Event should be emitted when data expires", function expire() {
    this.timeout(3000); // eslint-disable-line babel/no-invalid-this

    it("Single key", (done) => {
      this.timeout(2500); // eslint-disable-line babel/no-invalid-this

      const key = "foo";
      const value = "bar";
      const expireIn = 2000;
      const onExpiry = spy();

      instance.on("expiry", onExpiry);
      instance.put(key, value, expireIn);

      setTimeout(() => {
        // eslint-disable-next-line no-unused-expressions
        expect(onExpiry).calledOnce;
        done();
      }, 2500);
    });
  });

  describe("Instance dispose", () => {
    it("Should set `disposed` to `true` when instance is disposed", () => {
      instance.dispose();

      expect(instance.disposed).to.be.equals(true);
    });

    it("cacheStore should be empty object when instance is disposed", () => {
      instance.dispose();

      expect(instance.cacheStore).to.be.deep.equals({});
    });

    it("Event should be emitted", () => {
      const onClear = spy();
      instance.on("clear", onClear);
      instance.dispose();

      // eslint-disable-next-line no-unused-expressions
      expect(onClear).calledOnce;
    });

    it("Should throw error when disposed instance is re-used", () => {
      instance.dispose();

      const key = "foo";
      const value = "bar";
      const expireIn = 2000;

      expect(() => instance.put(key, value, expireIn)).to.throw(Error);
    });
  });
});
