import chai, { expect } from "chai";
import { spy } from "sinon";
import sinonChai from "sinon-chai";
import InMemoryExpirer from "../src/inMemoryExpirer";

chai.use(sinonChai);

describe("InMemoryExpirer ⏳", () => {
  it("should default export be a function", () => {
    expect(InMemoryExpirer).to.be.a("function");
  });

  let instance;

  beforeEach(() => {
    instance = new InMemoryExpirer();
  });

  afterEach(() => {
    if (!instance.disposed) instance.dispose();
  });

  describe("Instance creation", () => {
    it("should be a empty queue", () => {
      expect(instance).to.have.a.property("queue").that.is.a("object");
    });

    it("should have a timer running", () => {
      expect(instance).to.have.a.property("timer").that.is.a("object");
    });
  });

  describe("Add key(s) to expiry queue", () => {
    it("Single key", () => {
      const expiryTime = Date.now() + 2000;
      const onExpire = spy();
      instance.add(expiryTime, "foo", onExpire);

      expect(instance)
        .to.have.property("queue")
        .that.deep.equals({ [expiryTime]: [{ key: "foo", onExpire }] });
    });

    it("Multiple keys", () => {
      const expiryTime1 = Date.now() + 2000;
      const expiryTime2 = Date.now() + 5000;
      const expiryTime3 = Date.now() + 2000;
      const onExpire1 = spy();
      const onExpire2 = spy();
      const onExpire3 = spy();
      instance.add(expiryTime1, "foo", onExpire1);
      instance.add(expiryTime2, "bar", onExpire2);
      instance.add(expiryTime3, "xyz", onExpire3);

      expect(instance)
        .to.have.property("queue")
        .that.deep.equals({
          [expiryTime1]: [
            { key: "foo", onExpire: onExpire1 },
            { key: "xyz", onExpire: onExpire3 },
          ],
          [expiryTime2]: [{ key: "bar", onExpire: onExpire2 }],
        });
    });
  });

  describe("Remove key(s) from expiry queue", () => {
    it("Single key", (done) => {
      const expiryTime = Date.now() + 2000;
      const onExpire = spy();
      instance.add(expiryTime, "foo", onExpire);

      setTimeout(() => {
        instance.remove(expiryTime, "foo");

        expect(instance).to.have.property("queue").that.deep.equals({});
        done();
      }, 200);
    });

    it("Multiple keys", (done) => {
      const expiryTime1 = Date.now() + 2000;
      const expiryTime2 = Date.now() + 5000;
      const expiryTime3 = Date.now() + 2000;
      const onExpire1 = spy();
      const onExpire2 = spy();
      const onExpire3 = spy();
      instance.add(expiryTime1, "foo", onExpire1);
      instance.add(expiryTime2, "bar", onExpire2);
      instance.add(expiryTime3, "xyz", onExpire3);

      setTimeout(() => {
        instance.remove(expiryTime1, "foo");
        instance.remove(expiryTime2, "bar");

        expect(instance)
          .to.have.property("queue")
          .that.deep.equals({
            [expiryTime3]: [{ key: "xyz", onExpire: onExpire3 }],
          });
        done();
      }, 200);
    });
  });

  describe("Expiry of key(s)", function expiry() {
    this.timeout(6000); // eslint-disable-line babel/no-invalid-this

    it("Single key", (done) => {
      const expiryTime = Date.now() + 2000;
      const onExpire = spy();
      instance.add(expiryTime, "foo", onExpire);

      setTimeout(() => {
        expect(instance).to.have.property("queue").that.deep.equals({});
        done();
      }, 2500);
    });

    it("Single key - onExpiry handler called", function singleKeyExpiry(done) {
      this.timeout(3000); // eslint-disable-line babel/no-invalid-this

      const expiryTime = Date.now() + 2000;
      const onExpire = spy();
      instance.add(expiryTime, "foo", onExpire);

      setTimeout(() => {
        expect(onExpire).to.be.calledOnceWithExactly("foo");
        done();
      }, 2500);
    });

    it("Multiple keys", (done) => {
      const expiryTime1 = Date.now() + 2000;
      const expiryTime2 = Date.now() + 5000;
      const expiryTime3 = Date.now() + 3000;
      const onExpire1 = spy();
      const onExpire2 = spy();
      const onExpire3 = spy();
      instance.add(expiryTime1, "foo", onExpire1);
      instance.add(expiryTime2, "bar", onExpire2);
      instance.add(expiryTime3, "xyz", onExpire3);

      setTimeout(() => {
        expect(instance)
          .to.have.property("queue")
          .that.deep.equals({
            [expiryTime2]: [{ key: "bar", onExpire: onExpire2 }],
          });
        done();
      }, 3500);
    });
  });

  describe("Instance dispose", () => {
    it("Should set `disposed` to `true` when instance is disposed", () => {
      instance.dispose();

      expect(instance.disposed).to.be.equals(true);
    });

    it("Timer should be cleared when instance is disposed", () => {
      instance.dispose();

      expect(instance.timer).to.be.equals(null);
    });

    it("Expiry queue should be set to empty object when instance is disposed", () => {
      instance.dispose();

      expect(instance.queue).to.be.deep.equals({});
    });

    it("Should throw error when disposed instance is re-used", () => {
      instance.dispose();

      const expiryTime = Date.now() + 2000;
      const onExpire = spy();

      expect(() => instance.add(expiryTime, "foo", onExpire)).to.throw(Error);
    });
  });
});
