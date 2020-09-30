const { assert } = require('chai');

const { lookupEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    ID: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    ID: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('lookupEmail', function() {
  it('should return a user with valid email', function() {
    const user = lookupEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return false with invalid email', function() {
    const user = lookupEmail("test@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
});