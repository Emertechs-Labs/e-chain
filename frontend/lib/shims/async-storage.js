// Minimal shim for @react-native-async-storage/async-storage for web builds
// Exports the async-storage API surface as no-ops or simple localStorage wrappers
const AsyncStorage = {
  getItem: async (key) => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  clear: async () => {
    try {
      localStorage.clear();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

module.exports = AsyncStorage;
